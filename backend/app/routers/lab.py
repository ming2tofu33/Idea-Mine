from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import Client
from app.dependencies import get_supabase, get_current_user
from app.services import overview_service, full_overview_service
from app.services.rate_limiter import check_rate_limit_l1, check_daily_limit_l2, increment_daily_count
from app.utils import validate_uuid

router = APIRouter(prefix="/lab", tags=["lab"])


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

    # Rate limit: L1 속도 + L2 일일 한도
    check_rate_limit_l1(user["id"], role=effective_role)
    state = await check_daily_limit_l2(supabase, user["id"], effective_tier, "overview", role=effective_role)

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
