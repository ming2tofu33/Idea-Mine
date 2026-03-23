from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import Client
from app.dependencies import get_supabase, get_current_user
from app.services import vein_service
from app.models.schemas import TodayVeinsResponse
from app.services.rate_limiter import TIER_LIMITS, check_daily_limit_l2

router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(user: dict = Depends(get_current_user)) -> dict:
    """Admin role 검증 미들웨어."""
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.post("/reset-daily-state")
async def reset_daily_state(
    user: dict = Depends(require_admin),
    supabase: Client = Depends(get_supabase),
):
    """오늘의 user_daily_state 초기화 (rerolls_used=0, generations_used=0, overviews_used=0)."""
    today = date.today().isoformat()

    supabase.table("user_daily_state").delete().eq(
        "user_id", user["id"]
    ).eq("date", today).execute()

    return {
        "status": "ok",
        "message": "일일 상태가 리셋되었습니다",
        "date": today,
    }


@router.post("/regenerate-veins", response_model=TodayVeinsResponse)
async def regenerate_veins(
    user: dict = Depends(require_admin),
    supabase: Client = Depends(get_supabase),
):
    """오늘 광맥 삭제 + 새 광맥 3개 강제 생성."""
    veins = await vein_service.reroll_veins(supabase, user["id"], user["tier"])
    veins = await vein_service.resolve_vein_keywords(supabase, veins)

    state = await check_daily_limit_l2(
        supabase, user["id"], user["tier"], action="none", role="admin"
    )
    limits = TIER_LIMITS.get(user["tier"], TIER_LIMITS["free"])

    return TodayVeinsResponse(
        veins=veins,
        rerolls_used=state["rerolls_used"],
        rerolls_max=limits["rerolls"],
        generations_used=state["generations_used"],
        generations_max=limits["generations"],
    )


class PersonaRequest(BaseModel):
    persona_tier: Optional[str] = None


@router.post("/persona")
async def set_persona(
    body: PersonaRequest,
    user: dict = Depends(require_admin),
    supabase: Client = Depends(get_supabase),
):
    """페르소나 전환. persona_tier=null이면 admin 무제한 모드 복귀."""
    if body.persona_tier and body.persona_tier not in ("free", "lite", "pro"):
        raise HTTPException(status_code=400, detail="Invalid tier. Use: free, lite, pro, or null")

    supabase.rpc(
        "exec_admin_persona",
        {"target_user_id": user["id"], "target_tier": body.persona_tier},
    ).execute()

    return {
        "status": "ok",
        "persona_tier": body.persona_tier,
        "message": f"페르소나가 {'해제' if body.persona_tier is None else body.persona_tier + ' 모드로 전환'}되었습니다",
    }
