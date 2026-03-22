from pydantic import BaseModel
from typing import Optional


class KeywordOut(BaseModel):
    id: str
    slug: str
    category: str
    ko: str
    en: str
    is_premium: bool


class VeinOut(BaseModel):
    id: str
    slot_index: int
    keyword_ids: list[str]
    keywords: list[KeywordOut]
    rarity: str
    is_selected: bool


class TodayVeinsResponse(BaseModel):
    veins: list[VeinOut]
    rerolls_used: int
    rerolls_max: int
    generations_used: int
    generations_max: int


class IdeaOut(BaseModel):
    id: str
    title: str
    summary: str
    keyword_combo: list[dict]
    tier_type: str
    sort_order: int
    is_vaulted: bool
    language: str


class MineResponse(BaseModel):
    ideas: list[IdeaOut]
    vein_id: str


class RerollResponse(BaseModel):
    veins: list[VeinOut]
    rerolls_used: int
    rerolls_max: int


class ErrorResponse(BaseModel):
    error: str
    message: str
    retry_after: Optional[int] = None
