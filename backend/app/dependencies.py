import time
from fastapi import Depends, HTTPException, Header
from supabase import create_client, Client
from app.config import settings

_supabase: Client | None = None

# 유저 인증 캐시: token -> (user_dict, expires_at)
_user_cache: dict[str, tuple[dict, float]] = {}
_USER_CACHE_TTL = 60  # seconds


def get_supabase() -> Client:
    """Supabase service client (백엔드 전용, RLS 우회)."""
    global _supabase
    if _supabase is None:
        _supabase = create_client(
            settings.supabase_url,
            settings.supabase_service_key,
        )
    return _supabase


def invalidate_user_cache(user_id: str) -> None:
    """특정 유저의 캐시를 무효화 (프로필 변경 시 사용)."""
    to_remove = [k for k, (v, _) in _user_cache.items() if v.get("id") == user_id]
    for k in to_remove:
        del _user_cache[k]


async def get_current_user(
    authorization: str = Header(..., description="Bearer <supabase_jwt>"),
    supabase: Client = Depends(get_supabase),
) -> dict:
    """프론트에서 보낸 Supabase JWT를 검증하고 유저 정보를 반환. 60초 캐시."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.replace("Bearer ", "")

    # 캐시 히트
    now = time.time()
    cached = _user_cache.get(token)
    if cached and cached[1] > now:
        return cached[0]

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

    result = {
        "id": user.id,
        "email": user.email,
        **profile.data,
    }

    # 캐시 저장 + 오래된 항목 정리
    _user_cache[token] = (result, now + _USER_CACHE_TTL)
    if len(_user_cache) > 100:
        expired = [k for k, (_, exp) in _user_cache.items() if exp <= now]
        for k in expired:
            del _user_cache[k]

    return result


def get_effective_tier(user: dict) -> str:
    """admin이 페르소나를 설정했으면 페르소나 티어, 아니면 실제 티어."""
    if user.get("role") == "admin" and user.get("persona_tier"):
        return user["persona_tier"]
    return user.get("tier", "free")


def get_effective_role(user: dict) -> str:
    """admin이 페르소나를 설정했으면 'user'(제한 적용), 아니면 실제 role."""
    if user.get("role") == "admin" and not user.get("persona_tier"):
        return "admin"
    return "user"
