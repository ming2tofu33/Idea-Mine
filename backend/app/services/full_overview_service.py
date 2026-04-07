import time
import uuid
from openai import OpenAI
from supabase import Client
from app.config import settings
from app.models.llm_schemas import FullOverviewResponse
from app.prompts.full_overview import build_full_overview_prompt
from app.services.market_research import research_market

_openai: OpenAI | None = None

MODEL = "gpt-5"
COST_PER_1K_INPUT = 0.00125
COST_PER_1K_OUTPUT = 0.01
PROMPT_VERSION = "full-overview-v2"


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
    """풀 개요서 생성: 라이트 개요서 기반 단일 호출 파이프라인.

    서술(narrative) + 기술(technical) 블록을 하나의 LLM 호출로 생성.
    """
    session_id = str(uuid.uuid4())
    client = get_openai()

    # concept 복원 (라이트 개요서에서)
    concept = {
        "concept_en": overview.get("concept_en", ""),
        "concept_ko": overview.get("concept_ko", ""),
        "product_type": overview.get("product_type", "B2C"),
        "primary_user_en": overview.get("target_en", "").split(".")[0] if overview.get("target_en") else "",
        "core_experience_en": overview.get("features_en", "").split("—")[0] if overview.get("features_en") else "",
    }

    # 시장 리서치 재활용
    market_data = await research_market(
        title_en=idea["title_en"],
        summary_en=idea["summary_en"],
        keywords=idea["keyword_combo"],
    )

    # ── Single merged call ──
    system_prompt, user_prompt = build_full_overview_prompt(
        concept=concept,
        light_overview=overview,
        market_research=market_data,
    )

    start_time = time.time()
    try:
        response = client.beta.chat.completions.parse(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.4,
            response_format=FullOverviewResponse,
        )
        elapsed_ms = int((time.time() - start_time) * 1000)

        if response.choices[0].message.refusal:
            raise RuntimeError(f"Model refused: {response.choices[0].message.refusal}")

        result = response.choices[0].message.parsed

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
            feature_type="full_overview",
            feature_variant="merged",
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
            feature_type="full_overview",
            feature_variant="merged",
            input_tokens=0,
            output_tokens=0,
            total_cost=0,
            response_time_ms=elapsed_ms,
            status="error",
            source=source,
        )
        raise

    # DB 저장
    row = (
        supabase.table("full_overviews")
        .insert({
            "user_id": user_id,
            "overview_id": overview["id"],
            "concept": result.concept,
            "problem": result.problem,
            "target_user": result.target_user,
            "features_must": _as_string_list(result.features_must),
            "features_should": _as_string_list(result.features_should),
            "features_later": _as_string_list(result.features_later),
            "user_flow": _as_string_list(result.user_flow),
            "screens": _as_string_list(result.screens),
            "business_model": result.business_model,
            "business_rules": _as_string_list(result.business_rules),
            "mvp_scope": result.mvp_scope,
            "tech_stack": _as_string_map(result.tech_stack),
            "data_model_sql": result.data_model_sql,
            "api_endpoints": _as_string_list(result.api_endpoints),
            "file_structure": result.file_structure,
            "external_services": _as_string_list(result.external_services),
            "auth_flow": _as_string_list(result.auth_flow),
        })
        .execute()
    )
    return row.data[0]


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
