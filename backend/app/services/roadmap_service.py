import time
import uuid
from openai import OpenAI
from supabase import Client
from app.config import settings
from app.models.llm_schemas import RoadmapResponse
from app.prompts.roadmap import build_roadmap_prompt

_openai: OpenAI | None = None

MODEL = "gpt-5-mini"
PROMPT_VERSION = "roadmap-v1"
COST_PER_1K_INPUT = 0.00075
COST_PER_1K_OUTPUT = 0.0045


def get_openai() -> OpenAI:
    global _openai
    if _openai is None:
        _openai = OpenAI(api_key=settings.openai_api_key)
    return _openai


async def generate_roadmap(
    supabase: Client,
    user_id: str,
    tier: str,
    concept: dict,
    product_design: dict,
    blueprint: dict,
    source: str = "app",
    language: str = "ko",
) -> dict:
    """실행 로드맵 생성.

    Step 1: 로드맵 생성 (gpt-5-mini)
    Step 2: DB 저장
    """
    session_id = str(uuid.uuid4())
    client = get_openai()

    # ── Step 1: 로드맵 생성 (gpt-5-mini) ──
    print(f"[roadmap] Step 1: generation starting (model={MODEL})...")
    gen_start = time.time()
    system_prompt, user_prompt = build_roadmap_prompt(
        concept=concept,
        product_design=product_design,
        blueprint=blueprint,
        language=language,
    )

    try:
        gen_response = client.beta.chat.completions.parse(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format=RoadmapResponse,
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
            feature_type="roadmap",
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
            feature_type="roadmap",
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

    # ── Step 2: DB 저장 ──
    row = (
        supabase.table("roadmaps")
        .insert({
            "user_id": user_id,
            "blueprint_id": blueprint["id"],
            "phase_0": _as_string_list(result.phase_0),
            "phase_1": _as_string_list(result.phase_1),
            "phase_2": _as_string_list(result.phase_2),
            "validation_checkpoints": _as_string_list(result.validation_checkpoints),
            "first_sprint_tasks": _as_string_list(result.first_sprint_tasks),
            "estimated_complexity": result.estimated_complexity,
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
