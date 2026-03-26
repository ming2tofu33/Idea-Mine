import json
import time
import uuid
from openai import OpenAI
from supabase import Client
from app.config import settings
from app.prompts.concept import build_concept_prompt
from app.prompts.overview import build_overview_prompt
from app.services.market_research import research_market

_openai: OpenAI | None = None

# Step 1 (concept): 가벼운 모델로 방향 잡기
CONCEPT_MODEL = "gpt-4o-mini"
CONCEPT_COST_INPUT = 0.00015
CONCEPT_COST_OUTPUT = 0.0006

# Step 2 (overview): 품질 모델로 본문 작성
OVERVIEW_MODEL = "gpt-4o"
OVERVIEW_COST_INPUT = 0.0025
OVERVIEW_COST_OUTPUT = 0.01

PROMPT_VERSION = "overview-v4-pipeline"


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
    client = get_openai()

    # ── Step 0: Tavily 시장 조사 ──
    market_data = await research_market(
        title_en=idea["title_en"],
        summary_en=idea["summary_en"],
        keywords=idea["keyword_combo"],
    )

    # ── Step 1: Concept 생성 (gpt-4o-mini) ──
    concept_prompt = build_concept_prompt(
        title_en=idea["title_en"],
        summary_en=idea["summary_en"],
        keywords=idea["keyword_combo"],
    )

    step1_start = time.time()
    step1_response = client.chat.completions.create(
        model=CONCEPT_MODEL,
        messages=[{"role": "user", "content": concept_prompt}],
        temperature=0.5,
        response_format={"type": "json_object"},
    )
    step1_elapsed = int((time.time() - step1_start) * 1000)
    concept = json.loads(step1_response.choices[0].message.content)

    step1_input = step1_response.usage.prompt_tokens
    step1_output = step1_response.usage.completion_tokens
    step1_cost = (
        step1_input / 1000 * CONCEPT_COST_INPUT
        + step1_output / 1000 * CONCEPT_COST_OUTPUT
    )

    await _log_ai_usage(
        supabase,
        user_id=user_id,
        tier=tier,
        session_id=session_id,
        feature_type="overview",  # TODO: DB constraint에 "overview-concept" 추가 후 복원
        model=CONCEPT_MODEL,
        input_tokens=step1_input,
        output_tokens=step1_output,
        total_cost=step1_cost,
        response_time_ms=step1_elapsed,
        status="success",
        source=source,
    )

    # ── Step 2: Full Overview (gpt-4o) ──
    overview_prompt = build_overview_prompt(
        title_en=idea["title_en"],
        summary_en=idea["summary_en"],
        keywords=idea["keyword_combo"],
        market_research=market_data,
        concept=concept,
    )

    step2_start = time.time()
    try:
        step2_response = client.chat.completions.create(
            model=OVERVIEW_MODEL,
            messages=[{"role": "user", "content": overview_prompt}],
            temperature=0.7,
            response_format={"type": "json_object"},
        )
        step2_elapsed = int((time.time() - step2_start) * 1000)
        result = json.loads(step2_response.choices[0].message.content)

        step2_input = step2_response.usage.prompt_tokens
        step2_output = step2_response.usage.completion_tokens
        step2_cost = (
            step2_input / 1000 * OVERVIEW_COST_INPUT
            + step2_output / 1000 * OVERVIEW_COST_OUTPUT
        )

        await _log_ai_usage(
            supabase,
            user_id=user_id,
            tier=tier,
            session_id=session_id,
            feature_type="overview",  # TODO: DB constraint에 "overview-full" 추가 후 복원
            model=OVERVIEW_MODEL,
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
            feature_type="overview",  # TODO: DB constraint에 "overview-full" 추가 후 복원
            model=OVERVIEW_MODEL,
            input_tokens=0,
            output_tokens=0,
            total_cost=0,
            response_time_ms=step2_elapsed,
            status="error",
            source=source,
        )
        raise

    row = (
        supabase.table("overviews")
        .insert({
            "user_id": user_id,
            "idea_id": idea["id"],
            "concept_ko": result.get("concept_ko", concept.get("concept_ko", "")),
            "concept_en": result.get("concept_en", concept.get("concept_en", "")),
            "problem_ko": result.get("problem_ko", ""),
            "problem_en": result.get("problem_en", ""),
            "target_ko": result.get("target_ko", ""),
            "target_en": result.get("target_en", ""),
            "features_ko": result.get("features_ko", ""),
            "features_en": result.get("features_en", ""),
            "differentiator_ko": result.get("differentiator_ko", ""),
            "differentiator_en": result.get("differentiator_en", ""),
            "revenue_ko": result.get("revenue_ko", ""),
            "revenue_en": result.get("revenue_en", ""),
            "mvp_scope_ko": result.get("mvp_scope_ko", ""),
            "mvp_scope_en": result.get("mvp_scope_en", ""),
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
        "model": fields.get("model", OVERVIEW_MODEL),
        "prompt_version": PROMPT_VERSION,
        "input_tokens": fields["input_tokens"],
        "output_tokens": fields["output_tokens"],
        "total_cost_usd": fields["total_cost"],
        "response_time_ms": fields["response_time_ms"],
        "status": fields["status"],
        "language": "ko",
        "source": fields.get("source", "app"),
    }).execute()
