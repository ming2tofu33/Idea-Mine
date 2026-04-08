# 프로젝트 컬렉션 파이프라인 구현 계획

> 풀 개요서 1개(15섹션) → 3개 독립 문서(제품 설계 + 기술 청사진 + 실행 로드맵)로 분리.
> 연쇄 생성: 앞 문서가 뒷 문서의 입력이 됨.

**Goal:** 5개 문서 컬렉션(개요/감정/설계/청사진/로드맵) 파이프라인 구현 + 컬렉션 UI

---

## 파이프라인 흐름

```
축 분류 (gpt-5-nano)
  ↓ depth guide
제품 설계서 (gpt-5) ← 개요서 + 축 분류
  ↓ output
기술 청사진 (gpt-5) ← 제품 설계서 + 개요서
  ↓ output
실행 로드맵 (gpt-5-mini) ← 제품 설계서 + 기술 청사진
  ↓
Self-Critique (gpt-5-mini) ← 전체 품질 검증
```

### 의존성 규칙

| 생성할 문서 | 필요한 선행 문서 | 없으면? |
|------------|----------------|---------|
| 제품 설계서 | 개요서 | 에러 — 개요 먼저 생성 안내 |
| 기술 청사진 | 개요서 + 제품 설계서 | 제품 설계 자동 생성 후 진행 |
| 실행 로드맵 | 개요서 + 제품 설계서 + 기술 청사진 | 앞 단계 자동 연쇄 생성 |

---

## Phase 1: 백엔드 (Pydantic + Prompt + Service + Router)

### Task 1: Pydantic 스키마 분리

**수정:** `models/llm_schemas.py`

```
FullOverviewResponse (기존, deprecated)

→ 분리:
  ProductDesignResponse:
    user_flow, screens, features_must/should/later,
    business_model, business_rules, mvp_scope

  BlueprintResponse:
    tech_stack, data_model_sql, api_endpoints,
    file_structure, external_services, auth_flow

  RoadmapResponse (신규):
    phase_0: list[str]
    phase_1: list[str]
    phase_2: list[str]
    validation_checkpoints: list[str]
    estimated_complexity: str
    first_sprint_tasks: list[str]
```

### Task 2: DB 마이그레이션

**신규 테이블 2개:**

```sql
-- product_designs (현재 full_overviews의 narrative 부분)
create table product_designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  overview_id uuid references overviews(id) on delete cascade,
  user_flow jsonb not null default '[]',
  screens jsonb not null default '[]',
  features_must jsonb not null default '[]',
  features_should jsonb not null default '[]',
  features_later jsonb not null default '[]',
  business_model text not null default '',
  business_rules jsonb not null default '[]',
  mvp_scope text not null default '',
  axes jsonb,  -- {interface, business, technical}
  created_at timestamptz not null default now()
);

-- blueprints (현재 full_overviews의 technical 부분)
create table blueprints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  design_id uuid references product_designs(id) on delete cascade,
  tech_stack jsonb not null default '[]',
  data_model_sql text not null default '',
  api_endpoints jsonb not null default '[]',
  file_structure text not null default '',
  external_services jsonb not null default '[]',
  auth_flow jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- roadmaps (완전 신규)
create table roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  blueprint_id uuid references blueprints(id) on delete cascade,
  phase_0 jsonb not null default '[]',
  phase_1 jsonb not null default '[]',
  phase_2 jsonb not null default '[]',
  validation_checkpoints jsonb not null default '[]',
  estimated_complexity text not null default '',
  first_sprint_tasks jsonb not null default '[]',
  created_at timestamptz not null default now()
);
```

+ RLS 정책 (본인 데이터만)
+ 인덱스 (user_id + created_at)

### Task 3: 프롬프트 3개

**수정:** `prompts/full_overview.py` → `prompts/product_design.py`로 rename
**신규:** `prompts/blueprint.py`
**신규:** `prompts/roadmap.py`

각 프롬프트: CTCO 구조, system/user 분리, depth guide 주입, verification loop

**product_design.py:**
- system: "You are a product designer expanding an overview into a detailed product specification."
- user: 개요서 + 축 분류 depth guide + 시장 데이터
- 출력: 8개 필드

**blueprint.py:**
- system: "You are a senior software architect writing a technical blueprint. The product design is already decided — design the technology to match it."
- user: **제품 설계서 output 전문** + 개요서 + 축 분류
- 핵심: 제품 설계의 features/screens/user_flow를 참조해서 일치하는 DB/API 설계
- 출력: 6개 필드

**roadmap.py:**
- system: "You are a technical project manager creating a sprint-based execution plan. The product and technology are already decided — plan the build sequence."
- user: **제품 설계서 + 기술 청사진 output 전문**
- 핵심: Must features → Phase 0 기반 → Phase 1 MVP → Phase 2 출시
- `first_sprint_tasks`: "오늘 바로 시작할 5~7개 구체적 태스크"
- 출력: 6개 필드

### Task 4: 서비스 3개

**수정:** `services/full_overview_service.py` → `services/product_design_service.py`
**신규:** `services/blueprint_service.py`
**신규:** `services/roadmap_service.py`

각 서비스 구조:
```python
async def generate_product_design(supabase, user_id, tier, overview, idea, source):
    # 1. 축 분류 (gpt-5-nano) — 이미 있으면 재사용
    # 2. depth guide 생성 (Python)
    # 3. 제품 설계 생성 (gpt-5)
    # 4. DB 저장
    # 5. 로깅

async def generate_blueprint(supabase, user_id, tier, overview, design, source):
    # design = 제품 설계서 output (DB에서 조회 또는 방금 생성)
    # 1. 기술 청사진 생성 (gpt-5) — 제품 설계 전문을 입력
    # 2. DB 저장
    # 3. 로깅

async def generate_roadmap(supabase, user_id, tier, design, blueprint, source):
    # 1. 실행 로드맵 생성 (gpt-5-mini) — 제품 설계 + 기술 청사진 전문
    # 2. DB 저장
    # 3. 로깅
```

