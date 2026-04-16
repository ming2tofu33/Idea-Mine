from pydantic import BaseModel, Field


class KeywordSignal(BaseModel):
    keyword: str
    context: str | None = None


class NormalizedSeed(BaseModel):
    actors: list[str]
    tensions: list[str]
    outcomes: list[str]
    environments: list[str]
    surface_hints: list[str]
    mechanism_hints: list[str]
    premium_modifiers: list[str]
    family_biases: list[str] = Field(default_factory=list)
    ambiguous_keywords: list[KeywordSignal]
    unresolved_keywords: list[KeywordSignal]
    role_confidence_map: dict[str, float]
    seed_strength_score: float
    seed_strength_label: str
    physical_world_relevance: float


class BranchPlan(BaseModel):
    primary_family: str
    secondary_family: str
    contrast_family: str | None = None
    slot_distribution: dict[str, int]
    primary_allowed_subfamilies: list[str]
    secondary_allowed_subfamilies: list[str]
    contrast_allowed_subfamilies: list[str]
    ai_variant_budget: int
    branching_confidence: str
