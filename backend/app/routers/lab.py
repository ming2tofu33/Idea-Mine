from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import Client
from app.dependencies import get_supabase, get_current_user
from app.services import overview_service, full_overview_service
from app.services import product_design_service, blueprint_service, roadmap_service
from app.services.rate_limiter import check_rate_limit_l1, check_daily_limit_l2, check_cost_limit_l4, increment_daily_count, TIER_LIMITS
from app.utils import validate_uuid

router = APIRouter(prefix="/lab", tags=["lab"])


@router.get("/usage")
async def get_usage(
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """현재 사용자의 일일 사용량 + 티어별 한도 반환."""
    effective_tier = user.get("tier", "free")
    effective_role = user.get("role", "user")

    state = await check_daily_limit_l2(
        supabase, user["id"], effective_tier, "none", role=effective_role
    )

    limits = TIER_LIMITS.get(effective_tier, TIER_LIMITS["free"])

    return {
        "tier": effective_tier,
        "overviews": {
            "used": state.get("overviews_used", 0),
            "limit": limits["overviews"],
        },
        "generations": {
            "used": state.get("generations_used", 0),
            "limit": limits["generations"],
        },
    }


class OverviewRequest(BaseModel):
    idea_id: str


@router.post("/overview")
async def create_overview(
    req: OverviewRequest,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    validate_uuid(req.idea_id, "idea_id")

    # Rate limit: L1 속도 + L2 일일 한도
    effective_role = user.get("role", "user")
    effective_tier = user.get("tier", "free")
    check_rate_limit_l1(user["id"], role=effective_role)
    state = await check_daily_limit_l2(supabase, user["id"], effective_tier, "overview", role=effective_role)
    await check_cost_limit_l4(supabase, user["id"], effective_tier, role=effective_role)

    idea_result = (
        supabase.table("ideas")
        .select("*")
        .eq("id", req.idea_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not idea_result.data:
        raise HTTPException(status_code=404, detail="Idea not found")

    idea = idea_result.data[0]

    overview = await overview_service.generate_overview(
        supabase=supabase,
        user_id=user["id"],
        tier=effective_tier,
        idea=idea,
        source="app",
    )

    await increment_daily_count(supabase, user["id"], "overview", current_state=state)
    return overview


class FullOverviewRequest(BaseModel):
    overview_id: str


@router.post("/overview/full")
async def create_full_overview(
    req: FullOverviewRequest,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """풀 개요서 생성 (Pro 전용)."""
    validate_uuid(req.overview_id, "overview_id")

    effective_role = user.get("role", "user")
    effective_tier = user.get("tier", "free")

    # Pro 전용 체크
    if effective_tier != "pro" and effective_role != "admin":
        raise HTTPException(status_code=403, detail="Full overview is Pro-only")

    # Rate limit: L1 속도 + L2 일일 한도 + L4 비용
    check_rate_limit_l1(user["id"], role=effective_role)
    state = await check_daily_limit_l2(supabase, user["id"], effective_tier, "overview", role=effective_role)
    await check_cost_limit_l4(supabase, user["id"], effective_tier, role=effective_role)

    # 개요서 조회 + 소유권 확인
    overview_result = (
        supabase.table("overviews")
        .select("*")
        .eq("id", req.overview_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not overview_result.data:
        raise HTTPException(status_code=404, detail="Overview not found")

    overview = overview_result.data[0]

    # 연결된 아이디어 조회
    idea_result = (
        supabase.table("ideas")
        .select("*")
        .eq("id", overview["idea_id"])
        .execute()
    )
    if not idea_result.data:
        raise HTTPException(status_code=404, detail="Idea not found")

    idea = idea_result.data[0]

    full_overview = await full_overview_service.generate_full_overview(
        supabase=supabase,
        user_id=user["id"],
        tier=effective_tier,
        overview=overview,
        idea=idea,
        source="app",
    )

    await increment_daily_count(supabase, user["id"], "overview", current_state=state)
    return full_overview


class DesignRequest(BaseModel):
    overview_id: str


class BlueprintRequest(BaseModel):
    design_id: str


class RoadmapRequest(BaseModel):
    blueprint_id: str


class GenerateAllRequest(BaseModel):
    overview_id: str


@router.post("/design")
async def create_design(
    req: DesignRequest,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """제품 설계서 생성 (Lite+)."""
    validate_uuid(req.overview_id, "overview_id")

    effective_role = user.get("role", "user")
    effective_tier = user.get("tier", "free")

    # Lite+ 체크
    if effective_tier not in ("lite", "pro") and effective_role != "admin":
        raise HTTPException(status_code=403, detail="Product design requires Lite or higher tier")

    # Rate limit: L1 속도 + L2 일일 한도 + L4 비용
    check_rate_limit_l1(user["id"], role=effective_role)
    state = await check_daily_limit_l2(supabase, user["id"], effective_tier, "overview", role=effective_role)
    await check_cost_limit_l4(supabase, user["id"], effective_tier, role=effective_role)

    # 개요서 조회 + 소유권 확인
    overview_result = (
        supabase.table("overviews")
        .select("*")
        .eq("id", req.overview_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not overview_result.data:
        raise HTTPException(status_code=404, detail="Overview not found")

    overview = overview_result.data[0]

    # 연결된 아이디어 조회
    idea_result = (
        supabase.table("ideas")
        .select("*")
        .eq("id", overview["idea_id"])
        .execute()
    )
    if not idea_result.data:
        raise HTTPException(status_code=404, detail="Idea not found")

    idea = idea_result.data[0]

    design = await product_design_service.generate_product_design(
        supabase=supabase,
        user_id=user["id"],
        tier=effective_tier,
        overview=overview,
        idea=idea,
        source="app",
    )

    await increment_daily_count(supabase, user["id"], "overview", current_state=state)
    return design


@router.post("/blueprint")
async def create_blueprint(
    req: BlueprintRequest,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """기술 청사진 생성 (Pro 전용)."""
    validate_uuid(req.design_id, "design_id")

    effective_role = user.get("role", "user")
    effective_tier = user.get("tier", "free")

    # Pro 전용 체크
    if effective_tier != "pro" and effective_role != "admin":
        raise HTTPException(status_code=403, detail="Blueprint is Pro-only")

    # Rate limit: L1 속도 + L2 일일 한도 + L4 비용
    check_rate_limit_l1(user["id"], role=effective_role)
    state = await check_daily_limit_l2(supabase, user["id"], effective_tier, "overview", role=effective_role)
    await check_cost_limit_l4(supabase, user["id"], effective_tier, role=effective_role)

    # 제품 설계서 조회 + 소유권 확인
    design_result = (
        supabase.table("product_designs")
        .select("*")
        .eq("id", req.design_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not design_result.data:
        raise HTTPException(status_code=404, detail="Product design not found")

    product_design = design_result.data[0]

    # 개요서 조회
    overview_result = (
        supabase.table("overviews")
        .select("*")
        .eq("id", product_design["overview_id"])
        .execute()
    )
    if not overview_result.data:
        raise HTTPException(status_code=404, detail="Overview not found")

    overview = overview_result.data[0]

    # axes는 product_design에 저장되어 있음
    axes = product_design.get("axes", {})

    bp = await blueprint_service.generate_blueprint(
        supabase=supabase,
        user_id=user["id"],
        tier=effective_tier,
        overview=overview,
        product_design=product_design,
        axes=axes,
        source="app",
    )

    await increment_daily_count(supabase, user["id"], "overview", current_state=state)
    return bp


@router.post("/roadmap")
async def create_roadmap(
    req: RoadmapRequest,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """실행 로드맵 생성 (Pro 전용)."""
    validate_uuid(req.blueprint_id, "blueprint_id")

    effective_role = user.get("role", "user")
    effective_tier = user.get("tier", "free")

    # Pro 전용 체크
    if effective_tier != "pro" and effective_role != "admin":
        raise HTTPException(status_code=403, detail="Roadmap is Pro-only")

    # Rate limit: L1 속도 + L2 일일 한도 + L4 비용
    check_rate_limit_l1(user["id"], role=effective_role)
    state = await check_daily_limit_l2(supabase, user["id"], effective_tier, "overview", role=effective_role)
    await check_cost_limit_l4(supabase, user["id"], effective_tier, role=effective_role)

    # 청사진 조회 + 소유권 확인
    bp_result = (
        supabase.table("blueprints")
        .select("*")
        .eq("id", req.blueprint_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not bp_result.data:
        raise HTTPException(status_code=404, detail="Blueprint not found")

    blueprint = bp_result.data[0]

    # 제품 설계서 조회
    design_result = (
        supabase.table("product_designs")
        .select("*")
        .eq("id", blueprint["design_id"])
        .execute()
    )
    if not design_result.data:
        raise HTTPException(status_code=404, detail="Product design not found")

    product_design = design_result.data[0]

    # 개요서에서 concept 복원
    overview_result = (
        supabase.table("overviews")
        .select("*")
        .eq("id", product_design["overview_id"])
        .execute()
    )
    if not overview_result.data:
        raise HTTPException(status_code=404, detail="Overview not found")

    overview = overview_result.data[0]

    concept = {
        "concept_en": overview.get("concept_en", ""),
        "concept_ko": overview.get("concept_ko", ""),
        "product_type": overview.get("product_type", "B2C"),
        "primary_user_en": overview.get("target_en", "").split(".")[0] if overview.get("target_en") else "",
        "core_experience_en": overview.get("features_en", "").split("—")[0] if overview.get("features_en") else "",
    }

    rm = await roadmap_service.generate_roadmap(
        supabase=supabase,
        user_id=user["id"],
        tier=effective_tier,
        concept=concept,
        product_design=product_design,
        blueprint=blueprint,
        source="app",
    )

    await increment_daily_count(supabase, user["id"], "overview", current_state=state)
    return rm


@router.post("/generate-all")
async def generate_all(
    req: GenerateAllRequest,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """제품 설계서 + 기술 청사진 + 로드맵 일괄 생성 (Pro 전용)."""
    validate_uuid(req.overview_id, "overview_id")

    effective_role = user.get("role", "user")
    effective_tier = user.get("tier", "free")

    # Pro 전용 체크
    if effective_tier != "pro" and effective_role != "admin":
        raise HTTPException(status_code=403, detail="Generate-all is Pro-only")

    # Rate limit: L1 속도 + L2 일일 한도 + L4 비용
    check_rate_limit_l1(user["id"], role=effective_role)
    state = await check_daily_limit_l2(supabase, user["id"], effective_tier, "overview", role=effective_role)
    await check_cost_limit_l4(supabase, user["id"], effective_tier, role=effective_role)

    # 개요서 조회 + 소유권 확인
    overview_result = (
        supabase.table("overviews")
        .select("*")
        .eq("id", req.overview_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not overview_result.data:
        raise HTTPException(status_code=404, detail="Overview not found")

    overview = overview_result.data[0]

    # 연결된 아이디어 조회
    idea_result = (
        supabase.table("ideas")
        .select("*")
        .eq("id", overview["idea_id"])
        .execute()
    )
    if not idea_result.data:
        raise HTTPException(status_code=404, detail="Idea not found")

    idea = idea_result.data[0]

    # ── Step 1: 제품 설계서 (이미 있으면 재사용) ──
    existing_design = (
        supabase.table("product_designs")
        .select("*")
        .eq("overview_id", overview["id"])
        .eq("user_id", user["id"])
        .execute()
    )
    if existing_design.data:
        design_data = existing_design.data[0]
    else:
        design_data = await product_design_service.generate_product_design(
            supabase=supabase,
            user_id=user["id"],
            tier=effective_tier,
            overview=overview,
            idea=idea,
            source="app",
        )

    # ── Step 2: 기술 청사진 (이미 있으면 재사용) ──
    existing_bp = (
        supabase.table("blueprints")
        .select("*")
        .eq("design_id", design_data["id"])
        .eq("user_id", user["id"])
        .execute()
    )
    if existing_bp.data:
        blueprint_data = existing_bp.data[0]
    else:
        axes = design_data.get("axes", {})
        blueprint_data = await blueprint_service.generate_blueprint(
            supabase=supabase,
            user_id=user["id"],
            tier=effective_tier,
            overview=overview,
            product_design=design_data,
            axes=axes,
            source="app",
        )

    # ── Step 3: 실행 로드맵 (이미 있으면 재사용) ──
    existing_rm = (
        supabase.table("roadmaps")
        .select("*")
        .eq("blueprint_id", blueprint_data["id"])
        .eq("user_id", user["id"])
        .execute()
    )
    if existing_rm.data:
        roadmap_data = existing_rm.data[0]
    else:
        concept = {
            "concept_en": overview.get("concept_en", ""),
            "concept_ko": overview.get("concept_ko", ""),
            "product_type": overview.get("product_type", "B2C"),
            "primary_user_en": overview.get("target_en", "").split(".")[0] if overview.get("target_en") else "",
            "core_experience_en": overview.get("features_en", "").split("—")[0] if overview.get("features_en") else "",
        }
        roadmap_data = await roadmap_service.generate_roadmap(
            supabase=supabase,
            user_id=user["id"],
            tier=effective_tier,
            concept=concept,
            product_design=design_data,
            blueprint=blueprint_data,
            source="app",
        )

    await increment_daily_count(supabase, user["id"], "overview", current_state=state)
    return {
        "design": design_data,
        "blueprint": blueprint_data,
        "roadmap": roadmap_data,
    }
