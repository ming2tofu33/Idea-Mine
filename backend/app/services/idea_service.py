import json
import time
import uuid
from openai import OpenAI
from supabase import Client
from app.config import settings
from app.prompts.mining import build_mining_prompt
from app.services.combo_builder import build_keyword_combos

_openai: OpenAI | None = None

MODEL = "gpt-5-nano"
PROMPT_VERSION = "v2"

COST_PER_1K_INPUT = 0.00005
COST_PER_1K_OUTPUT = 0.0004


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
    """v2: Python 키워드 선택 + LLM 한/영 생성."""
    session_id = str(uuid.uuid4())
    has_ai_keyword = any(kw["category"] == "ai" for kw in keywords)

    combos = build_keyword_combos(keywords, has_ai_keyword)
    prompt = build_mining_prompt(combos)

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

    supabase.table("veins").update({"is_selected": True}).eq("id", vein_id).execute()

    ideas_by_order = {idea["sort_order"]: idea for idea in ideas_raw}

    rows_to_insert = []
    for combo in combos:
        order = combo["sort_order"]
        idea_text = ideas_by_order.get(order, {})
        rows_to_insert.append({
            "user_id": user_id,
            "vein_id": vein_id,
            "title_ko": idea_text.get("title_ko", "제목 없음"),
            "title_en": idea_text.get("title_en", "Untitled"),
            "summary_ko": idea_text.get("summary_ko", "요약 없음"),
            "summary_en": idea_text.get("summary_en", "No summary"),
            "keyword_combo": combo["keywords"],
            "tier_type": combo["tier_type"],
            "sort_order": order,
        })

    result = supabase.table("ideas").insert(rows_to_insert).execute()
    return result.data


async def _log_ai_usage(supabase: Client, **fields) -> None:
    supabase.table("ai_usage_logs").insert({
        "user_id": fields["user_id"],
        "tier": fields["tier"],
        "session_id": fields["session_id"],
        "feature_type": fields["feature_type"],
        "feature_variant": fields.get("feature_variant"),
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
