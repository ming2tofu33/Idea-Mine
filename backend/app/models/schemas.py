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


class OreKeywordIn(BaseModel):
    id: str
    label: str
    category: str


class OreDiscoverRequest(BaseModel):
    vein_id: str


class OreVisibleKeyword(BaseModel):
    id: str
    label: str


class OreDailyVeinOut(BaseModel):
    id: str
    slot_index: int
    keywords: list[OreVisibleKeyword]
    is_mined: bool


class OreTodayVeinsResponse(BaseModel):
    veins: list[OreDailyVeinOut]
    rerolls_used: int
    rerolls_max: int
    generations_used: int
    generations_max: int


class OreVeinOut(BaseModel):
    id: str
    keywords: list[OreVisibleKeyword]


class IdeaOreOut(BaseModel):
    id: str
    title: str
    one_liner: str
    short_summary: str
    interesting_point: str
    project_fit: str
    risk: str
    mvp_hint: str
    selected_keywords: list[OreVisibleKeyword]
    sort_order: int
    is_vaulted: bool


class OreDiscoverResponse(BaseModel):
    vein: OreVeinOut
    ores: list[IdeaOreOut]


class OreVaultResponse(BaseModel):
    ore_id: str
    is_vaulted: bool


class ProjectSeedBriefOut(BaseModel):
    id: str
    ore_id: str
    product_concept: str
    target_user: str
    core_loop: list[str]
    mvp_features: list[str]
    first_screens: list[str]
    not_to_build: list[str]
    data_model_hint: str
    api_hint: str
    vibe_coding_prompt: str


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


class UsageBucketOut(BaseModel):
    used: int
    limit: int


class UsageInfoOut(BaseModel):
    tier: str
    overviews: UsageBucketOut
    generations: UsageBucketOut


class FullOverviewOut(BaseModel):
    id: str
    user_id: str
    overview_id: str
    concept: str
    problem: str
    target_user: str
    features_must: list[str]
    features_should: list[str]
    features_later: list[str]
    user_flow: list[str]
    screens: list[str]
    business_model: str
    business_rules: list[str]
    mvp_scope: str
    tech_stack: dict[str, str]
    data_model_sql: str
    api_endpoints: list[str]
    file_structure: str
    external_services: list[str]
    auth_flow: list[str]
    created_at: str
    updated_at: str


class ProductDesignAxesOut(BaseModel):
    interface_complexity: str
    business_complexity: str
    technical_complexity: str


class ProductDesignOut(BaseModel):
    id: str
    user_id: str
    overview_id: str
    user_flow: list[str]
    screens: list[str]
    features_must: list[str]
    features_should: list[str]
    features_later: list[str]
    business_model: str
    business_rules: list[str]
    mvp_scope: str
    axes: Optional[ProductDesignAxesOut] = None
    created_at: str


class BlueprintOut(BaseModel):
    id: str
    user_id: str
    design_id: str
    tech_stack: list[str]
    data_model_sql: str
    api_endpoints: list[str]
    file_structure: str
    external_services: list[str]
    auth_flow: list[str]
    created_at: str


class RoadmapOut(BaseModel):
    id: str
    user_id: str
    blueprint_id: str
    phase_0: list[str]
    phase_1: list[str]
    phase_2: list[str]
    validation_checkpoints: list[str]
    estimated_complexity: str
    first_sprint_tasks: list[str]
    created_at: str


class GenerateAllOut(BaseModel):
    design: ProductDesignOut
    blueprint: BlueprintOut
    roadmap: RoadmapOut


class ErrorResponse(BaseModel):
    error: str
    message: str
    retry_after: Optional[int] = None