### Task 5: 라우터 3개

**수정:** `routers/lab.py`에 엔드포인트 추가

```
POST /lab/design          ← 제품 설계서 생성 (Lite+)
POST /lab/blueprint       ← 기술 청사진 생성 (Pro only)
POST /lab/roadmap         ← 실행 로드맵 생성 (Pro only)
POST /lab/generate-all    ← 나머지 전부 생성 (Pro only, 연쇄)
```

`/lab/generate-all` 흐름:
```python
# 1. 이미 있는 문서 확인
# 2. 없는 것만 순서대로 생성
# 3. 전체 결과 반환
```

티어 체크:
- `/lab/design`: Lite 이상 + 월 3회 한도 (Lite) / 무제한 (Pro)
- `/lab/blueprint`, `/lab/roadmap`: Pro only
- `/lab/generate-all`: Pro only

### Task 6: Self-Critique 수정

`prompts/critique.py` 수정:
- 기존: 풀 개요서 전체를 한 번에 평가
- 변경: 제품 설계 + 기술 청사진을 교차 검증
  - features ↔ api_endpoints 일치 여부
  - screens ↔ file_structure 일치 여부
  - business_rules ↔ data_model 반영 여부

---

## Phase 2: 프론트엔드 (컬렉션 UI)

### Task 7: 타입 + API 확장

```typescript
// types/api.ts
interface ProductDesign { ... }
interface Blueprint { ... }
interface Roadmap { ... }
interface CollectionStatus {
  overview: boolean;
  appraisal: boolean;
  design: boolean;
  blueprint: boolean;
  roadmap: boolean;
  completionRate: number; // 0-5
}

// lib/api.ts
labApi.createDesign(overviewId)
labApi.createBlueprint(designId)
labApi.createRoadmap(blueprintId)
labApi.generateAll(overviewId)
labApi.getDesignsByOverview(overviewId)
labApi.getBlueprintsByDesign(designId)
labApi.getRoadmapsByBlueprint(blueprintId)
```

### Task 8: 컬렉션 뷰 페이지

아이디어 상세 페이지를 컬렉션 뷰로 전환:

```
/lab/collection/[ideaId]    ← 5개 문서 컬렉션 뷰 (신규)

┌─────────────────────────────┐
│ AI 감정 일기 앱               │
│ 컬렉션 완성도: ■■□□□ 2/5     │
│                              │
│ [■ 개요서]  ← 펼치기/접기     │
│ [■ 감정서]  ← 펼치기/접기     │
│ [□ 제품 설계] ← 생성 또는 🔒  │
│ [□ 기술 청사진] ← 생성 또는 🔒 │
│ [□ 실행 로드맵] ← 생성 또는 🔒 │
│                              │
│ [ 나머지 전부 생성 ] (Pro)     │
│ [ 📋 전체 복사 ] (5/5일 때)   │
└─────────────────────────────┘
```

### Task 9: 잠금 미리보기 카드

```
[□ 기술 청사진] 🔒
  "기술 스택, DB 설계, API 엔드포인트, 파일 구조..."
  "AI 코딩 도구에 바로 넣을 수 있는 기술 설계서"
  [ Pro로 업그레이드 → ]
```

### Task 10: "나머지 전부 생성" 로딩 UX

```
Pro 유저가 클릭 → 연쇄 로딩:
  [✓] 축 분류 완료 (2초)
  [▶] 제품 설계 생성 중... (30초)
  [□] 기술 청사진 대기
  [□] 실행 로드맵 대기
  [□] 품질 검증 대기
```

단계별 진행이 보이는 로딩 — 80초가 지루하지 않게.

---

## 실행 순서

```
Task 1: 스키마 분리                    (30분)
Task 2: DB 마이그레이션                (30분)
Task 3: 프롬프트 3개                   (핵심, 2~3시간)
Task 4: 서비스 3개                     (1시간)
Task 5: 라우터 + 티어/한도 체크        (30분)
Task 6: Self-Critique 수정            (30분)
Task 7: 프론트 타입 + API              (30분)
Task 8: 컬렉션 뷰 UI                  (1~2시간)
Task 9: 잠금 미리보기                   (30분)
Task 10: 연쇄 로딩 UX                  (1시간)
```

## 기존 코드 처리

| 기존 파일 | 처리 |
|----------|------|
| `full_overview_service.py` | deprecated → `product_design_service.py`로 rename |
| `full_overviews` 테이블 | 유지 (기존 데이터 보존), 새 테이블과 병행 |
| `prompts/full_overview.py` | deprecated → `product_design.py`로 분리 |
| `FullOverviewResponse` 스키마 | deprecated, 새 3개 스키마 사용 |

## 비용 영향 (vs 현재)

| | 현재 (풀 개요 1회) | 변경 (3개 연쇄) |
|---|---|---|
| LLM 호출 | 1 (gpt-5) + critique | 3 (gpt-5 ×2 + gpt-5-mini) + critique |
| 예상 비용 | ~$0.015 | ~$0.025 |
| 시간 | ~40초 | ~80초 |

비용 +66%, 시간 ×2. 하지만 품질(일관성) + 과금 가치(3개 문서) + UX(컬렉션) 개선.
