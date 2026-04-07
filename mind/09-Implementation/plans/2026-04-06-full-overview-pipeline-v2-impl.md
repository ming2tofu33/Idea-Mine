# Full Overview Pipeline v2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 풀 개요서 생성에 3축 분류(Interface/Business/Technical) → 섹션 가중치 → Self-Critique 루프를 적용하여 품질을 높인다.

**Architecture:** 기존 1회 호출 파이프라인 앞뒤에 2개 단계를 추가한다. (1) 축 분류(gpt-5-nano)로 아이디어 유형을 파악하고 Python에서 섹션별 depth instruction을 생성, (2) 생성 후 Self-Critique(gpt-5-mini)로 품질 점수를 매기고 임계치 미달 시 피드백 포함 재생성. 기존 라우터와 DB 스키마는 변경하지 않는다.

**Tech Stack:** Python, OpenAI API (gpt-5-nano, gpt-5, gpt-5-mini), Pydantic

---

## 현재 파이프라인

```
concept 복원 → 시장 조사 → 풀 개요 생성 (gpt-5, 1회) → DB 저장
```

## v2 파이프라인

```
concept 복원 → 시장 조사
  → [NEW] 축 분류 (gpt-5-nano)
  → [NEW] 섹션 가중치 생성 (Python)
  → 풀 개요 생성 (gpt-5, depth guide 주입)
  → [NEW] Self-Critique (gpt-5-mini)
  → [NEW] 점수 < 70이면 재생성 (피드백 포함, 1회만)
  → DB 저장
```

---

### Task 1: Pydantic 스키마 추가

**Files:**
- Modify: `backend/app/models/llm_schemas.py`

**추가할 모델:**

```python
# --- Axes Classification ---

class IdeaAxesResponse(BaseModel):
    interface_complexity: Literal["high", "medium", "low"]
    business_complexity: Literal["high", "medium", "low"]
    technical_complexity: Literal["high", "medium", "low"]
    reasoning: str


# --- Self-Critique ---

class CritiqueResponse(BaseModel):
    score: int  # 0-100
    needs_regeneration: bool
    depth_match: str     # high 축 섹션이 충분히 깊은가
    actionability: str   # 개발자가 바로 코딩 가능한가
    consistency: str     # features ↔ API ↔ data model 일치
    feedback: str        # 재생성 시 포함할 구체적 지시
```

**Commit:** `feat: add IdeaAxesResponse and CritiqueResponse schemas`

---

### Task 2: 축 분류 프롬프트

**Files:**
- Create: `backend/app/prompts/axes_classifier.py`

**내용:**

```python
def build_axes_prompt(
    concept: dict,
    keywords: list[dict],
    product_type: str,
) -> tuple[str, str]:
    """아이디어의 Interface/Business/Technical 복잡도를 분류."""

    system_prompt = """You classify product ideas by 3 complexity axes.

AXES:
- interface_complexity: How many user-facing screens and flows?
  high = 10+ screens, multi-step flows, onboarding
  medium = 5-9 screens, dashboard-style
  low = API-only, CLI, no UI or minimal admin panel

- business_complexity: How complex are pricing, rules, multi-sided dynamics?
  high = tiered pricing, marketplace dynamics, escrow, role-based access
  medium = simple subscription or usage-based pricing
  low = free tool, single pricing, no complex rules

- technical_complexity: How technically challenging to build?
  high = AI/ML pipeline, real-time processing, hardware integration, complex algorithms
  medium = standard API integrations, moderate data processing
  low = standard CRUD, well-known patterns, no special infrastructure

Provide brief reasoning (1-2 sentences) explaining your classification.

VERIFICATION: Ensure axes are independent — a product can be high on one axis and low on another."""

    kw_text = ", ".join(f"{k.get('category','')}: {k.get('en','')}" for k in keywords)

    user_prompt = f"""Classify this product idea:

Concept: {concept.get("concept_en", "")}
Product Type: {product_type}
Keywords: {kw_text}
Primary User: {concept.get("primary_user_en", "")}
Core Experience: {concept.get("core_experience_en", "")}"""

    return system_prompt, user_prompt
```

