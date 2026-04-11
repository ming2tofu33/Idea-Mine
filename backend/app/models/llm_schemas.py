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


class OverviewProjectIntro(BaseModel):
    summary: str


class OverviewUserAndProblem(BaseModel):
    target_user: str
    problem_situation: str
    why_it_matters: str


class OverviewWhyNow(BaseModel):
    reason_to_try: str
    gap_in_existing_options: str
    why_small_prototype_is_enough: str


class OverviewSmallestPrototype(BaseModel):
    prototype_description: str
    core_experience: str
    not_in_scope: list[str]


class OverviewFirstUserExperience(BaseModel):
    entry_point: str
    first_actions: list[str]
    initial_value: str


class OverviewKeyAssumption(BaseModel):
    assumption: str
    why_it_matters: str
    risk_if_wrong: str


class OverviewRisksAndOpenQuestions(BaseModel):
    main_risks: list[str]
    open_questions: list[str]


class OverviewValidationPlan(BaseModel):
    what_to_build: str
    who_to_test_with: str
    signals_to_watch: list[str]
    next_step_if_positive: str


class OverviewSections(BaseModel):
    project_intro: OverviewProjectIntro
    user_and_problem: OverviewUserAndProblem
    why_now: OverviewWhyNow
    smallest_prototype: OverviewSmallestPrototype
    first_user_experience: OverviewFirstUserExperience
    key_assumptions: list[OverviewKeyAssumption]
    risks_and_open_questions: OverviewRisksAndOpenQuestions
    validation_plan: OverviewValidationPlan


class OverviewClaim(BaseModel):
    text: str
    type: Literal["idea", "assumption", "needs_check"]
    status: Literal["kept", "softened", "moved_to_assumption", "unresolved"]


class OverviewConsistencyChecks(BaseModel):
    same_user: bool
    same_product: bool
    no_major_contradiction: bool


class OverviewInternalMeta(BaseModel):
    claims: list[OverviewClaim]
    consistency_checks: OverviewConsistencyChecks
    quality_notes: list[str]


class OverviewDocumentResponse(BaseModel):
    title: str
    one_liner: str
    language: str
    content: OverviewSections
    internal_meta: OverviewInternalMeta


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
