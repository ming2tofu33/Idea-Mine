import pytest
from app.services.rate_limiter import check_rate_limit_l1, _request_counts, TIER_LIMITS
from fastapi import HTTPException


def test_l1_allows_first_request():
    _request_counts.clear()
    check_rate_limit_l1("test-user-1")


def test_l1_blocks_after_3_per_minute():
    _request_counts.clear()
    check_rate_limit_l1("test-user-2")
    check_rate_limit_l1("test-user-2")
    check_rate_limit_l1("test-user-2")
    with pytest.raises(HTTPException) as exc:
        check_rate_limit_l1("test-user-2")
    assert exc.value.status_code == 429


def test_l1_different_users_independent():
    _request_counts.clear()
    check_rate_limit_l1("user-a")
    check_rate_limit_l1("user-a")
    check_rate_limit_l1("user-a")
    # user-b should still be allowed
    check_rate_limit_l1("user-b")


def test_tier_limits_exist():
    assert "free" in TIER_LIMITS
    assert "lite" in TIER_LIMITS
    assert "pro" in TIER_LIMITS
    assert TIER_LIMITS["free"]["generations"] == 1
    assert TIER_LIMITS["free"]["rerolls"] == 2
    assert TIER_LIMITS["pro"]["generations"] == 50
    assert TIER_LIMITS["pro"]["rerolls"] == 20


def test_l1_admin_bypasses_rate_limit():
    """admin은 L1 속도 제한에 걸리지 않는다."""
    _request_counts.clear()
    for _ in range(10):
        check_rate_limit_l1("admin-user", role="admin")


def test_l2_admin_bypasses_daily_limit():
    """admin은 L2 일일 상한을 체크하지 않고 state만 반환."""
    from unittest.mock import MagicMock
    from app.services.rate_limiter import check_daily_limit_l2

    mock_supabase = MagicMock()
    mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = [
        {"rerolls_used": 999, "generations_used": 999, "overviews_used": 999}
    ]

    import asyncio
    state = asyncio.run(
        check_daily_limit_l2(mock_supabase, "admin-user", "free", "generation", role="admin")
    )
    assert state["generations_used"] == 999
