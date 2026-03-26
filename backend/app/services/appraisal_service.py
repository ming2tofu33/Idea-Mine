import json
import time
import uuid
from typing import Literal

from openai import OpenAI
from supabase import Client

from app.config import settings
from app.prompts.appraisal import build_appraisal_prompt

_openai: OpenAI | None = None
MODEL = "gpt-4o"
PROMPT_VERSION = "appraisal-v2"
COST_PER_1K_INPUT = 0.0025
COST_PER_1K_OUTPUT = 0.01


def get_openai() -> OpenAI:
    global _openai
    if _openai is None:
        _openai = OpenAI(api_key=settings.openai_api_key)
    return _openai


async def generate_appraisal(
    supabase: Client,
    user_id: str,
    tier: str,
    overview: dict,
    keywords: list[dict],
    market_research: str,
    depth: Literal["basic_free", "basic", "precise_lite", "precise_pro"] = "basic",
    source: str = "app",
) -> dict:
    session_id = str(uuid.uuid4())

    prompt = build_appraisal_prompt(
        overview=overview,
        keywords=keywords,
        market_research=market_research,
        depth=depth,
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
            feature_type=f"appraisal-{depth}",
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
            feature_type=f"appraisal-{depth}",
            input_tokens=0,
            output_tokens=0,
            total_cost=0,
            response_time_ms=elapsed_ms,
            status="error",
            source=source,
        )
        raise

    # basic_free는 3축만 (market_fit, feasibility, risk)
    # 나머지 depth는 6축 전부
    row_data = {
        "user_id": user_id,
        "overview_id": overview["id"],
        "depth": depth,
        "market_fit_ko": result.get("market_fit_ko", ""),
        "market_fit_en": result.get("market_fit_en", ""),
        "feasibility_ko": result.get("feasibility_ko", ""),
        "feasibility_en": result.get("feasibility_en", ""),
        "risk_ko": result.get("risk_ko", ""),
        "risk_en": result.get("risk_en", ""),
    }

    if depth != "basic_free":
        row_data.update({
            "problem_fit_ko": result.get("problem_fit_ko", ""),
            "problem_fit_en": result.get("problem_fit_en", ""),
            "differentiation_ko": result.get("differentiation_ko", ""),
            "differentiation_en": result.get("differentiation_en", ""),
            "scalability_ko": result.get("scalability_ko", ""),
            "scalability_en": result.get("scalability_en", ""),
        })

    row = supabase.table("appraisals").insert(row_data).execute()
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
        "language": "ko",
        "source": fields.get("source", "app"),
    }).execute()
