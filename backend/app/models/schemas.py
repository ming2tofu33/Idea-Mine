from typing import Optional

from pydantic import BaseModel


class KeywordOut(BaseModel):
    id: str
    slug: str
    category: str
    label: str
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
    idea_line: str
    title: str
    summary: str
    keyword_combo: list[dict]
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
    concept: str
    problem: str
    target: str
    features: str
    differentiator: str
    revenue: str
    mvp_scope: str
    created_at: str
    updated_at: str


class AppraisalOut(BaseModel):
    id: str
    overview_id: str
    depth: str
    market_fit: str
    problem_fit: Optional[str] = None
    feasibility: str
    differentiation: Optional[str] = None
    scalability: Optional[str] = None
    risk: str


class ErrorResponse(BaseModel):
    error: str
    message: str
    retry_after: Optional[int] = None
