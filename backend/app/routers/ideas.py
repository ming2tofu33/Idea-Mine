"""
IDEA MINE — Ideas Router
Vault 반입 엔드포인트 (가방 용량 서버 검증)
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import Client
from app.dependencies import get_supabase, get_current_user

router = APIRouter(prefix="/ideas", tags=["ideas"])

BAG_CAPACITY_BY_LEVEL = {
    1: 2, 2: 2, 3: 3, 4: 3, 5: 4, 6: 4, 7: 5, 8: 5, 9: 5, 10: 5,
}


class VaultRequest(BaseModel):
    idea_ids: list[str]
    vein_id: str


class VaultResponse(BaseModel):
    vaulted_count: int
    idea_ids: list[str]


def _get_bag_capacity(level: int) -> int:
    if level <= 0:
        return 2
    if level > 10:
        return 5
    return BAG_CAPACITY_BY_LEVEL.get(level, 2)


@router.patch("/vault", response_model=VaultResponse)
async def vault_ideas(
    req: VaultRequest,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """선택된 아이디어를 Vault에 반입. 가방 용량 서버 검증."""
    tier = user.get("tier", "free")
    level = user.get("miner_level", 1)

    if tier in ("lite", "pro"):
        max_items = 10
    else:
        max_items = _get_bag_capacity(level)

    if len(req.idea_ids) > max_items:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "bag_capacity_exceeded",
                "message": f"가방에는 {max_items}개까지 담을 수 있어요",
            },
        )

    ideas = (
        supabase.table("ideas")
        .select("id")
        .eq("user_id", user["id"])
        .eq("vein_id", req.vein_id)
        .in_("id", req.idea_ids)
        .execute()
    )

    found_ids = [i["id"] for i in ideas.data]
    if len(found_ids) != len(req.idea_ids):
        raise HTTPException(
            status_code=404,
            detail={
                "error": "ideas_not_found",
                "message": "일부 원석을 찾을 수 없습니다",
            },
        )

    supabase.table("ideas").update(
        {"is_vaulted": True}
    ).eq("user_id", user["id"]).in_("id", found_ids).execute()

    return VaultResponse(vaulted_count=len(found_ids), idea_ids=found_ids)
