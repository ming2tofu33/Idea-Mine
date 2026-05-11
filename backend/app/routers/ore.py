from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.dependencies import (
    get_current_user,
    get_effective_role,
    get_effective_tier,
    get_supabase,
)
from app.models.schemas import (
    IdeaOreOut,
    OreDiscoverRequest,
    OreDiscoverResponse,
    OreTodayVeinsResponse,
    OreVaultResponse,
    ProjectSeedBriefOut,
)
from app.services import ore_service
from app.services.rate_limiter import (
    TIER_LIMITS,
    check_cost_limit_l4,
    check_daily_limit_l2,
    check_rate_limit_l1,
    increment_daily_count,
)
from app.utils import validate_uuid

router = APIRouter(prefix="/ore", tags=["ore"])


@router.get("/veins/today", response_model=OreTodayVeinsResponse)
async def get_today_ore_veins(
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    tier = get_effective_tier(user)
    role = get_effective_role(user)
    state = await check_daily_limit_l2(
        supabase,
        user["id"],
        tier,
        action="none",
        role=role,
    )
    veins = await ore_service.get_today_ore_veins(
        supabase,
        user["id"],
        tier,
        role=role,
    )
    tier_limits = TIER_LIMITS.get(tier, TIER_LIMITS["free"])
    return {
        "veins": veins,
        "rerolls_used": state["rerolls_used"],
        "rerolls_max": tier_limits["rerolls"],
        "generations_used": state["generations_used"],
        "generations_max": tier_limits["generations"],
    }


@router.post("/veins/reroll", response_model=OreTodayVeinsResponse)
async def reroll_ore_veins(
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    tier = get_effective_tier(user)
    role = get_effective_role(user)

    check_rate_limit_l1(user["id"], role=role)
    state = await check_daily_limit_l2(
        supabase,
        user["id"],
        tier,
        action="reroll",
        role=role,
    )

    veins = await ore_service.reroll_ore_veins(
        supabase,
        user["id"],
        tier,
        role=role,
    )
    await increment_daily_count(
        supabase,
        user["id"],
        "reroll",
        current_state=state,
    )

    tier_limits = TIER_LIMITS.get(tier, TIER_LIMITS["free"])
    return {
        "veins": veins,
        "rerolls_used": state["rerolls_used"] + 1,
        "rerolls_max": tier_limits["rerolls"],
        "generations_used": state["generations_used"],
        "generations_max": tier_limits["generations"],
    }


@router.post("/discover", response_model=OreDiscoverResponse)
async def discover_ores(
    req: OreDiscoverRequest,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    validate_uuid(req.vein_id, "vein_id")
    vein = await ore_service.get_active_daily_vein(
        supabase,
        user["id"],
        req.vein_id,
    )
    if not vein:
        raise HTTPException(status_code=404, detail="Daily Vein not found")

    keywords = await ore_service.get_keywords_for_vein(supabase, vein)
    existing = await ore_service.get_existing_ores_by_vein(
        supabase,
        user["id"],
        req.vein_id,
    )
    if existing:
        return ore_service.build_discover_response(vein, keywords, existing)

    tier = get_effective_tier(user)
    role = get_effective_role(user)

    check_rate_limit_l1(user["id"], role=role)
    state = await check_daily_limit_l2(
        supabase,
        user["id"],
        tier,
        action="generation",
        role=role,
    )
    await check_cost_limit_l4(supabase, user["id"], tier, role=role)

    try:
        result = await ore_service.discover_ores(
            supabase=supabase,
            user_id=user["id"],
            tier=tier,
            vein=vein,
            keywords=keywords,
            source="web",
        )
    except ore_service.OreDiscoveryValidationError as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "error": "ore_generation_failed",
                "message": str(exc),
            },
        ) from exc
    except ore_service.OreProviderError as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "error": "ai_provider_error",
                "message": str(exc),
            },
        ) from exc

    await increment_daily_count(
        supabase,
        user["id"],
        "generation",
        current_state=state,
    )
    return result


@router.get("/vault", response_model=list[IdeaOreOut])
async def get_vaulted_ores(
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    return await ore_service.get_vaulted_ores(supabase, user["id"])


@router.get("/{ore_id}", response_model=IdeaOreOut)
async def get_ore(
    ore_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    validate_uuid(ore_id, "ore_id")

    ore = await ore_service.get_ore(supabase, user["id"], ore_id)
    if not ore:
        raise HTTPException(status_code=404, detail="Idea Ore not found")
    return ore


@router.patch("/{ore_id}/vault", response_model=OreVaultResponse)
async def vault_ore(
    ore_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    validate_uuid(ore_id, "ore_id")

    ore = await ore_service.vault_ore(supabase, user["id"], ore_id)
    if not ore:
        raise HTTPException(status_code=404, detail="Idea Ore not found")

    return OreVaultResponse(ore_id=ore_id, is_vaulted=True)


@router.post("/{ore_id}/projectize", response_model=ProjectSeedBriefOut)
async def projectize_ore(
    ore_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    validate_uuid(ore_id, "ore_id")
    tier = get_effective_tier(user)
    role = get_effective_role(user)

    ore = await ore_service.get_ore(supabase, user["id"], ore_id)
    if not ore:
        raise HTTPException(status_code=404, detail="Idea Ore not found")

    existing = await ore_service.get_project_seed_brief(supabase, user["id"], ore_id)
    if existing:
        return existing

    check_rate_limit_l1(user["id"], role=role)
    state = await check_daily_limit_l2(
        supabase,
        user["id"],
        tier,
        action="overview",
        role=role,
    )
    await check_cost_limit_l4(supabase, user["id"], tier, role=role)

    try:
        brief = await ore_service.projectize_ore(
            supabase=supabase,
            user_id=user["id"],
            tier=tier,
            ore_id=ore_id,
            source="web",
        )
    except ore_service.OreProviderError as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "error": "ai_provider_error",
                "message": str(exc),
            },
        ) from exc
    if not brief:
        raise HTTPException(status_code=404, detail="Idea Ore not found")

    await increment_daily_count(
        supabase,
        user["id"],
        "overview",
        current_state=state,
    )
    return brief
