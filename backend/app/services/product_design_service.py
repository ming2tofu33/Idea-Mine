import time
import uuid
from openai import OpenAI
from supabase import Client
from app.config import settings
from app.models.llm_schemas import ProductDesignResponse, IdeaAxesResponse
from app.prompts.product_design import build_product_design_prompt
from app.prompts.axes_classifier import build_axes_prompt
from app.services.depth_guide import build_depth_guide
from app.services.market_research import research_market

_openai: OpenAI | None = None

MODEL = "gpt-5"
AXES_MODEL = "gpt-5-nano"
PROMPT_VERSION = "product-design-v1"
COST_PER_1K_INPUT = 0.00125
COST_PER_1K_OUTPUT = 0.01
AXES_COST_INPUT = 0.00005
AXES_COST_OUTPUT = 0.0004


def get_openai() -> OpenAI:
    global _openai
    if _openai is None:
        _openai = OpenAI(api_key=settings.openai_api_key)
    return _openai


async def generate_product_design(
    supabase: Client,
    user_id: str,
    tier: str,
    overview: dict,
    idea: dict,
    source: str = "app",
) -> dict:
    """제품 설계서 생성: Pipeline v2.

    Step 1: 축 분류 (gpt-5-nano)
    Step 2: 섹션 가중치 생성 (Python)
    Step 3: 시장 리서치
    Step 4: 제품 설계서 생성 (gpt-5)
    Step 5: DB 저장
    """
    session_id = str(uuid.uuid4())
    client = get_openai()

    # concept 복원 (개요서에서)
    concept = {
        "concept_en": overview.get("concept_en", ""),
        "concept_ko": overview.get("concept_ko", ""),
        "product_type": overview.get("product_type", "B2C"),
        "primary_user_en": overview.get("target_en", "").split(".")[0] if overview.get("target_en") else "",
        "core_experience_en": overview.get("features_en", "").split("—")[0] if overview.get("features_en") else "",
    }

    # ── Step 1: 축 분류 (gpt-5-nano) ──
    print(f"[product_design] Step 1: axes classification starting...")
    axes_start = time.time()
    axes_sys, axes_user = build_axes_prompt(
        concept=concept,
        keywords=idea["keyword_combo"],
        product_type=concept["product_type"],
    )

    axes_response = client.beta.chat.completions.parse(
        model=AXES_MODEL,
        messages=[
            {"role": "system", "content": axes_sys},
            {"role": "user", "content": axes_user},
        ],
        response_format=IdeaAxesResponse,
    )
    axes_elapsed = int((time.time() - axes_start) * 1000)

    if axes_response.choices[0].message.refusal:
        raise RuntimeError(f"Axes classification refused: {axes_response.choices[0].message.refusal}")

    axes = axes_response.choices[0].message.parsed.model_dump()

    await _log_ai_usage(
        supabase,
        user_id=user_id,
        tier=tier,
        session_id=session_id,
        feature_type="product_design",
        feature_variant="axes_classification",
        model=AXES_MODEL,
        input_tokens=axes_response.usage.prompt_tokens,
        output_tokens=axes_response.usage.completion_tokens,
        total_cost=(
            axes_response.usage.prompt_tokens / 1000 * AXES_COST_INPUT
            + axes_response.usage.completion_tokens / 1000 * AXES_COST_OUTPUT
        ),
        response_time_ms=axes_elapsed,
        status="success",
        source=source,
    )

    print(f"[product_design] Step 1 done: {axes} ({axes_elapsed}ms)")

    # ── Step 2: 섹션 가중치 생성 (Python) ──
    depth_guide = build_depth_guide(
        axes["interface_complexity"],
        axes["business_complexity"],
        axes["technical_complexity"],
    )

    # ── Step 3: 시장 리서치 ──
    market_data = await research_market(
        title_en=idea["title_en"],
        summary_en=idea["summary_en"],
        keywords=idea["keyword_combo"],
    )

    # ── Step 4: 제품 설계서 생성 (gpt-5) ──
    print(f"[product_design] Step 4: generation starting (model={MODEL})...")
    gen_start = time.time()
    system_prompt, user_prompt = build_product_design_prompt(
        concept=concept,
        overview=overview,
        market_research=market_data,
        depth_guide=depth_guide,
    )

    try:
        gen_response = client.beta.chat.completions.parse(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format=ProductDesignResponse,
        )
        gen_elapsed = int((time.time() - gen_start) * 1000)

        if gen_response.choices[0].message.refusal:
            raise RuntimeError(f"Generation refused: {gen_response.choices[0].message.refusal}")

        result = gen_response.choices[0].message.parsed

        await _log_ai_usage(
            supabase,
            user_id=user_id,
            tier=tier,
            session_id=session_id,
            feature_type="product_design",
            feature_variant="generation",
            model=MODEL,
            input_tokens=gen_response.usage.prompt_tokens,
            output_tokens=gen_response.usage.completion_tokens,
            total_cost=(
                gen_response.usage.prompt_tokens / 1000 * COST_PER_1K_INPUT
                + gen_response.usage.completion_tokens / 1000 * COST_PER_1K_OUTPUT
            ),
            response_time_ms=gen_elapsed,
            status="success",
            source=source,
        )
    except Exception:
        gen_elapsed = int((time.time() - gen_start) * 1000)
        await _log_ai_usage(
            supabase,
            user_id=user_id,
            tier=tier,
            session_id=session_id,
            feature_type="product_design",
            feature_variant="generation",
            model=MODEL,
            input_tokens=0,
            output_tokens=0,
            total_cost=0,
            response_time_ms=gen_elapsed,
            status="error",
            source=source,
        )
        raise

    # ── Step 5: DB 저장 ──
    row = (
        supabase.table("product_designs")
        .insert({
            "user_id": user_id,
            "overview_id": overview["id"],
            "user_flow": _as_string_list(result.user_flow),
            "screens": _as_string_list(result.screens),
            "features_must": _as_string_list(result.features_must),
            "features_should": _as_string_list(result.features_should),
            "features_later": _as_string_list(result.features_later),
            "business_model": result.business_model,
            "business_rules": _as_string_list(result.business_rules),
            "mvp_scope": result.mvp_scope,
            "axes": axes,
        })
        .execute()
    )
    return row.data[0]


def _as_string_list(value: object) -> list[str]:
    if not isinstance(value, list):
        return []
    return [item for item in value if isinstance(item, str)]


async def _log_ai_usage(supabase: Client, **fields) -> None:
    supabase.table("ai_usage_logs").insert({
        "user_id": fields["user_id"],
        "tier": fields["tier"],
        "session_id": fields["session_id"],
        "feature_type": fields["feature_type"],
        "feature_variant": fields.get("feature_variant"),
        "model": fields.get("model", MODEL),
        "prompt_version": PROMPT_VERSION,
        "input_tokens": fields["input_tokens"],
        "output_tokens": fields["output_tokens"],
        "total_cost_usd": fields["total_cost"],
        "response_time_ms": fields["response_time_ms"],
        "status": fields["status"],
        "language": "en",
        "source": fields.get("source", "app"),
    }).execute()
