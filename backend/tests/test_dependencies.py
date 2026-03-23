from app.dependencies import get_effective_tier, get_effective_role


def test_regular_user_tier():
    user = {"role": "user", "tier": "free", "persona_tier": None}
    assert get_effective_tier(user) == "free"


def test_regular_user_role():
    user = {"role": "user", "tier": "free", "persona_tier": None}
    assert get_effective_role(user) == "user"


def test_admin_no_persona_tier():
    """admin + persona_tier=NULL -> 실제 tier, admin 역할 (무제한)."""
    user = {"role": "admin", "tier": "free", "persona_tier": None}
    assert get_effective_tier(user) == "free"
    assert get_effective_role(user) == "admin"


def test_admin_with_persona_free():
    """admin + persona_tier=free -> free 티어, user 역할 (제한 적용)."""
    user = {"role": "admin", "tier": "free", "persona_tier": "free"}
    assert get_effective_tier(user) == "free"
    assert get_effective_role(user) == "user"


def test_admin_with_persona_pro():
    """admin + persona_tier=pro -> pro 티어, user 역할 (pro 제한 적용)."""
    user = {"role": "admin", "tier": "free", "persona_tier": "pro"}
    assert get_effective_tier(user) == "pro"
    assert get_effective_role(user) == "user"


def test_admin_with_persona_lite():
    """admin + persona_tier=lite -> lite 티어, user 역할."""
    user = {"role": "admin", "tier": "free", "persona_tier": "lite"}
    assert get_effective_tier(user) == "lite"
    assert get_effective_role(user) == "user"