**Commit:** `feat: axes classifier prompt for idea type classification`

---

### Task 3: 섹션 가중치 매핑 (Python, LLM 호출 없음)

**Files:**
- Create: `backend/app/services/depth_guide.py`

**내용:**

```python
"""
3축 분류 결과 → 15섹션별 depth instruction 생성.
LLM 호출 없음. 순수 Python 매핑.
"""

INTERFACE_GUIDE = {
    "high": {
        "user_flow": "Write 10-12 detailed steps including edge cases and error states.",
        "screens": "List 10+ screens. For each: name, what user sees, primary action.",
        "features_must": "Describe 4-5 Must features with screen-level detail: [screen] → [action] → [result].",
    },
    "medium": {
        "user_flow": "Write 8 steps covering the main happy path.",
        "screens": "List 6-8 key screens with brief descriptions.",
        "features_must": "Describe 3-4 Must features with action → result format.",
    },
    "low": {
        "user_flow": "Write 3-5 steps focused on API integration flow, not UI navigation.",
        "screens": "This is an API/CLI product. List only admin dashboard screens if any, or state 'No user-facing screens'.",
        "features_must": "Describe 3-4 Must features as API capabilities, not screen interactions.",
    },
}

BUSINESS_GUIDE = {
    "high": {
        "business_rules": "Write 10+ specific rules with concrete numbers. Include: rate limits, tier restrictions, marketplace fees, dispute resolution, content policies.",
        "business_model": "Define 3 pricing tiers with specific $ amounts. Include 2 competitor price benchmarks. Project MRR for 100/1K/10K users.",
        "mvp_scope": "Clearly define IN (5-7 items) and OUT (4-5 items). State 3 validation hypotheses. Describe the cheapest test method specific to this business type.",
    },
    "medium": {
        "business_rules": "Write 5-7 key rules with specific limits.",
        "business_model": "Define pricing with 1-2 tiers and $ amounts. Include 1 competitor benchmark.",
        "mvp_scope": "Define IN/OUT lists. State 1 core hypothesis and test method.",
    },
    "low": {
        "business_rules": "Write 3 essential rules only.",
        "business_model": "Describe the simple revenue model in 1-2 sentences.",
        "mvp_scope": "Brief IN/OUT. State the single most important thing to validate.",
    },
}

TECHNICAL_GUIDE = {
    "high": {
        "tech_stack": "For each of 6 components, explain WHY in 2-3 sentences. Mention alternatives considered.",
        "data_model_sql": "Write 6 tables with full column definitions, foreign keys, indexes, and comments on non-obvious columns.",
        "api_endpoints": "Define 15+ REST endpoints grouped by resource. Include request/response hints, auth requirements, and rate limits.",
        "external_services": "List each service with: purpose, free tier limits, env var name, and fallback strategy.",
    },
    "medium": {
        "tech_stack": "For each component, explain WHY in 1 sentence.",
        "data_model_sql": "Write 4 tables with key columns, foreign keys, and timestamps.",
        "api_endpoints": "Define 10 endpoints with auth requirements noted.",
        "external_services": "List key services with purpose and env var name.",
    },
    "low": {
        "tech_stack": "List standard choices with brief 1-line justification.",
        "data_model_sql": "Write 3 core tables with essential columns.",
        "api_endpoints": "Define 8 basic CRUD endpoints.",
        "external_services": "List only essential services.",
    },
}


def build_depth_guide(
    interface: str,
    business: str,
    technical: str,
) -> str:
    """3축 값 → 프롬프트에 주입할 SECTION DEPTH GUIDE 텍스트 생성."""

    i_guide = INTERFACE_GUIDE.get(interface, INTERFACE_GUIDE["medium"])
    b_guide = BUSINESS_GUIDE.get(business, BUSINESS_GUIDE["medium"])
    t_guide = TECHNICAL_GUIDE.get(technical, TECHNICAL_GUIDE["medium"])

    lines = ["## SECTION DEPTH GUIDE", ""]
    lines.append(f"Product analysis: Interface={interface}, Business={business}, Technical={technical}")
    lines.append("")

    lines.append("### Narrative sections:")
    lines.append(f"- USER FLOW: {i_guide['user_flow']}")
    lines.append(f"- SCREENS: {i_guide['screens']}")
    lines.append(f"- FEATURES (Must/Should/Later): {i_guide['features_must']}")
    lines.append(f"- BUSINESS RULES: {b_guide['business_rules']}")
    lines.append(f"- BUSINESS MODEL + PRICING: {b_guide['business_model']}")
    lines.append(f"- MVP SCOPE: {b_guide['mvp_scope']}")
    lines.append("")
    lines.append("### Technical sections:")
    lines.append(f"- TECH STACK: {t_guide['tech_stack']}")
    lines.append(f"- DATA MODEL: {t_guide['data_model_sql']}")
    lines.append(f"- API ENDPOINTS: {t_guide['api_endpoints']}")
    lines.append(f"- EXTERNAL SERVICES: {t_guide['external_services']}")

    return "\n".join(lines)
```

