import json
import time
import uuid
from openai import OpenAI
from supabase import Client
from app.config import settings
from app.prompts.mining import build_mining_prompt

_openai: OpenAI | None = None

MODEL = "gpt-4o-mini"
PROMPT_VERSION = "v1"

# gpt-4o-mini pricing (per 1K tokens)
COST_PER_1K_INPUT = 0.00015
COST_PER_1K_OUTPUT = 0.0006


def get_openai() -> OpenAI:
    global _openai
    if _openai is None:
        _openai = OpenAI(api_key=settings.openai_api_key)
    return _openai


async def generate_ideas(
    supabase: Client,
    user_id: str,
    tier: str,
    vein_id: str,
    keywords: list[dict],
    language: str,
    source: str = "app",
) -> list[dict]:
    """OpenAI로 아이디어 10개 생성 + DB 저장 + 비용 로깅."""
    session_id = str(uuid.uuid4())
    has_ai_keyword = any(kw["category"] == "ai" for kw in keywords)

    prompt = build_mining_prompt(keywords, language, has_ai_keyword)

    client = get_openai()
    start_time = time.time()

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.9,
            response_format={"type": "json_object"},
        )

        elapsed_ms = int((time.time() - start_time) * 1000)
        content = response.choices[0].message.content

        ideas_raw = json.loads(content)
        if isinstance(ideas_raw, dict) and "ideas" in ideas_raw:
            ideas_raw = ideas_raw["ideas"]

        input_tokens = response.usage.prompt_tokens
        output_tokens = response.usage.completion_tokens
        total_cost = (
            input_tokens / 1000 * COST_PER_1K_INPUT
            + output_tokens / 1000 * COST_PER_1K_OUTPUT
        )

        await _log_ai_usage(
            supabase,
            user_id=user_id,
            tier=tier,
            session_id=session_id,
            feature_type="mining",
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_cost=total_cost,
            response_time_ms=elapsed_ms,
            status="success",
            language=language,
            source=source,
        )

    except Exception as e:
        elapsed_ms = int((time.time() - start_time) * 1000)
        await _log_ai_usage(
            supabase,
            user_id=user_id,
            tier=tier,
            session_id=session_id,
            feature_type="mining",
            input_tokens=0,
            output_tokens=0,
            total_cost=0,
            response_time_ms=elapsed_ms,
            status="error",
            language=language,
            source=source,
        )
        raise

    # 광맥을 selected로 표시
    supabase.table("veins").update({"is_selected": True}).eq("id", vein_id).execute()

    # slug -> keyword 매핑 (정확 매칭 + 정규화 fallback)
    kw_slug_map = {kw["slug"]: kw for kw in keywords}
    # 정규화된 slug로도 매핑 (하이픈/언더스코어/대소문자 무시)
    kw_slug_normalized = {
        kw["slug"].lower().replace("-", "").replace("_", ""): kw
        for kw in keywords
    }

    def _resolve_slug(slug: str) -> dict | None:
        """slug 매칭: 정확 → 정규화 순으로 시도."""
        if slug in kw_slug_map:
            return kw_slug_map[slug]
        normalized = slug.lower().replace("-", "").replace("_", "")
        return kw_slug_normalized.get(normalized)

    # ideas 테이블에 저장
    saved_ideas = []
    for idea in ideas_raw:
        used_kws = [
            kw for slug in idea.get("used_keywords", [])
            if (kw := _resolve_slug(slug)) is not None
        ]
        # fallback: 매칭된 키워드가 없으면 전체 키워드 사용
        if not used_kws:
            used_kws = keywords

        row = (
            supabase.table("ideas")
            .insert({
                "user_id": user_id,
                "vein_id": vein_id,
                "title": idea["title"],
                "summary": idea["summary"],
                "keyword_combo": [
                    {
                        "slug": kw["slug"],
                        "ko": kw["ko"],
                        "en": kw["en"],
                        "category": kw["category"],
                    }
                    for kw in used_kws
                ],
                "tier_type": idea.get("tier_type", "stable"),
                "sort_order": idea.get("sort_order", 1),
                "language": language,
            })
            .execute()
        )

        saved_ideas.append(row.data[0])

    return saved_ideas


async def _log_ai_usage(supabase: Client, **fields) -> None:
    """AI 비용을 ai_usage_logs에 기록."""
    supabase.table("ai_usage_logs").insert({
        "user_id": fields["user_id"],
        "tier": fields["tier"],
        "session_id": fields["session_id"],
        "feature_type": fields["feature_type"],
        "model": MODEL,
        "prompt_version": PROMPT_VERSION,
        "input_tokens": fields["input_tokens"],
        "output_tokens": fields["output_tokens"],
        "total_cost_usd": fields["total_cost"],
        "response_time_ms": fields["response_time_ms"],
        "status": fields["status"],
        "language": fields["language"],
        "source": fields.get("source", "app"),
    }).execute()
