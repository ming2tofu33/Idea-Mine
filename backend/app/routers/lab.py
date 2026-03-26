from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import Client
from app.dependencies import get_supabase, get_current_user
from app.services import overview_service, full_overview_service
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

    existing = (
        supabase.table("overviews")
        .select("id")
        .eq("idea_id", req.idea_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if existing.data:
        raise HTTPException(
            status_code=409,
            detail={"error": "overview_exists", "message": "이 원석의 개요서가 이미 존재합니다"}
        )

    overview = await overview_service.generate_overview(
        supabase=supabase,
        user_id=user["id"],
        tier=user.get("tier", "free"),
        idea=idea,
        source="app",
    )
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

    # Pro 전용 체크
    if user.get("tier", "free") != "pro" and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Full overview is Pro-only")

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

    # 중복 체크
    existing = (
        supabase.table("full_overviews")
        .select("id")
        .eq("overview_id", req.overview_id)
        .execute()
    )
    if existing.data:
        raise HTTPException(
            status_code=409,
            detail={"error": "full_overview_exists", "message": "이 개요서의 풀 개요서가 이미 존재합니다"}
        )

    full_overview = await full_overview_service.generate_full_overview(
        supabase=supabase,
        user_id=user["id"],
        tier=user.get("tier", "free"),
        overview=overview,
        idea=idea,
        source="app",
    )
    return full_overview
