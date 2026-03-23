from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.dependencies import get_supabase, get_current_user, get_effective_tier, get_effective_role
from app.services import vein_service, idea_service, rate_limiter
from app.models.schemas import TodayVeinsResponse, RerollResponse, MineResponse

router = APIRouter(prefix="/mining", tags=["mining"])


@router.get("/veins/today", response_model=TodayVeinsResponse)
async def get_today_veins(
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """오늘의 광맥 3개 조회 (없으면 생성)."""
    tier = get_effective_tier(user)
    role = get_effective_role(user)

    veins = await vein_service.get_or_create_today_veins(supabase, user["id"], tier)
    veins = await vein_service.resolve_vein_keywords(supabase, veins)

    state = await rate_limiter.check_daily_limit_l2(
        supabase, user["id"], tier, action="none", role=role
    )
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
    """광맥 3개를 새로 뽑기 (리롤 횟수 차감)."""
    tier = get_effective_tier(user)
    role = get_effective_role(user)

    rate_limiter.check_rate_limit_l1(user["id"], role=role)
    await rate_limiter.check_daily_limit_l2(supabase, user["id"], tier, action="reroll", role=role)

    veins = await vein_service.reroll_veins(supabase, user["id"], tier)
    veins = await vein_service.resolve_vein_keywords(supabase, veins)

    await rate_limiter.increment_daily_count(supabase, user["id"], "reroll")

    limits = rate_limiter.TIER_LIMITS.get(tier, rate_limiter.TIER_LIMITS["free"])
    state = await rate_limiter.check_daily_limit_l2(
        supabase, user["id"], tier, action="none", role=role
    )

    return RerollResponse(
        veins=veins,
        rerolls_used=state["rerolls_used"],
        rerolls_max=limits["rerolls"],
    )


@router.post("/veins/{vein_id}/mine", response_model=MineResponse)
async def mine_vein(
    vein_id: str,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """광맥 선택 -> 아이디어 10개 생성."""
    tier = get_effective_tier(user)
    role = get_effective_role(user)

    rate_limiter.check_rate_limit_l1(user["id"], role=role)
    await rate_limiter.check_daily_limit_l2(supabase, user["id"], tier, action="generation", role=role)

    vein = (
        supabase.table("veins")
        .select("*")
        .eq("id", vein_id)
        .eq("user_id", user["id"])
        .single()
        .execute()
    )

    if not vein.data:
        raise HTTPException(status_code=404, detail="Vein not found")

    keywords = (
        supabase.table("keywords")
        .select("id, slug, category, ko, en, is_premium")
        .in_("id", vein.data["keyword_ids"])
        .execute()
    ).data

    ideas = await idea_service.generate_ideas(
        supabase=supabase,
        user_id=user["id"],
        tier=tier,
        vein_id=vein_id,
        keywords=keywords,
        language=user.get("language", "ko"),
    )

    await rate_limiter.increment_daily_count(supabase, user["id"], "generation")
    return MineResponse(ideas=ideas, vein_id=vein_id)
