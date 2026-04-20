import time
import uuid

from openai import OpenAI
from supabase import Client

from app.config import settings
from app.models.llm_schemas import ConceptResponse, OverviewResponse
from app.prompts.concept import build_concept_prompt
from app.prompts.overview import build_overview_prompt
from app.services.ideation_v2.overview import build_v2_overview_input
from app.services.market_research import research_market

_openai: OpenAI | None = None

CONCEPT_MODEL = "gpt-5-nano"
CONCEPT_COST_INPUT = 0.00005
CONCEPT_COST_OUTPUT = 0.0004

OVERVIEW_MODEL = "gpt-5-mini"
OVERVIEW_COST_INPUT = 0.00075
OVERVIEW_COST_OUTPUT = 0.0045

PROMPT_VERSION = "overview-v12-money-removed"


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
    idea_line = idea.get("idea_line") or idea["summary"]
    title = idea["title"]
    summary = idea["summary"]
    kernel = None
    family = None

    if settings.ideation_v2_enabled:
        overview_input = build_v2_overview_input(idea, user_tier=tier)
        idea_line = overview_input["idea_line"]
        title = overview_input["title"]
        summary = overview_input["summary"]
        kernel = overview_input["kernel"]
        family = overview_input["family"]

    concept_keywords = [
        kw for kw in idea["keyword_combo"] if kw["category"].lower() != "money"
    ]

    market_data = await research_market(
        title=title,
        summary=summary,
        keywords=concept_keywords,
    )

    system_prompt, user_prompt = build_concept_prompt(
        title=title,
        summary=summary,
        keywords=concept_keywords,
        idea_line=idea_line,
        kernel=kernel,
        family=family,
    )

    step1_start = time.time()
    step1_response = client.beta.chat.completions.parse(
        model=CONCEPT_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format=ConceptResponse,
    )
    step1_elapsed = int((time.time() - step1_start) * 1000)

    if step1_response.choices[0].message.refusal:
        raise RuntimeError(f"Model refused: {step1_response.choices[0].message.refusal}")

    concept = step1_response.choices[0].message.parsed.model_dump()

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
        feature_type="overview",
        feature_variant="concept",
        model=CONCEPT_MODEL,
        input_tokens=step1_input,
        output_tokens=step1_output,
        total_cost=step1_cost,
        response_time_ms=step1_elapsed,
        status="success",
        source=source,
    )

    system_prompt, user_prompt = build_overview_prompt(
        title=title,
        summary=summary,
        keywords=concept_keywords,
        market_research=market_data,
        concept=concept,
        idea_line=idea_line,
        kernel=kernel,
        family=family,
    )

    step2_start = time.time()
    try:
        step2_response = client.beta.chat.completions.parse(
            model=OVERVIEW_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format=OverviewResponse,
        )
        step2_elapsed = int((time.time() - step2_start) * 1000)

        if step2_response.choices[0].message.refusal:
            raise RuntimeError(f"Model refused: {step2_response.choices[0].message.refusal}")

        result = step2_response.choices[0].message.parsed.model_dump()

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
            feature_type="overview",
            feature_variant="full",
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
            feature_type="overview",
            feature_variant="full",
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
        .insert(
            {
                "user_id": user_id,
                "idea_id": idea["id"],
                "concept": result["concept"],
                "problem": result["problem"],
                "target": result["target"],
                "features": result["features"],
                "differentiator": result["differentiator"],
                "revenue": result["revenue"],
                "mvp_scope": result["mvp_scope"],
            }
        )
        .execute()
    )
    return row.data[0]


async def _log_ai_usage(supabase: Client, **fields) -> None:
    supabase.table("ai_usage_logs").insert(
        {
            "user_id": fields["user_id"],
            "tier": fields["tier"],
            "session_id": fields["session_id"],
            "feature_type": fields["feature_type"],
            "feature_variant": fields.get("feature_variant"),
            "model": fields.get("model", OVERVIEW_MODEL),
            "prompt_version": PROMPT_VERSION,
            "input_tokens": fields["input_tokens"],
            "output_tokens": fields["output_tokens"],
            "total_cost_usd": fields["total_cost"],
            "response_time_ms": fields["response_time_ms"],
            "status": fields["status"],
            "source": fields.get("source", "app"),
        }
    ).execute()
