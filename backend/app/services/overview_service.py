import json
import time
import uuid
from openai import OpenAI
from supabase import Client
from app.config import settings
from app.prompts.overview import build_overview_prompt

_openai: OpenAI | None = None
MODEL = "gpt-4o-mini"
PROMPT_VERSION = "overview-v1"
COST_PER_1K_INPUT = 0.00015
COST_PER_1K_OUTPUT = 0.0006


def get_openai() -> OpenAI:
    global _openai
    if _openai is None:
        _openai = OpenAI(api_key=settings.openai_api_key)
    return _openai


async def generate_overview(
    supabase: Client,
    user_id: str,
    tier: str,
    idea: dict,
    source: str = "app",
) -> dict:
    session_id = str(uuid.uuid4())
    prompt = build_overview_prompt(
        title_ko=idea["title_ko"],
        title_en=idea["title_en"],
        summary_ko=idea["summary_ko"],
        summary_en=idea["summary_en"],
        keywords=idea["keyword_combo"],
    )

    client = get_openai()
    start_time = time.time()

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            response_format={"type": "json_object"},
        )
        elapsed_ms = int((time.time() - start_time) * 1000)
        content = response.choices[0].message.content
        result = json.loads(content)

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
            feature_type="overview",
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_cost=total_cost,
            response_time_ms=elapsed_ms,
            status="success",
            source=source,
        )

    except Exception:
        elapsed_ms = int((time.time() - start_time) * 1000)
        await _log_ai_usage(
            supabase,
            user_id=user_id,
            tier=tier,
            session_id=session_id,
            feature_type="overview",
            input_tokens=0,
            output_tokens=0,
            total_cost=0,
            response_time_ms=elapsed_ms,
            status="error",
            source=source,
        )
        raise

    row = (
        supabase.table("overviews")
        .insert({
            "user_id": user_id,
            "idea_id": idea["id"],
            "problem_ko": result.get("problem_ko", ""),
            "problem_en": result.get("problem_en", ""),
            "target_ko": result.get("target_ko", ""),
            "target_en": result.get("target_en", ""),
            "features_ko": result.get("features_ko", ""),
            "features_en": result.get("features_en", ""),
            "revenue_ko": result.get("revenue_ko", ""),
            "revenue_en": result.get("revenue_en", ""),
            "market_score": result.get("market_score", 0),
            "feasibility_score": result.get("feasibility_score", 0),
            "market_comment_ko": result.get("market_comment_ko", ""),
            "market_comment_en": result.get("market_comment_en", ""),
            "feasibility_comment_ko": result.get("feasibility_comment_ko", ""),
            "feasibility_comment_en": result.get("feasibility_comment_en", ""),
        })
        .execute()
    )
    return row.data[0]


async def _log_ai_usage(supabase: Client, **fields) -> None:
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
        "language": "both",
        "source": fields.get("source", "app"),
    }).execute()
