import asyncio
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.dependencies import (
    get_current_user,
    get_effective_role,
    get_effective_tier,
    get_supabase,
)
from app.models.schemas import MineResponse, RerollResponse, TodayVeinsResponse
from app.services import idea_service, rate_limiter, vein_service
from app.utils import validate_uuid

router = APIRouter(prefix="/mining", tags=["mining"])


@router.get("/veins/today", response_model=TodayVeinsResponse)
async def get_today_veins(
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    tier = get_effective_tier(user)
    role = get_effective_role(user)

    veins_task = vein_service.get_or_create_today_veins(
        supabase,
        user["id"],
        tier,
        role=role,
    )
    state_task = rate_limiter.check_daily_limit_l2(
        supabase,
        user["id"],
        tier,
        action="none",
        role=role,
    )
    veins, state = await asyncio.gather(veins_task, state_task)

    veins = await vein_service.resolve_vein_keywords(supabase, veins)
    limits = rate_limiter.TIER_LIMITS.get(tier, rate_limiter.TIER_LIMITS["free"])

    return TodayVeinsResponse(
        veins=veins,
        rerolls_used=state["rerolls_used"],
        rerolls_max=limits["rerolls"],
        generations_used=state["generations_used"],
        generations_max=limits["generations"],
    )


@router.post("/veins/reroll", response_model=RerollResponse)
async def reroll(
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    tier = get_effective_tier(user)
    role = get_effective_role(user)

    rate_limiter.check_rate_limit_l1(user["id"], role=role)
    state = await rate_limiter.check_daily_limit_l2(
        supabase,
        user["id"],
        tier,
        action="reroll",
        role=role,
    )

    veins = await vein_service.reroll_veins(supabase, user["id"], tier, role=role)
    resolve_task = vein_service.resolve_vein_keywords(supabase, veins)
    increment_task = rate_limiter.increment_daily_count(
        supabase,
        user["id"],
        "reroll",
        current_state=state,
    )
    veins, _ = await asyncio.gather(resolve_task, increment_task)

    limits = rate_limiter.TIER_LIMITS.get(tier, rate_limiter.TIER_LIMITS["free"])
    return RerollResponse(
        veins=veins,
        rerolls_used=state["rerolls_used"] + 1,
        rerolls_max=limits["rerolls"],
    )


@router.post("/veins/{vein_id}/mine", response_model=MineResponse)
async def mine_vein(
    vein_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    validate_uuid(vein_id, "vein_id")

    tier = get_effective_tier(user)
    role = get_effective_role(user)

    rate_limiter.check_rate_limit_l1(user["id"], role=role)
    state = await rate_limiter.check_daily_limit_l2(
        supabase,
        user["id"],
        tier,
        action="generation",
        role=role,
    )
    await rate_limiter.check_cost_limit_l4(supabase, user["id"], tier, role=role)

    vein = await asyncio.to_thread(
        lambda: supabase.table("veins")
        .select("*")
        .eq("id", vein_id)
        .eq("user_id", user["id"])
        .eq("is_active", True)
        .eq("date", date.today().isoformat())
        .execute()
    )
    vein_data = vein.data[0] if vein.data else None

    if not vein_data:
        raise HTTPException(status_code=404, detail="Vein not found")

    if vein_data.get("is_selected"):
        raise HTTPException(
            status_code=400,
            detail={
                "error": "already_mined",
                "message": "This vein has already been mined.",
            },
        )

    keywords = await asyncio.to_thread(
        lambda: supabase.table("keywords")
        .select("id, slug, category, subtype, label, is_premium")
        .in_("id", vein_data["keyword_ids"])
        .execute()
    )

    ideas = await idea_service.generate_ideas(
        supabase=supabase,
        user_id=user["id"],
        tier=tier,
        vein_id=vein_id,
        keywords=keywords.data,
        source="web",
    )

    await rate_limiter.increment_daily_count(
        supabase,
        user["id"],
        "generation",
        current_state=state,
    )
    return MineResponse(ideas=ideas, vein_id=vein_id)