**Commit:** `feat: depth guide mapping from 3-axis classification`

---

### Task 4: Self-Critique 프롬프트

**Files:**
- Create: `backend/app/prompts/critique.py`

**내용:**

```python
def build_critique_prompt(
    full_overview_text: str,
    axes: dict,
) -> tuple[str, str]:
    """생성된 풀 개요서를 평가하고 재생성 필요 여부를 판단."""

    system_prompt = """You are a senior technical reviewer scoring implementation documents.

Score 0-100 based on 4 criteria:
1. DEPTH MATCH (40%): Do high-complexity sections have proportionally deeper content?
2. ACTIONABILITY (30%): Can a developer start coding from this document alone?
3. CONSISTENCY (20%): Do features, API endpoints, and data model tables reference each other correctly?
4. CONCRETENESS (10%): Are there specific names, numbers, and examples instead of vague descriptions?

Set needs_regeneration = true if score < 70.
If needs_regeneration, write specific, actionable feedback for the regenerator.

VERIFICATION: Check that your feedback addresses the weakest scoring criterion specifically."""

    user_prompt = f"""Review this full overview document:

--- DOCUMENT ---
{full_overview_text}
--- END DOCUMENT ---

Product axes: Interface={axes.get("interface_complexity")}, Business={axes.get("business_complexity")}, Technical={axes.get("technical_complexity")}

Score and provide feedback."""

    return system_prompt, user_prompt
```

**Commit:** `feat: self-critique prompt for full overview quality check`

---

### Task 5: 풀 개요 프롬프트에 depth guide 주입

**Files:**
- Modify: `backend/app/prompts/full_overview.py`

**변경:** `build_full_overview_prompt` 함수에 `depth_guide: str = ""` 파라미터 추가.
user prompt 끝에 depth_guide 텍스트를 주입.

```python
def build_full_overview_prompt(
    concept: dict,
    light_overview: dict,
    market_research: str,
    depth_guide: str = "",    # NEW
) -> tuple[str, str]:
    # ... 기존 system_prompt ...
    
    # user_prompt 끝에 depth_guide 추가
    user_prompt = f"""... 기존 내용 ...

{depth_guide}"""

    return system_prompt, user_prompt
```

또한 재생성용 함수 추가:

