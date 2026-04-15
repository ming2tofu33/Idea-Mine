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
    idea_line: str
    title: str
    summary: str


class MiningResponse(BaseModel):
    ideas: list[MiningIdea]


# --- Concept ---

class ConceptResponse(BaseModel):
    concept: str
    product_type: Literal["B2C", "B2B"]
    primary_user: str
    core_experience: str


# --- Overview ---

class OverviewResponse(BaseModel):
    concept: str
    problem: str
    target: str
    features: str
    differentiator: str
    revenue: str
    mvp_scope: str


# --- Appraisal ---

class AppraisalBasicFreeResponse(BaseModel):
    market_fit: str
    feasibility: str
    risk: str


class AppraisalFullResponse(BaseModel):
    market_fit: str
    problem_fit: str
    feasibility: str
    differentiation: str
    scalability: str
    risk: str


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
    tech_stack_frontend: str
    tech_stack_backend: str
    tech_stack_database: str
    tech_stack_ai_ml: str
    tech_stack_auth: str
    tech_stack_hosting: str
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


# --- Product Design (제품 설계서) ---

class ProductDesignResponse(BaseModel):
    user_flow: list[str]
    screens: list[str]
    features_must: list[str]
    features_should: list[str]
    features_later: list[str]
    business_model: str
    business_rules: list[str]
    mvp_scope: str


# --- Blueprint (기술 청사진) ---

class BlueprintResponse(BaseModel):
    tech_stack: list[str]
    data_model_sql: str
    api_endpoints: list[str]
    file_structure: str
    external_services: list[str]
    auth_flow: list[str]


# --- Roadmap (실행 로드맵) ---

class RoadmapResponse(BaseModel):
    phase_0: list[str]
    phase_1: list[str]
    phase_2: list[str]
    validation_checkpoints: list[str]
    estimated_complexity: str
    first_sprint_tasks: list[str]
