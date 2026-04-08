# Plan B: 프롬프트 + 서비스 + 라우터 (Task 3~6)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 3개 문서(제품 설계/기술 청사진/실행 로드맵)의 프롬프트, 서비스, 라우터를 구현하고 연쇄 생성 파이프라인을 완성한다.

**Architecture:** 각 문서의 프롬프트는 CTCO 구조(system/user 분리), depth guide 주입, verification loop. 서비스는 연쇄 호출(앞 문서 output이 뒷 문서 input). 라우터는 개별 생성 + "전부 생성" 엔드포인트.

**Tech Stack:** Python, FastAPI, OpenAI API (gpt-5, gpt-5-mini, gpt-5-nano), Pydantic Structured Outputs

---

## 의존성 체인 (핵심)

```
제품 설계 ← 개요서 + 축 분류 + depth guide
기술 청사진 ← 개요서 + 제품 설계 output + 축 분류
실행 로드맵 ← 제품 설계 output + 기술 청사진 output
```

각 서비스는 필요한 선행 문서를 DB에서 조회하고, 없으면 에러(프론트에서 의존성 자동 해결).

---

### Task 3: 프롬프트 3개

**Files:**
- Create: `backend/app/prompts/product_design.py`
- Create: `backend/app/prompts/blueprint.py`
- Create: `backend/app/prompts/roadmap.py`

#### 3-1. product_design.py

```python
def build_product_design_prompt(
    concept: dict,
    overview: dict,
    market_research: str,
    depth_guide: str = "",
) -> tuple[str, str]:
```

**System prompt:**
- Role: "You are a product designer expanding an overview into a detailed product specification."
- Anti-patterns (4개): SYSTEM VOICE, VAGUE SCREENS, FEATURE OVERLAP, RULES AS FEATURES
- Verification: "Before outputting, verify: every Must feature has a corresponding screen and user flow step."

**User prompt:**
- 개요서 전문 (concept, problem, target, features, differentiator, revenue, mvp_scope)
- 시장 데이터
- depth guide (축 분류 기반)
- 8개 섹션 작성 지시 (user_flow, screens, features_must/should/later, business_model, business_rules, mvp_scope)

**핵심 규칙:**
- user_flow: 구체적 화면 이름 포함 ("Dashboard에서 '새 프로젝트' 클릭")
- screens: 각 화면에 "유저가 여기서 뭘 하는지" 1줄
- features: "[screen] → [action] → [result]" 포맷
- business_rules: "~하면 안 된다" 형태의 제약 조건 (기능이 아님)

#### 3-2. blueprint.py

```python
def build_blueprint_prompt(
    concept: dict,
    overview: dict,
    product_design: dict,  # 제품 설계서 output 전문
    depth_guide: str = "",
) -> tuple[str, str]:
```

**System prompt:**
- Role: "You are a senior software architect writing a technical blueprint. The product design is already decided — design the technology to match it exactly."
- Anti-patterns (4개): OVER-ENGINEERING, MISMATCHED SCHEMAS, PHANTOM PACKAGES, ML FOR API
- Verification: "Before outputting: (1) Every Must feature has API endpoint (2) Every endpoint has DB table (3) File structure matches tech stack"
- **핵심 지시: "The product design's features, screens, and user flow are your requirements. Your tech must serve them, not the other way around."**

**User prompt:**
- 개요서 컨셉/타깃
- **제품 설계서 전문** (user_flow, screens, features, business_rules)
- depth guide
- 6개 섹션 작성 지시

**핵심 규칙:**
- tech_stack: 제품 설계의 features에서 필요한 기술을 역추론
- data_model_sql: business_rules의 제약 조건이 DB constraint로 반영되어야 함
- api_endpoints: features_must의 각 기능에 대응하는 endpoint 필수

#### 3-3. roadmap.py

```python
def build_roadmap_prompt(
    concept: dict,
    product_design: dict,  # 제품 설계서 output
    blueprint: dict,       # 기술 청사진 output
) -> tuple[str, str]:
```

**System prompt:**
- Role: "You are a technical PM creating a sprint-based build plan. Product and technology are decided — plan the sequence."
- Anti-patterns (3개): VAGUE TASKS, WRONG ORDER, MISSING VALIDATION
- Verification: "Before outputting: every Must feature appears in Phase 0 or 1. Phase 0 is foundation only (no features)."

**User prompt:**
- 개요서 컨셉
- 제품 설계서의 features_must/should/later + mvp_scope
- 기술 청사진의 tech_stack + data_model_sql 요약
- 6개 섹션 작성 지시

**핵심 규칙:**
- phase_0: 프로젝트 초기화, DB 세팅, Auth, 기본 레이아웃 (기능 아님)
- phase_1: Must features를 구현 순서로 나열 (의존성 순)
- phase_2: Should features + 배포 + 테스트 + 랜딩
- first_sprint_tasks: Phase 0의 첫 번째 Sprint를 5~7개 구체적 태스크로 분해
  - 예: "1. npm create-next-app 초기화", "2. Supabase 프로젝트 생성", "3. users 테이블 마이그레이션"
- estimated_complexity: "소규모 (1인 2~3주)" 또는 "중규모 (1인 4~6주)" 등

**Commit:**
```bash
git add backend/app/prompts/product_design.py backend/app/prompts/blueprint.py backend/app/prompts/roadmap.py
git commit -m "feat: collection prompts — product_design, blueprint, roadmap"
```

---

### Task 4: 서비스 3개

**Files:**
- Create: `backend/app/services/product_design_service.py`
- Create: `backend/app/services/blueprint_service.py`
- Create: `backend/app/services/roadmap_service.py`

