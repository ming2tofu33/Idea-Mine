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
    title_ko: str
    title_en: str
    summary_ko: str
    summary_en: str
    keyword_combo: list[dict]
    tier_type: str
    sort_order: int
    is_vaulted: bool


class MineResponse(BaseModel):
    ideas: list[IdeaOut]
    vein_id: str


class RerollResponse(BaseModel):
    veins: list[VeinOut]
    rerolls_used: int
    rerolls_max: int


class OverviewOut(BaseModel):
    id: str
    idea_id: str
    user_id: str
    title: str
    one_liner: str
    language: str
    content: dict
    internal_meta: dict
    created_at: str
    updated_at: str


class AppraisalOut(BaseModel):
    id: str
    overview_id: str
    depth: str  # basic_free, basic, precise_lite, precise_pro
    market_fit_ko: str
    market_fit_en: str
    problem_fit_ko: Optional[str] = None
    problem_fit_en: Optional[str] = None
    feasibility_ko: str
    feasibility_en: str
    differentiation_ko: Optional[str] = None
    differentiation_en: Optional[str] = None
    scalability_ko: Optional[str] = None
    scalability_en: Optional[str] = None
    risk_ko: str
    risk_en: str


class ErrorResponse(BaseModel):
    error: str
    message: str
    retry_after: Optional[int] = None
