import time
from datetime import date
from fastapi import HTTPException
from supabase import Client

# L1: 속도 제한 (인메모리)
_request_counts: dict[str, list[float]] = {}

TIER_LIMITS = {
    "free": {"rerolls": 2, "generations": 1, "overviews": 3},
    "lite": {"rerolls": 10, "generations": 5, "overviews": 10},
    "pro": {"rerolls": 20, "generations": 50, "overviews": 30},
}


def check_rate_limit_l1(user_id: str, role: str = "user") -> None:
    """L1: 분당 3회, 시간당 20회 속도 제한. admin은 건너뜀."""
    if role == "admin":
        return
    now = time.time()
    key = f"mining:{user_id}"

    if key not in _request_counts:
        _request_counts[key] = []

    # 1시간 이상 된 기록 제거
    _request_counts[key] = [t for t in _request_counts[key] if now - t < 3600]

    # 분당 체크
    recent_minute = [t for t in _request_counts[key] if now - t < 60]
    if len(recent_minute) >= 3:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "rate_limited",
                "message": "광맥이 불안정합니다. 잠시 후 다시 시도해주세요",
                "retry_after": 20,
            },
        )

    # 시간당 체크
    if len(_request_counts[key]) >= 20:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "rate_limited",
                "message": "광맥이 불안정합니다. 잠시 후 다시 시도해주세요",
                "retry_after": 300,
            },
        )

    _request_counts[key].append(now)


async def check_daily_limit_l2(
    supabase: Client,
    user_id: str,
    tier: str,
    action: str,
    role: str = "user",
) -> dict:
    """L2: 일일 상한 체크. admin은 상한 체크를 건너뛰고 state만 반환."""
    today = date.today().isoformat()
    limits = TIER_LIMITS.get(tier, TIER_LIMITS["free"])

    # 오늘 상태 조회 또는 생성
    result = (
        supabase.table("user_daily_state")
        .select("*")
        .eq("user_id", user_id)
        .eq("date", today)
        .execute()
    )

    if result.data and len(result.data) > 0:
        state = result.data[0]
    else:
        insert_result = (
            supabase.table("user_daily_state")
            .insert({"user_id": user_id, "date": today})
            .execute()
        )
        state = insert_result.data[0]

    # admin은 상한 체크 건너뜀
    if role == "admin":
        return state

    # 액션별 상한 체크 (action="none"이면 조회만)
    if action == "reroll":
        if state["rerolls_used"] >= limits["rerolls"]:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "daily_limit",
                    "message": "오늘의 리롤을 모두 사용했습니다",
                },
            )
    elif action == "generation":
        if state["generations_used"] >= limits["generations"]:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "daily_limit",
                    "message": "오늘의 채굴 에너지를 모두 사용했습니다. 내일 광맥이 새로 열립니다",
                },
            )
    elif action == "overview":
        if state.get("overviews_used", 0) >= limits["overviews"]:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "daily_limit",
                    "message": "오늘의 문서 생성 한도에 도달했습니다",
                },
            )

    return state


# L4: 비용 차단기 (일일 AI 비용 상한)
DAILY_COST_LIMITS = {
    "free": 0.10,    # $0.10/일
    "lite": 0.50,    # $0.50/일
    "pro": 2.00,     # $2.00/일
}

SYSTEM_DAILY_BUDGET = 50.00  # 시스템 전체 $50/일


async def check_cost_limit_l4(
    supabase: Client,
    user_id: str,
    tier: str,
    role: str = "user",
) -> None:
    """L4: 일일 AI 비용 상한. admin 건너뜀. 모든 AI 호출의 비용 합산 기준."""
    if role == "admin":
        return

    today = date.today().isoformat()

    # 유저 일일 비용 합산
    result = (
        supabase.table("ai_usage_logs")
        .select("total_cost_usd")
        .eq("user_id", user_id)
        .gte("created_at", f"{today}T00:00:00+00:00")
        .execute()
    )

    user_daily_cost = sum(
        float(row.get("total_cost_usd", 0)) for row in (result.data or [])
    )

    user_limit = DAILY_COST_LIMITS.get(tier, DAILY_COST_LIMITS["free"])
    if user_daily_cost >= user_limit:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "cost_limit",
                "message": "오늘의 광산 자원이 소진되었습니다",
            },
        )


async def increment_daily_count(
    supabase: Client,
    user_id: str,
    action: str,
    current_state: dict | None = None,
) -> None:
    """일일 사용량 +1. current_state가 있으면 SELECT 생략."""
    today = date.today().isoformat()
    field = f"{action}s_used"

    if current_state:
        new_count = current_state[field] + 1
    else:
        result = (
            supabase.table("user_daily_state")
            .select(field)
            .eq("user_id", user_id)
            .eq("date", today)
            .single()
            .execute()
        )
        new_count = result.data[field] + 1

    (
        supabase.table("user_daily_state")
        .update({field: new_count})
        .eq("user_id", user_id)
        .eq("date", today)
        .execute()
    )
