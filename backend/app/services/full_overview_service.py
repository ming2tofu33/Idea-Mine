import time
import uuid
from openai import OpenAI
from supabase import Client
from app.config import settings
from app.models.llm_schemas import FullOverviewResponse, IdeaAxesResponse, CritiqueResponse
from app.prompts.full_overview import build_full_overview_prompt, build_full_overview_prompt_with_feedback
from app.prompts.axes_classifier import build_axes_prompt
from app.prompts.critique import build_critique_prompt
from app.services.depth_guide import build_depth_guide
from app.services.market_research import research_market

_openai: OpenAI | None = None

MODEL = "gpt-5"
AXES_MODEL = "gpt-5-nano"
CRITIQUE_MODEL = "gpt-5-mini"

COST_PER_1K_INPUT = 0.00125
COST_PER_1K_OUTPUT = 0.01
AXES_COST_INPUT = 0.00005
AXES_COST_OUTPUT = 0.0004
CRITIQUE_COST_INPUT = 0.00075
CRITIQUE_COST_OUTPUT = 0.0045

PROMPT_VERSION = "full-overview-v3"

CRITIQUE_THRESHOLD = 70


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
    """풀 개요서 생성: Pipeline v2.

    Step 1: 축 분류 (gpt-5-nano) — Interface/Business/Technical 복잡도
    Step 2: 섹션 가중치 생성 (Python, LLM 없음)
    Step 3: 풀 개요 생성 (gpt-5, depth guide 포함)
    Step 4: Self-Critique (gpt-5-mini)
    Step 4.5: 점수 < 70이면 재생성 (1회만)
    Step 5: DB 저장
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

    # 시장 리서치
    market_data = await research_market(
        title_en=idea["title_en"],
        summary_en=idea["summary_en"],
        keywords=idea["keyword_combo"],
    )

    # ── Step 1: 축 분류 (gpt-5-nano) ──
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
        feature_type="full_overview",
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

    # ── Step 2: 섹션 가중치 생성 (Python) ──
    depth_guide = build_depth_guide(
        axes["interface_complexity"],
        axes["business_complexity"],
        axes["technical_complexity"],
    )

    # ── Step 3: 풀 개요 생성 (gpt-5, depth guide 포함) ──
    gen_start = time.time()
    system_prompt, user_prompt = build_full_overview_prompt(
        concept=concept,
        light_overview=overview,
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
            response_format=FullOverviewResponse,
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
            feature_type="full_overview",
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
            feature_type="full_overview",
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

    # ── Step 4: Self-Critique (gpt-5-mini) ──
    overview_text = _format_for_critique(result)
    critique_start = time.time()

    try:
        critique_sys, critique_user = build_critique_prompt(overview_text, axes)
        critique_response = client.beta.chat.completions.parse(
            model=CRITIQUE_MODEL,
            messages=[
                {"role": "system", "content": critique_sys},
                {"role": "user", "content": critique_user},
            ],
            response_format=CritiqueResponse,
        )
        critique_elapsed = int((time.time() - critique_start) * 1000)

        if critique_response.choices[0].message.refusal:
            raise RuntimeError(f"Critique refused: {critique_response.choices[0].message.refusal}")

        critique = critique_response.choices[0].message.parsed

        await _log_ai_usage(
            supabase,
            user_id=user_id,
            tier=tier,
            session_id=session_id,
            feature_type="full_overview",
            feature_variant="critique",
            model=CRITIQUE_MODEL,
            input_tokens=critique_response.usage.prompt_tokens,
            output_tokens=critique_response.usage.completion_tokens,
            total_cost=(
                critique_response.usage.prompt_tokens / 1000 * CRITIQUE_COST_INPUT
                + critique_response.usage.completion_tokens / 1000 * CRITIQUE_COST_OUTPUT
            ),
            response_time_ms=critique_elapsed,
            status="success",
            source=source,
        )

        # ── Step 4.5: 재생성 (조건부, 1회만) ──
        if critique.needs_regeneration and critique.score < CRITIQUE_THRESHOLD:
            regen_start = time.time()
            regen_sys, regen_user = build_full_overview_prompt_with_feedback(
                concept=concept,
                light_overview=overview,
                market_research=market_data,
                depth_guide=depth_guide,
                previous_output=overview_text,
                critique_feedback=critique.feedback,
            )

            try:
                regen_response = client.beta.chat.completions.parse(
                    model=MODEL,
                    messages=[
                        {"role": "system", "content": regen_sys},
                        {"role": "user", "content": regen_user},
                    ],
                    response_format=FullOverviewResponse,
                )
                regen_elapsed = int((time.time() - regen_start) * 1000)

                if not regen_response.choices[0].message.refusal:
                    result = regen_response.choices[0].message.parsed

                await _log_ai_usage(
                    supabase,
                    user_id=user_id,
                    tier=tier,
                    session_id=session_id,
                    feature_type="full_overview",
                    feature_variant="regeneration",
                    model=MODEL,
                    input_tokens=regen_response.usage.prompt_tokens,
                    output_tokens=regen_response.usage.completion_tokens,
                    total_cost=(
                        regen_response.usage.prompt_tokens / 1000 * COST_PER_1K_INPUT
                        + regen_response.usage.completion_tokens / 1000 * COST_PER_1K_OUTPUT
                    ),
                    response_time_ms=regen_elapsed,
                    status="success",
                    source=source,
                )
            except Exception:
                # 재생성 실패해도 원본 result 사용 — 치명적이지 않음
                regen_elapsed = int((time.time() - regen_start) * 1000)
                await _log_ai_usage(
                    supabase,
                    user_id=user_id,
                    tier=tier,
                    session_id=session_id,
                    feature_type="full_overview",
                    feature_variant="regeneration",
                    model=MODEL,
                    input_tokens=0,
                    output_tokens=0,
                    total_cost=0,
                    response_time_ms=regen_elapsed,
                    status="error",
                    source=source,
                )

    except Exception:
        # Critique 실패해도 원본 result 사용 — 치명적이지 않음
        critique_elapsed = int((time.time() - critique_start) * 1000)
        await _log_ai_usage(
            supabase,
            user_id=user_id,
            tier=tier,
            session_id=session_id,
            feature_type="full_overview",
            feature_variant="critique",
            model=CRITIQUE_MODEL,
            input_tokens=0,
            output_tokens=0,
            total_cost=0,
            response_time_ms=critique_elapsed,
            status="error",
            source=source,
        )

    # ── Step 5: DB 저장 ──
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
            "tech_stack": _as_string_list(result.tech_stack),
            "data_model_sql": result.data_model_sql,
            "api_endpoints": _as_string_list(result.api_endpoints),
            "file_structure": result.file_structure,
            "external_services": _as_string_list(result.external_services),
            "auth_flow": _as_string_list(result.auth_flow),
        })
        .execute()
    )
    return row.data[0]


def _format_for_critique(result: FullOverviewResponse) -> str:
    """Pydantic 결과를 읽기 좋은 텍스트로 변환 (critique 입력용)."""
    nl = "\n"
    sections = [
        f"CONCEPT: {result.concept}",
        f"PROBLEM: {result.problem}",
        f"TARGET USER: {result.target_user}",
        f"FEATURES MUST:\n{nl.join('- ' + f for f in result.features_must)}",
        f"FEATURES SHOULD:\n{nl.join('- ' + f for f in result.features_should)}",
        f"FEATURES LATER:\n{nl.join('- ' + f for f in result.features_later)}",
        f"USER FLOW:\n{nl.join(result.user_flow)}",
        f"SCREENS:\n{nl.join('- ' + s for s in result.screens)}",
        f"BUSINESS MODEL: {result.business_model}",
        f"BUSINESS RULES:\n{nl.join('- ' + r for r in result.business_rules)}",
        f"MVP SCOPE: {result.mvp_scope}",
        f"TECH STACK:\n{nl.join('- ' + t for t in result.tech_stack)}",
        f"DATA MODEL SQL:\n{result.data_model_sql}",
        f"API ENDPOINTS:\n{nl.join('- ' + e for e in result.api_endpoints)}",
        f"FILE STRUCTURE:\n{result.file_structure}",
        f"EXTERNAL SERVICES:\n{nl.join('- ' + s for s in result.external_services)}",
        f"AUTH FLOW:\n{nl.join(result.auth_flow)}",
    ]
    return "\n\n".join(sections)


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
