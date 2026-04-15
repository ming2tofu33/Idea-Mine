from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import Client

from app.dependencies import get_current_user, get_supabase
from app.models.schemas import AppraisalOut
from app.services import appraisal_service
from app.services.market_research import research_market
from app.services.rate_limiter import (
    check_cost_limit_l4,
    check_daily_limit_l2,
    check_rate_limit_l1,
)
from app.utils import validate_uuid

router = APIRouter(prefix="/lab", tags=["lab"])


class AppraisalRequest(BaseModel):
    overview_id: str
    depth: Literal["basic_free", "basic", "precise_lite", "precise_pro"] = "basic"


@router.post("/appraisal", response_model=AppraisalOut)
async def create_appraisal(
    req: AppraisalRequest,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Generate an appraisal for an overview."""

    validate_uuid(req.overview_id, "overview_id")

    effective_role = user.get("role", "user")
    check_rate_limit_l1(user["id"], role=effective_role)
    await check_daily_limit_l2(
        supabase,
        user["id"],
        user.get("tier", "free"),
        "overview",
        role=effective_role,
    )
    await check_cost_limit_l4(
        supabase,
        user["id"],
        user.get("tier", "free"),
        role=effective_role,
    )

    tier = user.get("tier", "free")
    role = user.get("role")
    if role != "admin":
        tier_access = {
            "free": {"basic_free"},
            "lite": {"basic_free", "basic", "precise_lite"},
            "pro": {"basic_free", "basic", "precise_lite", "precise_pro"},
        }
        allowed = tier_access.get(tier, {"basic_free"})
        if req.depth not in allowed:
            raise HTTPException(
                status_code=403,
                detail=f"{req.depth} requires a higher tier",
            )

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

    idea_result = (
        supabase.table("ideas")
        .select("keyword_combo, title, summary")
        .eq("id", overview["idea_id"])
        .eq("user_id", user["id"])
        .execute()
    )
    keywords = idea_result.data[0]["keyword_combo"] if idea_result.data else []

    market_research = await research_market(
        title=idea_result.data[0]["title"] if idea_result.data else "",
        summary=idea_result.data[0]["summary"] if idea_result.data else "",
        keywords=keywords,
    )

    appraisal = await appraisal_service.generate_appraisal(
        supabase=supabase,
        user_id=user["id"],
        tier=user.get("tier", "free"),
        overview=overview,
        keywords=keywords,
        market_research=market_research,
        depth=req.depth,
        source="web",
    )

    return appraisal
