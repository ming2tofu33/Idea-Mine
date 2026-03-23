from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import Client
from app.dependencies import get_supabase, get_current_user
from app.services import overview_service
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
