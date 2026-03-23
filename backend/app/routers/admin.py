from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.dependencies import get_supabase, get_current_user

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