#### 4-1. product_design_service.py

```python
MODEL = "gpt-5"
PROMPT_VERSION = "product-design-v1"

async def generate_product_design(
    supabase, user_id, tier, overview, idea, source="app"
) -> dict:
    # 1. 축 분류 (기존 axes_classifier 재사용, 이미 있으면 재사용)
    # 2. depth guide 생성
    # 3. build_product_design_prompt()
    # 4. client.beta.chat.completions.parse(response_format=ProductDesignResponse)
    # 5. DB 저장 (product_designs 테이블)
    # 6. ai_usage_logs 로깅
```

패턴: 현재 `full_overview_service.py`의 Step 1~3과 거의 동일. axes + depth + gpt-5 호출.

#### 4-2. blueprint_service.py

```python
MODEL = "gpt-5"
PROMPT_VERSION = "blueprint-v1"

async def generate_blueprint(
    supabase, user_id, tier, overview, product_design, source="app"
) -> dict:
    # product_design = DB에서 조회한 제품 설계서 dict
    # 1. build_blueprint_prompt(concept, overview, product_design, depth_guide)
    # 2. client.beta.chat.completions.parse(response_format=BlueprintResponse)
    # 3. DB 저장 (blueprints 테이블, design_id 참조)
    # 4. ai_usage_logs 로깅
```

**핵심: product_design의 output을 프롬프트에 전문 주입.**

#### 4-3. roadmap_service.py

```python
MODEL = "gpt-5-mini"  # 로드맵은 mini로 충분
PROMPT_VERSION = "roadmap-v1"

async def generate_roadmap(
    supabase, user_id, tier, product_design, blueprint, source="app"
) -> dict:
    # 1. build_roadmap_prompt(concept, product_design, blueprint)
    # 2. client.beta.chat.completions.parse(response_format=RoadmapResponse)
    # 3. DB 저장 (roadmaps 테이블, blueprint_id 참조)
    # 4. ai_usage_logs 로깅
```

**Commit:**
```bash
git add backend/app/services/product_design_service.py backend/app/services/blueprint_service.py backend/app/services/roadmap_service.py
git commit -m "feat: collection services — product_design, blueprint, roadmap"
```

---

### Task 5: 라우터 엔드포인트

**Files:**
- Modify: `backend/app/routers/lab.py`

**추가할 엔드포인트 4개:**

```python
# 제품 설계서 (Lite+)
@router.post("/design")
async def create_product_design(req, user, supabase):
    # 티어 체크: Lite 이상
    # Rate limit: L1 + L2 (overview 한도 공유) + L4
    # 개요서 조회 + 소유권
    # product_design_service.generate_product_design()

# 기술 청사진 (Pro only)
@router.post("/blueprint")
async def create_blueprint(req, user, supabase):
    # 티어 체크: Pro only
    # Rate limit: L1 + L2 + L4
    # 제품 설계서 조회 (없으면 404 — 프론트에서 의존성 해결)
    # blueprint_service.generate_blueprint()

# 실행 로드맵 (Pro only)
@router.post("/roadmap")
async def create_roadmap(req, user, supabase):
    # 티어 체크: Pro only
    # Rate limit: L1 + L2 + L4
    # 기술 청사진 조회 (없으면 404)
    # roadmap_service.generate_roadmap()

# 나머지 전부 생성 (Pro only)
@router.post("/generate-all")
async def generate_all(req, user, supabase):
    # 티어 체크: Pro only
    # overview_id 기반
    # 1. 제품 설계 있는지 확인 → 없으면 생성
    # 2. 기술 청사진 있는지 확인 → 없으면 생성
    # 3. 실행 로드맵 있는지 확인 → 없으면 생성
    # 4. 전체 결과 반환
```

**Request body:**
```python
class DesignRequest(BaseModel):
    overview_id: str

class BlueprintRequest(BaseModel):
    design_id: str

class RoadmapRequest(BaseModel):
    blueprint_id: str

class GenerateAllRequest(BaseModel):
    overview_id: str
```

**Commit:**
```bash
git add backend/app/routers/lab.py
git commit -m "feat: collection endpoints — /design, /blueprint, /roadmap, /generate-all"
```

---

### Task 6: Self-Critique 수정

**Files:**
- Modify: `backend/app/prompts/critique.py`

**변경:** 기존 풀 개요 전체 평가 → 제품 설계 + 기술 청사진 교차 검증

```python
def build_collection_critique_prompt(
    product_design: dict,
    blueprint: dict,
    axes: dict,
) -> tuple[str, str]:
    """제품 설계 ↔ 기술 청사진 교차 검증."""
```

**평가 기준:**
1. FEATURE-API 일치 (40%): features_must의 각 기능에 대응하는 API endpoint가 있는가?
2. SCREEN-STRUCTURE 일치 (20%): screens의 각 화면이 file_structure에 반영됐는가?
3. RULES-DB 일치 (20%): business_rules의 제약이 data_model_sql에 반영됐는가?
4. DEPTH MATCH (20%): 축 분류 기준으로 깊이가 적절한가?

**Commit:**
```bash
git add backend/app/prompts/critique.py
git commit -m "feat: collection critique — cross-validation between design and blueprint"
```

---

## 검증

```bash
cd backend && python -c "
from app.prompts.product_design import build_product_design_prompt
from app.prompts.blueprint import build_blueprint_prompt
from app.prompts.roadmap import build_roadmap_prompt
from app.prompts.critique import build_collection_critique_prompt
print('All prompts OK')
"
```
