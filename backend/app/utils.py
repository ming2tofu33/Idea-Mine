"""공통 유틸리티."""

from uuid import UUID
from fastapi import HTTPException


def validate_uuid(value: str, name: str = "ID") -> str:
    """UUID 형식 검증. mock ID 등 잘못된 형식 차단."""
    try:
        UUID(value)
        return value
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid {name} format")
