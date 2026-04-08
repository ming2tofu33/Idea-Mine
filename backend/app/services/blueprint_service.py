import time
import uuid
from openai import OpenAI
from supabase import Client
from app.config import settings
from app.models.llm_schemas import BlueprintResponse
from app.prompts.blueprint import build_blueprint_prompt
from app.services.depth_guide import build_depth_guide

_openai: OpenAI | None = None

MODEL = "gpt-5"
PROMPT_VERSION = "blueprint-v1"
COST_PER_1K_INPUT = 0.00125
COST_PER_1K_OUTPUT = 0.01


def get_openai() -> OpenAI:
    global _openai
    if _openai is None:
        _openai = OpenAI(api_key=settings.openai_api_key)
    return _openai


async def generate_blueprint(
    supabase: Client,
    user_id: str,
    tier: str,
    overview: dict,
    product_design: dict,
    axes: dict,
    source: str = "app",
) -> dict:
    """기술 청사진 생성.

    Step 1: 섹션 가중치 생성 (Python, axes 기반)
    Step 2: 청사진 생성 (gpt-5)
    Step 3: DB 저장
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

    # ── Step 1: 섹션 가중치 생성 (Python) ──
    depth_guide = build_depth_guide(
        axes.get("interface_complexity", "medium"),
        axes.get("business_complexity", "medium"),
        axes.get("technical_complexity", "medium"),
    )

    # ── Step 2: 청사진 생성 (gpt-5) ──
    print(f"[blueprint] Step 2: generation starting (model={MODEL})...")
    gen_start = time.time()
    system_prompt, user_prompt = build_blueprint_prompt(
        concept=concept,
        overview=overview,
        product_design=product_design,
        depth_guide=depth_guide,
    )

    try:
        gen_response = client.beta.chat.completions.parse(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format=BlueprintResponse,
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
            feature_type="blueprint",
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
            feature_type="blueprint",
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

    # ── Step 3: DB 저장 ──
    row = (
        supabase.table("blueprints")
        .insert({
            "user_id": user_id,
            "design_id": product_design["id"],
            "tech_stack": _as_string_list(result.tech_stack),
            "api_endpoints": _as_string_list(result.api_endpoints),
            "external_services": _as_string_list(result.external_services),
            "auth_flow": _as_string_list(result.auth_flow),
            "data_model_sql": result.data_model_sql,
            "file_structure": result.file_structure,
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
