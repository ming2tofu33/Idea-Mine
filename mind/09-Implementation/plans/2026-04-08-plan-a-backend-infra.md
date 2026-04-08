# Plan A: 백엔드 인프라 — 스키마 + DB (Task 1~2)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 풀 개요서 1개를 3개 문서(제품 설계/기술 청사진/실행 로드맵)로 분리하기 위한 Pydantic 스키마와 DB 테이블을 만든다.

**Architecture:** 기존 `FullOverviewResponse`를 3개 독립 스키마로 분리하고, DB에 `product_designs`, `blueprints`, `roadmaps` 테이블을 추가한다. 기존 `full_overviews` 테이블은 유지(마이그레이션 호환).

**Tech Stack:** Pydantic, Supabase PostgreSQL, SQL 마이그레이션

---

### Task 1: Pydantic 스키마 분리

**Files:**
- Modify: `backend/app/models/llm_schemas.py`

**Step 1: 스키마 추가**

기존 `FullOverviewResponse` 아래에 3개 신규 모델 추가:

```python
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
```

**Step 2: 검증**

```bash
cd backend && python -c "
from app.models.llm_schemas import ProductDesignResponse, BlueprintResponse, RoadmapResponse
print('ProductDesignResponse fields:', list(ProductDesignResponse.model_fields.keys()))
print('BlueprintResponse fields:', list(BlueprintResponse.model_fields.keys()))
print('RoadmapResponse fields:', list(RoadmapResponse.model_fields.keys()))
print('All OK')
"
```

**Step 3: Commit**

```bash
git add backend/app/models/llm_schemas.py
git commit -m "feat: add ProductDesign/Blueprint/Roadmap Pydantic schemas"
```

---

### Task 2: DB 마이그레이션

**Files:**
- Create: `supabase/migrations/00012_collection_tables.sql`

**Step 1: 마이그레이션 작성**

```sql
-- 1. 제품 설계서 테이블
create table public.product_designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  overview_id uuid not null references public.overviews(id) on delete cascade,
  user_flow jsonb not null default '[]'::jsonb,
  screens jsonb not null default '[]'::jsonb,
  features_must jsonb not null default '[]'::jsonb,
  features_should jsonb not null default '[]'::jsonb,
  features_later jsonb not null default '[]'::jsonb,
  business_model text not null default '',
  business_rules jsonb not null default '[]'::jsonb,
  mvp_scope text not null default '',
  axes jsonb,
  created_at timestamptz not null default now()
);

-- 2. 기술 청사진 테이블
create table public.blueprints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  design_id uuid not null references public.product_designs(id) on delete cascade,
  tech_stack jsonb not null default '[]'::jsonb,
  data_model_sql text not null default '',
  api_endpoints jsonb not null default '[]'::jsonb,
  file_structure text not null default '',
  external_services jsonb not null default '[]'::jsonb,
  auth_flow jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- 3. 실행 로드맵 테이블
create table public.roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  blueprint_id uuid not null references public.blueprints(id) on delete cascade,
  phase_0 jsonb not null default '[]'::jsonb,
  phase_1 jsonb not null default '[]'::jsonb,
  phase_2 jsonb not null default '[]'::jsonb,
  validation_checkpoints jsonb not null default '[]'::jsonb,
  estimated_complexity text not null default '',
  first_sprint_tasks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- 4. RLS
alter table public.product_designs enable row level security;
alter table public.blueprints enable row level security;
alter table public.roadmaps enable row level security;

create policy "Users can read own product_designs"
  on public.product_designs for select using ((select auth.uid()) = user_id);
create policy "Users can delete own product_designs"
  on public.product_designs for delete using ((select auth.uid()) = user_id);

create policy "Users can read own blueprints"
  on public.blueprints for select using ((select auth.uid()) = user_id);
create policy "Users can delete own blueprints"
  on public.blueprints for delete using ((select auth.uid()) = user_id);

create policy "Users can read own roadmaps"
  on public.roadmaps for select using ((select auth.uid()) = user_id);
create policy "Users can delete own roadmaps"
  on public.roadmaps for delete using ((select auth.uid()) = user_id);

-- 5. 인덱스
create index idx_product_designs_user_created on public.product_designs (user_id, created_at desc);
create index idx_blueprints_user_created on public.blueprints (user_id, created_at desc);
create index idx_roadmaps_user_created on public.roadmaps (user_id, created_at desc);
create index idx_blueprints_design on public.blueprints (design_id);
create index idx_roadmaps_blueprint on public.roadmaps (blueprint_id);
```

**Step 2: Supabase에 적용**

```bash
cd supabase && npx supabase db push
```

**Step 3: Commit**

```bash
git add supabase/migrations/00012_collection_tables.sql
git commit -m "feat: add product_designs, blueprints, roadmaps tables with RLS"
```
