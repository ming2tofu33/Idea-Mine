import json
import time
import uuid
from openai import OpenAI
from supabase import Client
from app.config import settings
from app.prompts.full_overview import (
    build_full_overview_narrative_prompt,
    build_full_overview_technical_prompt,
)
from app.services.market_research import research_market

_openai: OpenAI | None = None

MODEL = "gpt-4o"
COST_PER_1K_INPUT = 0.0025
COST_PER_1K_OUTPUT = 0.01
PROMPT_VERSION = "full-overview-v1"


def get_openai() -> OpenAI:
    global _openai
    if _openai is None:
        _openai = OpenAI(api_key=settings.openai_api_key)
    return _openai


async def generate_full_overview(
    supabase: Client,
    user_id: str,
    tier: str,
    overview: dict,
    idea: dict,
    source: str = "app",
) -> dict:
    """풀 개요서 생성: 라이트 개요서 기반 2단계 파이프라인.

    Step 1 (Narrative): 비전 + 제품 + 비즈니스 블록
    Step 2 (Technical): 기술 블록 (스택, DB, API, 파일구조, 인증)
    """
    session_id = str(uuid.uuid4())
    client = get_openai()

    # concept 복원 (라이트 개요서에서)
    concept = {
        "concept_en": overview.get("concept_en", ""),
        "concept_ko": overview.get("concept_ko", ""),
        "product_type": _infer_product_type(overview),
        "primary_user_en": overview.get("target_en", "").split(".")[0] if overview.get("target_en") else "",
        "core_experience_en": overview.get("features_en", "").split("—")[0] if overview.get("features_en") else "",
    }

    # 시장 리서치 재활용
    market_data = await research_market(
        title_en=idea["title_en"],
        summary_en=idea["summary_en"],
        keywords=idea["keyword_combo"],
    )

    # ── Step 1: Narrative (비전 + 제품 + 비즈니스) ──
    narrative_prompt = build_full_overview_narrative_prompt(
        concept=concept,
        light_overview=overview,
        market_research=market_data,
    )

    step1_start = time.time()
    step1_response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": narrative_prompt}],
        temperature=0.5,
        response_format={"type": "json_object"},
    )
    step1_elapsed = int((time.time() - step1_start) * 1000)
    narrative = json.loads(step1_response.choices[0].message.content)

    step1_input = step1_response.usage.prompt_tokens
    step1_output = step1_response.usage.completion_tokens
    step1_cost = (
        step1_input / 1000 * COST_PER_1K_INPUT
        + step1_output / 1000 * COST_PER_1K_OUTPUT
    )

    await _log_ai_usage(
        supabase,
        user_id=user_id,
        tier=tier,
        session_id=session_id,
        feature_type="full_overview",
        feature_variant="narrative",
        input_tokens=step1_input,
        output_tokens=step1_output,
        total_cost=step1_cost,
        response_time_ms=step1_elapsed,
        status="success",
        source=source,
    )

    # ── Step 2: Technical (기술 블록) ──
    technical_prompt = build_full_overview_technical_prompt(
        concept=concept,
        narrative=narrative,
    )

    step2_start = time.time()
    try:
        step2_response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": technical_prompt}],
            temperature=0.3,
            response_format={"type": "json_object"},
        )
        step2_elapsed = int((time.time() - step2_start) * 1000)
        technical = json.loads(step2_response.choices[0].message.content)

        step2_input = step2_response.usage.prompt_tokens
        step2_output = step2_response.usage.completion_tokens
        step2_cost = (
            step2_input / 1000 * COST_PER_1K_INPUT
            + step2_output / 1000 * COST_PER_1K_OUTPUT
        )

        await _log_ai_usage(
            supabase,
            user_id=user_id,
            tier=tier,
            session_id=session_id,
            feature_type="full_overview",
            feature_variant="technical",
            input_tokens=step2_input,
            output_tokens=step2_output,
            total_cost=step2_cost,
            response_time_ms=step2_elapsed,
            status="success",
            source=source,
        )

    except Exception:
        step2_elapsed = int((time.time() - step2_start) * 1000)
        await _log_ai_usage(
            supabase,
            user_id=user_id,
            tier=tier,
            session_id=session_id,
            feature_type="full_overview",
            feature_variant="technical",
            input_tokens=0,
            output_tokens=0,
            total_cost=0,
            response_time_ms=step2_elapsed,
            status="error",
            source=source,
        )
        raise

    # 결과 합치기 (narrative + technical)
    full_result = {**narrative, **technical}

    # DB 저장
    row = (
        supabase.table("full_overviews")
        .insert({
            "user_id": user_id,
            "overview_id": overview["id"],
            # Narrative
            "concept": narrative.get("concept", ""),
            "problem": narrative.get("problem", ""),
            "target_user": narrative.get("target_user", ""),
            "features_must": _as_string_list(narrative.get("features_must", [])),
            "features_should": _as_string_list(narrative.get("features_should", [])),
            "features_later": _as_string_list(narrative.get("features_later", [])),
            "user_flow": _as_string_list(narrative.get("user_flow", [])),
            "screens": _as_string_list(narrative.get("screens", [])),
            "business_model": narrative.get("business_model", ""),
            "business_rules": _as_string_list(narrative.get("business_rules", [])),
            "mvp_scope": narrative.get("mvp_scope", ""),
            # Technical
            "tech_stack": _as_string_map(technical.get("tech_stack", {})),
            "data_model_sql": technical.get("data_model_sql", ""),
            "api_endpoints": _as_string_list(technical.get("api_endpoints", [])),
            "file_structure": technical.get("file_structure", ""),
            "external_services": _as_string_list(technical.get("external_services", [])),
            "auth_flow": _as_string_list(technical.get("auth_flow", [])),
        })
        .execute()
    )
    return row.data[0]


def _infer_product_type(overview: dict) -> str:
    """개요서 내용에서 B2B/B2C를 추론."""
    text = (overview.get("target_en", "") + " " + overview.get("problem_en", "")).lower()
    b2b_signals = ["business owner", "manager", "enterprise", "company", "b2b", "saas", "dashboard"]
    if any(signal in text for signal in b2b_signals):
        return "B2B"
    return "B2C"


def _as_string_list(value: object) -> list[str]:
    if not isinstance(value, list):
        return []
    return [item for item in value if isinstance(item, str)]


def _as_string_map(value: object) -> dict[str, str]:
    if not isinstance(value, dict):
        return {}
    return {str(key): item for key, item in value.items() if isinstance(item, str)}


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
        "language": "en",
        "source": fields.get("source", "app"),
    }).execute()
