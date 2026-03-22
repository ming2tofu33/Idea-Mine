from fastapi import Depends, HTTPException, Header
from supabase import create_client, Client
from app.config import settings

_supabase: Client | None = None


def get_supabase() -> Client:
    """Supabase service client (백엔드 전용, RLS 우회)."""
    global _supabase
    if _supabase is None:
        _supabase = create_client(
            settings.supabase_url,
            settings.supabase_service_key,
        )
    return _supabase


async def get_current_user(
    authorization: str = Header(..., description="Bearer <supabase_jwt>"),
    supabase: Client = Depends(get_supabase),
) -> dict:
    """프론트에서 보낸 Supabase JWT를 검증하고 유저 정보를 반환."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.replace("Bearer ", "")

    try:
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication failed")

    profile = (
        supabase.table("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .execute()
    )

    if not profile.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    return {
        "id": user.id,
        "email": user.email,
        **profile.data,
    }