```python
def build_full_overview_prompt_with_feedback(
    concept: dict,
    light_overview: dict,
    market_research: str,
    depth_guide: str,
    previous_output: str,
    critique_feedback: str,
) -> tuple[str, str]:
    """재생성용 프롬프트. 이전 출력 + 비평 피드백 포함."""
    
    system_prompt, base_user = build_full_overview_prompt(
        concept, light_overview, market_research, depth_guide
    )
    
    user_prompt = f"""{base_user}

## REVIEWER FEEDBACK (MUST address these issues):
{critique_feedback}

## PREVIOUS OUTPUT (improve upon this):
{previous_output}"""

    return system_prompt, user_prompt
```

**Commit:** `feat: depth guide injection + feedback regeneration prompt`

---

### Task 6: 서비스 파이프라인 v2

**Files:**
- Modify: `backend/app/services/full_overview_service.py`

**변경:** `generate_full_overview` 함수를 v2 파이프라인으로 확장.

기존 흐름:
```
concept 복원 → 시장 조사 → build_full_overview_prompt → parse → DB 저장
```

v2 흐름:
```python
async def generate_full_overview(...):
    session_id = str(uuid.uuid4())
    client = get_openai()
    
    # concept 복원 (기존과 동일)
    concept = { ... }
    
    # 시장 조사 (기존과 동일)
    market_data = await research_market(...)
    
    # ── Step 1: 축 분류 (gpt-5-nano) ──
    axes_sys, axes_user = build_axes_prompt(concept, idea["keyword_combo"], concept["product_type"])
    axes_response = client.beta.chat.completions.parse(
        model="gpt-5-nano",
        messages=[
            {"role": "system", "content": axes_sys},
            {"role": "user", "content": axes_user},
        ],
        response_format=IdeaAxesResponse,
    )
    axes = axes_response.choices[0].message.parsed.model_dump()
    
    # 로깅: feature_variant="axes_classification"
    await _log_ai_usage(..., feature_variant="axes_classification", model="gpt-5-nano", ...)
    
    # ── Step 2: 섹션 가중치 생성 (Python) ──
    depth_guide = build_depth_guide(
        axes["interface_complexity"],
        axes["business_complexity"],
        axes["technical_complexity"],
    )
    
    # ── Step 3: 풀 개요 생성 (gpt-5, depth guide 포함) ──
    system_prompt, user_prompt = build_full_overview_prompt(
        concept=concept,
        light_overview=overview,
        market_research=market_data,
        depth_guide=depth_guide,
    )
    response = client.beta.chat.completions.parse(
        model=MODEL,
        messages=[...],
        response_format=FullOverviewResponse,
    )
    result = response.choices[0].message.parsed
    
    # 로깅: feature_variant="generation"
    await _log_ai_usage(..., feature_variant="generation", ...)
    
    # ── Step 4: Self-Critique (gpt-5-mini) ──
    overview_text = _format_for_critique(result)
    critique_sys, critique_user = build_critique_prompt(overview_text, axes)
    critique_response = client.beta.chat.completions.parse(
        model="gpt-5-mini",
        messages=[...],
        response_format=CritiqueResponse,
    )
    critique = critique_response.choices[0].message.parsed
    
    # 로깅: feature_variant="critique"
    await _log_ai_usage(..., feature_variant="critique", model="gpt-5-mini", ...)
    
    # ── Step 4.5: 재생성 (조건부, 1회만) ──
    if critique.needs_regeneration and critique.score < 70:
        regen_sys, regen_user = build_full_overview_prompt_with_feedback(
            concept, overview, market_data, depth_guide,
            overview_text, critique.feedback,
        )
        regen_response = client.beta.chat.completions.parse(
            model=MODEL,
            messages=[...],
            response_format=FullOverviewResponse,
        )
        result = regen_response.choices[0].message.parsed
        
        # 로깅: feature_variant="regeneration"
        await _log_ai_usage(..., feature_variant="regeneration", ...)
    
    # ── Step 5: DB 저장 (기존과 동일) ──
    row = supabase.table("full_overviews").insert({...}).execute()
    return row.data[0]


def _format_for_critique(result: FullOverviewResponse) -> str:
    """Pydantic 결과를 읽기 좋은 텍스트로 변환 (critique 입력용)."""
    sections = []
    sections.append(f"CONCEPT: {result.concept}")
    sections.append(f"PROBLEM: {result.problem}")
    sections.append(f"TARGET USER: {result.target_user}")
    sections.append(f"FEATURES MUST: {chr(10).join(result.features_must)}")
    sections.append(f"FEATURES SHOULD: {chr(10).join(result.features_should)}")
    sections.append(f"FEATURES LATER: {chr(10).join(result.features_later)}")
    sections.append(f"USER FLOW: {chr(10).join(result.user_flow)}")
    sections.append(f"SCREENS: {chr(10).join(result.screens)}")
    sections.append(f"BUSINESS MODEL: {result.business_model}")
    sections.append(f"BUSINESS RULES: {chr(10).join(result.business_rules)}")
    sections.append(f"MVP SCOPE: {result.mvp_scope}")
    sections.append(f"TECH STACK: {chr(10).join(result.tech_stack)}")
    sections.append(f"DATA MODEL SQL: {result.data_model_sql}")
    sections.append(f"API ENDPOINTS: {chr(10).join(result.api_endpoints)}")
    sections.append(f"FILE STRUCTURE: {result.file_structure}")
    sections.append(f"EXTERNAL SERVICES: {chr(10).join(result.external_services)}")
    sections.append(f"AUTH FLOW: {chr(10).join(result.auth_flow)}")
    return "\n\n".join(sections)
```

