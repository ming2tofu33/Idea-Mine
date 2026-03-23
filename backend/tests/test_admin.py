import pytest
from fastapi import HTTPException
from app.routers.admin import require_admin


def test_require_admin_allows_admin():
    user = {"id": "test", "role": "admin", "tier": "free"}
    result = require_admin(user)
    assert result["role"] == "admin"


def test_require_admin_blocks_regular_user():
    user = {"id": "test", "role": "user", "tier": "free"}
    with pytest.raises(HTTPException) as exc:
        require_admin(user)
    assert exc.value.status_code == 403
