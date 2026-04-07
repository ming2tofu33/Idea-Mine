"""
Pydantic models for LLM structured outputs.
Used with client.beta.chat.completions.parse(response_format=Model).
GPT-5 strict mode requires all fields to be required (no Optional).
"""
from pydantic import BaseModel
from typing import Literal


# --- Mining ---

class MiningIdea(BaseModel):
    sort_order: int
    title_ko: str
    title_en: str
    summary_ko: str
    summary_en: str


class MiningResponse(BaseModel):
    ideas: list[MiningIdea]


# --- Concept ---

class ConceptResponse(BaseModel):
    concept_en: str
    concept_ko: str
    product_type: Literal["B2C", "B2B"]
    primary_user_en: str
    primary_user_ko: str
    core_experience_en: str
    core_experience_ko: str


# --- Overview ---

class OverviewResponse(BaseModel):
    concept_ko: str
    concept_en: str
    problem_ko: str
    problem_en: str
    target_ko: str
    target_en: str
    features_ko: str
    features_en: str
    differentiator_ko: str
    differentiator_en: str
    revenue_ko: str
    revenue_en: str
    mvp_scope_ko: str
    mvp_scope_en: str


# --- Appraisal ---

class AppraisalBasicFreeResponse(BaseModel):
    market_fit_ko: str
    market_fit_en: str
    feasibility_ko: str
    feasibility_en: str
    risk_ko: str
    risk_en: str


class AppraisalFullResponse(BaseModel):
    market_fit_ko: str
    market_fit_en: str
    problem_fit_ko: str
    problem_fit_en: str
    feasibility_ko: str
    feasibility_en: str
    differentiation_ko: str
    differentiation_en: str
    scalability_ko: str
    scalability_en: str
    risk_ko: str
    risk_en: str


# --- Full Overview (merged narrative + technical) ---

class FullOverviewResponse(BaseModel):
    # Narrative
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
    # Technical
    tech_stack: list[str]
    data_model_sql: str
    api_endpoints: list[str]
    file_structure: str
    external_services: list[str]
    auth_flow: list[str]


# --- Axes Classification ---

class IdeaAxesResponse(BaseModel):
    interface_complexity: Literal["high", "medium", "low"]
    business_complexity: Literal["high", "medium", "low"]
    technical_complexity: Literal["high", "medium", "low"]
    reasoning: str


# --- Self-Critique ---

class CritiqueResponse(BaseModel):
    score: int
    needs_regeneration: bool
    depth_match: str
    actionability: str
    consistency: str
    feedback: str
