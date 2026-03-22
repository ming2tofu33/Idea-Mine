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