**주의:** `_log_ai_usage`에서 model 파라미터를 동적으로 전달해야 함 (현재 모듈 상수 MODEL만 사용). `_log_ai_usage` 함수에 `model` 키워드 추가.

**Commit:** `feat: full overview pipeline v2 — axes + depth guide + self-critique`

---

### Task 7: 검증

**Step 1:** 임포트 확인
```bash
cd backend && python -c "
from app.prompts.axes_classifier import build_axes_prompt
from app.prompts.critique import build_critique_prompt
from app.services.depth_guide import build_depth_guide
print('All imports OK')
"
```

**Step 2:** depth_guide 출력 확인
```bash
cd backend && python -c "
from app.services.depth_guide import build_depth_guide
print(build_depth_guide('high', 'low', 'medium'))
"
```

Expected: 섹션별 depth instruction 텍스트 출력

**Step 3:** 실제 API 테스트
- 백엔드 재시작
- 웹에서 풀 개요 생성 → 정상 생성 확인
- 백엔드 로그에 4단계 로깅 확인:
  - `feature_variant="axes_classification"`
  - `feature_variant="generation"`
  - `feature_variant="critique"`
  - (조건부) `feature_variant="regeneration"`

**Commit:** 검증 완료 후 최종 커밋

---

## 수정 파일 요약

| 파일 | Task | 작업 |
|------|------|------|
| `models/llm_schemas.py` | 1 | IdeaAxesResponse + CritiqueResponse 추가 |
| `prompts/axes_classifier.py` | 2 | **신규** — 축 분류 프롬프트 |
| `services/depth_guide.py` | 3 | **신규** — 축 → 가중치 매핑 (Python) |
| `prompts/critique.py` | 4 | **신규** — Self-Critique 프롬프트 |
| `prompts/full_overview.py` | 5 | depth_guide 파라미터 + 재생성 함수 |
| `services/full_overview_service.py` | 6 | 파이프라인 v2 (4단계 + 조건부 재생성) |

## 비용 영향

| 단계 | 모델 | 추가 비용 |
|------|------|----------|
| 축 분류 | gpt-5-nano | ~$0.0001 |
| Self-Critique | gpt-5-mini | ~$0.003 |
| 재생성 (30% 확률) | gpt-5 | ~$0.003 |
| **총 추가** | | **~$0.006/회** |
