from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import Client
from app.dependencies import get_supabase, get_current_user
from app.services import appraisal_service
from app.services.market_research import research_market
from app.utils import validate_uuid

router = APIRouter(prefix="/lab", tags=["lab"])


class AppraisalRequest(BaseModel):
    overview_id: str
    depth: str = "basic"


@router.post("/appraisal")
async def create_appraisal(
    req: AppraisalRequest,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """개요서 → 감정 생성."""
    validate_uuid(req.overview_id, "overview_id")

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

    # 연결된 아이디어의 키워드 가져오기
    idea_result = (
        supabase.table("ideas")
        .select("keyword_combo, title_en, summary_en")
        .eq("id", overview["idea_id"])
        .execute()
    )
    keywords = idea_result.data[0]["keyword_combo"] if idea_result.data else []

    # Tavily 시장 조사 (개요서 생성 때와 동일한 데이터 재활용 목적이지만, 캐시가 없으므로 재조회)
    market_research = await research_market(
        title_en=idea_result.data[0]["title_en"] if idea_result.data else "",
        summary_en=idea_result.data[0]["summary_en"] if idea_result.data else "",
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
        source="app",
    )

    return appraisal
