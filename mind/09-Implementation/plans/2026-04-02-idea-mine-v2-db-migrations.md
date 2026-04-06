# Idea Mine V2 Database Migrations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the drifted V1 database with a clean, reproducible V2 Supabase schema using `0to1log`-style ordered migrations and keep backend/mobile callers aligned with the new schema.

**Architecture:** V2 uses a fresh, deterministic migration chain in `supabase/migrations/00001_...sql` through `00010_...sql`. The schema is organized around actual product flows: auth/profile, keyword catalog, daily state and seasons, active veins, ideas, overview/appraisal/full-overview pipeline, AI usage logging, and admin RPCs. Apply `@supabase-postgres-best-practices` from day one: index all FK and hot `WHERE` columns, use composite/partial indexes for active and historical records, and write RLS policies with `(select auth.uid())` instead of calling `auth.uid()` per row.

**Tech Stack:** Supabase CLI, PostgreSQL 17, FastAPI, supabase-py, Expo, `@supabase/supabase-js`, pytest

**Implementation Note:** V1 timestamp migrations are archived under `supabase/migrations_v1_archive/` so the active Supabase CLI path contains only the V2 `00001_...` chain. Keep V1 history in git, but do not mix both chains in the active migrations directory.

---

## Migration Rules

- Use `0to1log`-style 5-digit, monotonically increasing filenames only.
- Never edit an already-applied migration after V2 starts. Add a new file instead.
- Do not reuse migration numbers. The `0to1log` duplicate-number mistake must not be repeated.
- Treat repo schema as the source of truth. No dashboard-only manual schema edits.
- Keep runtime JSON as `jsonb` in Postgres when the app reads it as structured data.
- Keep bilingual user-facing content explicit with `*_ko` and `*_en` columns.

## Current Drift To Eliminate

- Repo migrations define `ideas.title` / `ideas.summary`, but runtime code writes `title_ko`, `title_en`, `summary_ko`, `summary_en`.
- Repo migrations define `overviews.problem`, `target_user`, `business_model`, etc., but runtime code reads and writes `problem_ko`, `problem_en`, `target_ko`, `target_en`, and more.
- Runtime code depends on `appraisals`, `full_overviews`, and `veins.is_active`, but those are not represented in the tracked V1 migration chain.
- `vein_service.py` checks `active_seasons`, but the current remote DB does not have that table.
- The current admin persona RPC checks whether the target user is admin instead of whether the caller is admin.

## V2 Migration Map

| File | Purpose |
|---|---|
| `00001_base_extensions_profiles.sql` | Base extensions, `profiles`, shared trigger helpers |
| `00002_keywords_catalog.sql` | `keywords` table plus the curated 118-keyword seed corpus |
| `00003_daily_state_and_active_seasons.sql` | `user_daily_state`, `active_seasons` |
| `00004_veins.sql` | `veins` with active-history model and partial uniqueness |
| `00005_ideas.sql` | Bilingual `ideas`, vault flag, combo storage |
| `00006_overviews.sql` | Bilingual `overviews`, one overview per idea |
| `00007_appraisals.sql` | `appraisals`, multiple historical appraisals per overview |
| `00008_full_overviews.sql` | `full_overviews` with native `jsonb` blocks |
| `00009_ai_usage_logs_and_admin_rpc.sql` | AI usage logs, admin persona RPC |
| `00010_rls_and_hot_path_indexes.sql` | All RLS policies, grants, and final hot-path indexes |

---

### Task 1: 00001 Base Extensions And Profiles

**Files:**
- Create: `supabase/migrations/00001_base_extensions_profiles.sql`
- Create: `backend/tests/test_schema_contracts_v2.py`
- Modify: `backend/requirements.txt`
- Later Modify: `backend/app/dependencies.py`
- Later Modify: `apps/mobile/hooks/useProfile.ts`
- Later Modify: `apps/mobile/types/api.ts`

**Verification prerequisite:** Run Task 1 against a real local Postgres started by Supabase CLI. Export `SCHEMA_TEST_DB_URL` to the reset database before running pytest. If the env var is missing, the contract test should fail fast instead of inspecting the linked remote project.

**Step 1: Write the failing schema contract test**

```python
def test_profiles_contract(schema):
    columns = schema.columns("profiles")
    assert set(columns) >= {
        "id", "nickname", "language", "tier", "role", "persona_tier",
        "miner_level", "carry_slots", "streak_days", "last_active_date",
        "subscription_platform", "subscription_expires_at",
        "created_at", "updated_at",
    }
```

**Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_schema_contracts_v2.py -k profiles -q`
Expected: FAIL

**Step 3: Write minimal implementation**

Add to `backend/requirements.txt`:

```text
psycopg[binary]==3.2.9
```

Create `supabase/migrations/00001_base_extensions_profiles.sql` with:

```sql
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text,
  language text not null default 'ko' check (language in ('ko', 'en')),
  tier text not null default 'free' check (tier in ('free', 'lite', 'pro')),
  role text not null default 'user' check (role in ('user', 'admin')),
  persona_tier text check (persona_tier is null or persona_tier in ('free', 'lite', 'pro')),
  miner_level integer not null default 1 check (miner_level >= 1),
  carry_slots integer not null default 2 check (carry_slots >= 0),
  streak_days integer not null default 0 check (streak_days >= 0),
  last_active_date date,
  subscription_platform text check (subscription_platform in ('revenuecat', 'polar') or subscription_platform is null),
  subscription_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

**Step 4: Run test to verify it passes**

Run: `npx supabase db reset`
Expected: reset succeeds.

Run: `pytest backend/tests/test_schema_contracts_v2.py -k profiles -q`
Expected: PASS

Note: In practice, set `SCHEMA_TEST_DB_URL` first, for example `postgresql://postgres:postgres@127.0.0.1:54322/postgres`. Without that env var, the schema contract test should fail immediately with a clear message.

**Step 5: Commit**

```bash
git add backend/requirements.txt backend/tests/test_schema_contracts_v2.py supabase/migrations/00001_base_extensions_profiles.sql
git commit -m "db: add V2 base profiles migration"
```

### Task 2: 00002 Keywords Catalog

**Files:**
- Create: `supabase/migrations/00002_keywords_catalog.sql`
- Modify: `backend/tests/test_schema_contracts_v2.py`
- Reference: `supabase/migrations/20260322000008_seed_keywords.sql`
- Later Modify: `backend/app/services/vein_service.py`

**Step 1: Write the failing test**

```python
def test_keywords_contract(schema):
    columns = schema.columns("keywords")
    assert set(columns) >= {
        "id", "slug", "category", "subtype", "ko", "en",
        "aliases", "weight", "is_premium", "is_seed", "is_active", "created_at",
    }
    assert schema.row_count("keywords") == 118
```

**Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_schema_contracts_v2.py -k keywords -q`
Expected: FAIL

**Step 3: Write minimal implementation**

Create `supabase/migrations/00002_keywords_catalog.sql` with:

```sql
create table public.keywords (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null check (category in ('ai', 'who', 'domain', 'tech', 'value', 'money')),
  subtype text not null,
  ko text not null,
  en text not null,
  aliases text[] not null default '{}',
  weight real not null default 1.0,
  is_premium boolean not null default false,
  is_seed boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_keywords_category_active
on public.keywords (category, is_active)
where is_active = true;

-- Copy the 118-row seed set from supabase/migrations/20260322000008_seed_keywords.sql
```

**Step 4: Run test to verify it passes**

Run: `npx supabase db reset`
Run: `pytest backend/tests/test_schema_contracts_v2.py -k keywords -q`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/tests/test_schema_contracts_v2.py supabase/migrations/00002_keywords_catalog.sql
git commit -m "db: add V2 keyword catalog migration"
```

### Task 3: 00003 Daily State And Active Seasons

**Files:**
- Create: `supabase/migrations/00003_daily_state_and_active_seasons.sql`
- Modify: `backend/tests/test_schema_contracts_v2.py`
- Later Modify: `backend/app/services/rate_limiter.py`
- Later Modify: `backend/app/services/vein_service.py`
- Later Modify: `backend/app/routers/admin.py`

**Step 1: Write the failing test**

```python
def test_user_daily_state_contract(schema):
    columns = schema.columns("user_daily_state")
    assert set(columns) >= {
        "id", "user_id", "date", "rerolls_used",
        "generations_used", "overviews_used", "ad_bonus_used", "created_at",
    }

def test_active_seasons_contract(schema):
    columns = schema.columns("active_seasons")
    assert set(columns) >= {"id", "label", "start_date", "end_date", "is_active", "created_at"}
```

**Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_schema_contracts_v2.py -k "daily_state or active_seasons" -q`
Expected: FAIL

**Step 3: Write minimal implementation**

Create `supabase/migrations/00003_daily_state_and_active_seasons.sql` with:

```sql
create table public.user_daily_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null default current_date,
  rerolls_used integer not null default 0,
  generations_used integer not null default 0,
  overviews_used integer not null default 0,
  ad_bonus_used boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create table public.active_seasons (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  start_date date not null,
  end_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (start_date <= end_date)
);
```

**Step 4: Run test to verify it passes**

Run: `npx supabase db reset`
Run: `pytest backend/tests/test_schema_contracts_v2.py -k "daily_state or active_seasons" -q`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/tests/test_schema_contracts_v2.py supabase/migrations/00003_daily_state_and_active_seasons.sql
git commit -m "db: add V2 daily state and seasons migration"
```

### Task 4: 00004 Veins

**Files:**
- Create: `supabase/migrations/00004_veins.sql`
- Modify: `backend/tests/test_schema_contracts_v2.py`
- Later Modify: `backend/app/services/vein_service.py`
- Later Modify: `backend/app/routers/mining.py`

**Step 1: Write the failing test**

```python
def test_veins_contract(schema):
    columns = schema.columns("veins")
    assert set(columns) >= {
        "id", "user_id", "date", "slot_index",
        "keyword_ids", "rarity", "is_active", "is_selected", "created_at",
    }
```

**Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_schema_contracts_v2.py -k veins -q`
Expected: FAIL

**Step 3: Write minimal implementation**

Create `supabase/migrations/00004_veins.sql` with:

```sql
create table public.veins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null default current_date,
  slot_index integer not null check (slot_index between 1 and 3),
  keyword_ids uuid[] not null,
  rarity text not null check (rarity in ('common', 'rare', 'golden', 'legend')),
  is_active boolean not null default true,
  is_selected boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index uq_veins_active_slot
on public.veins (user_id, date, slot_index)
where is_active = true;
```

**Step 4: Run test to verify it passes**

Run: `npx supabase db reset`
Run: `pytest backend/tests/test_schema_contracts_v2.py -k veins -q`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/tests/test_schema_contracts_v2.py supabase/migrations/00004_veins.sql
git commit -m "db: add V2 veins migration"
```

### Task 5: 00005 Ideas

**Files:**
- Create: `supabase/migrations/00005_ideas.sql`
- Modify: `backend/tests/test_schema_contracts_v2.py`
- Later Modify: `backend/app/services/idea_service.py`
- Later Modify: `backend/app/routers/ideas.py`
- Later Modify: `backend/app/models/schemas.py`
- Later Modify: `apps/mobile/lib/api.ts`
- Later Modify: `apps/mobile/types/api.ts`
- Later Modify: `apps/mobile/lib/mock-data.ts`

**Step 1: Write the failing test**

```python
def test_ideas_contract(schema):
    columns = schema.columns("ideas")
    assert set(columns) >= {
        "id", "user_id", "vein_id",
        "title_ko", "title_en", "summary_ko", "summary_en",
        "keyword_combo", "tier_type", "sort_order", "is_vaulted", "created_at",
    }
```

**Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_schema_contracts_v2.py -k ideas -q`
Expected: FAIL

**Step 3: Write minimal implementation**

Create `supabase/migrations/00005_ideas.sql` with:

```sql
create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  vein_id uuid not null references public.veins(id) on delete cascade,
  title_ko text not null,
  title_en text not null,
  summary_ko text not null,
  summary_en text not null,
  keyword_combo jsonb not null,
  tier_type text not null check (tier_type in ('stable', 'expansion', 'pivot', 'rare')),
  sort_order integer not null check (sort_order between 1 and 10),
  is_vaulted boolean not null default false,
  created_at timestamptz not null default now()
);
```

**Step 4: Run test to verify it passes**

Run: `npx supabase db reset`
Run: `pytest backend/tests/test_schema_contracts_v2.py -k ideas -q`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/tests/test_schema_contracts_v2.py supabase/migrations/00005_ideas.sql
git commit -m "db: add V2 ideas migration"
```

### Task 6: 00006 Overviews

**Files:**
- Create: `supabase/migrations/00006_overviews.sql`
- Modify: `backend/tests/test_schema_contracts_v2.py`
- Later Modify: `backend/app/services/overview_service.py`
- Later Modify: `backend/app/routers/lab.py`
- Later Modify: `apps/mobile/types/overview.ts`
- Later Modify: `apps/mobile/app/(tabs)/lab/overview.tsx`
- Later Modify: `apps/mobile/lib/api.ts`

**Step 1: Write the failing test**

```python
def test_overviews_contract(schema):
    columns = schema.columns("overviews")
    assert set(columns) >= {
        "id", "idea_id", "user_id",
        "concept_ko", "concept_en", "problem_ko", "problem_en",
        "target_ko", "target_en", "features_ko", "features_en",
        "differentiator_ko", "differentiator_en",
        "revenue_ko", "revenue_en", "mvp_scope_ko", "mvp_scope_en",
        "created_at", "updated_at",
    }
```

**Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_schema_contracts_v2.py -k overviews -q`
Expected: FAIL

**Step 3: Write minimal implementation**

Create `supabase/migrations/00006_overviews.sql` with:

```sql
create table public.overviews (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null unique references public.ideas(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  concept_ko text not null default '',
  concept_en text not null default '',
  problem_ko text not null default '',
  problem_en text not null default '',
  target_ko text not null default '',
  target_en text not null default '',
  features_ko text not null default '',
  features_en text not null default '',
  differentiator_ko text not null default '',
  differentiator_en text not null default '',
  revenue_ko text not null default '',
  revenue_en text not null default '',
  mvp_scope_ko text not null default '',
  mvp_scope_en text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

**Step 4: Run test to verify it passes**

Run: `npx supabase db reset`
Run: `pytest backend/tests/test_schema_contracts_v2.py -k overviews -q`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/tests/test_schema_contracts_v2.py supabase/migrations/00006_overviews.sql
git commit -m "db: add V2 overviews migration"
```

### Task 7: 00007 Appraisals

**Files:**
- Create: `supabase/migrations/00007_appraisals.sql`
- Modify: `backend/tests/test_schema_contracts_v2.py`
- Later Modify: `backend/app/services/appraisal_service.py`
- Later Modify: `backend/app/routers/appraisal.py`
- Later Modify: `apps/mobile/types/appraisal.ts`
- Later Modify: `apps/mobile/app/(tabs)/lab/overview.tsx`
- Later Modify: `apps/mobile/lib/api.ts`

**Step 1: Write the failing test**

```python
def test_appraisals_contract(schema):
    columns = schema.columns("appraisals")
    assert set(columns) >= {
        "id", "user_id", "overview_id", "depth",
        "market_fit_ko", "market_fit_en", "feasibility_ko", "feasibility_en",
        "risk_ko", "risk_en", "problem_fit_ko", "problem_fit_en",
        "differentiation_ko", "differentiation_en",
        "scalability_ko", "scalability_en", "created_at",
    }
```

**Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_schema_contracts_v2.py -k appraisals -q`
Expected: FAIL

**Step 3: Write minimal implementation**

Create `supabase/migrations/00007_appraisals.sql` with:

```sql
create table public.appraisals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  overview_id uuid not null references public.overviews(id) on delete cascade,
  depth text not null check (depth in ('basic_free', 'basic', 'precise_lite', 'precise_pro')),
  market_fit_ko text not null default '',
  market_fit_en text not null default '',
  feasibility_ko text not null default '',
  feasibility_en text not null default '',
  risk_ko text not null default '',
  risk_en text not null default '',
  problem_fit_ko text not null default '',
  problem_fit_en text not null default '',
  differentiation_ko text not null default '',
  differentiation_en text not null default '',
  scalability_ko text not null default '',
  scalability_en text not null default '',
  created_at timestamptz not null default now()
);
```

**Step 4: Run test to verify it passes**

Run: `npx supabase db reset`
Run: `pytest backend/tests/test_schema_contracts_v2.py -k appraisals -q`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/tests/test_schema_contracts_v2.py supabase/migrations/00007_appraisals.sql
git commit -m "db: add V2 appraisals migration"
```

### Task 8: 00008 Full Overviews

**Files:**
- Create: `supabase/migrations/00008_full_overviews.sql`
- Modify: `backend/tests/test_schema_contracts_v2.py`
- Later Modify: `backend/app/services/full_overview_service.py`
- Later Modify: `backend/app/routers/lab.py`
- Later Modify: `apps/mobile/types/full_overview.ts`
- Later Modify: `apps/mobile/app/(tabs)/lab/full-overview.tsx`

**Step 1: Write the failing test**

```python
def test_full_overviews_contract(schema):
    columns = schema.columns("full_overviews")
    assert set(columns) >= {
        "id", "user_id", "overview_id",
        "concept", "problem", "target_user",
        "features_must", "features_should", "features_later",
        "user_flow", "screens",
        "business_model", "business_rules",
        "mvp_scope", "tech_stack", "data_model_sql",
        "api_endpoints", "file_structure",
        "external_services", "auth_flow",
        "created_at", "updated_at",
    }
```

**Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_schema_contracts_v2.py -k full_overviews -q`
Expected: FAIL

**Step 3: Write minimal implementation**

Create `supabase/migrations/00008_full_overviews.sql` with:

```sql
create table public.full_overviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  overview_id uuid not null unique references public.overviews(id) on delete cascade,
  concept text not null default '',
  problem text not null default '',
  target_user text not null default '',
  features_must jsonb not null default '[]'::jsonb,
  features_should jsonb not null default '[]'::jsonb,
  features_later jsonb not null default '[]'::jsonb,
  user_flow jsonb not null default '[]'::jsonb,
  screens jsonb not null default '[]'::jsonb,
  business_model text not null default '',
  business_rules jsonb not null default '[]'::jsonb,
  mvp_scope text not null default '',
  tech_stack jsonb not null default '{}'::jsonb,
  data_model_sql text not null default '',
  api_endpoints jsonb not null default '[]'::jsonb,
  file_structure text not null default '',
  external_services jsonb not null default '[]'::jsonb,
  auth_flow jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

**Step 4: Run test to verify it passes**

Run: `npx supabase db reset`
Run: `pytest backend/tests/test_schema_contracts_v2.py -k full_overviews -q`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/tests/test_schema_contracts_v2.py supabase/migrations/00008_full_overviews.sql
git commit -m "db: add V2 full overviews migration"
```

### Task 9: 00009 AI Usage Logs And Admin RPC

**Files:**
- Create: `supabase/migrations/00009_ai_usage_logs_and_admin_rpc.sql`
- Modify: `backend/tests/test_schema_contracts_v2.py`
- Later Modify: `backend/app/services/idea_service.py`
- Later Modify: `backend/app/services/overview_service.py`
- Later Modify: `backend/app/services/appraisal_service.py`
- Later Modify: `backend/app/services/full_overview_service.py`
- Later Modify: `backend/app/routers/admin.py`

**Step 1: Write the failing test**

```python
def test_ai_usage_logs_contract(schema):
    columns = schema.columns("ai_usage_logs")
    assert set(columns) >= {
        "id", "user_id", "tier", "session_id",
        "feature_type", "feature_variant",
        "model", "prompt_version",
        "input_tokens", "output_tokens",
        "total_cost_usd", "response_time_ms",
        "status", "language", "source", "created_at",
    }
```

**Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_schema_contracts_v2.py -k ai_usage_logs -q`
Expected: FAIL

**Step 3: Write minimal implementation**

Create `supabase/migrations/00009_ai_usage_logs_and_admin_rpc.sql` with:

```sql
create table public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  tier text not null,
  session_id uuid,
  feature_type text not null check (feature_type in ('mining', 'overview', 'appraisal', 'full_overview')),
  feature_variant text,
  model text not null,
  prompt_version text not null default 'v1',
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  total_cost_usd numeric(12, 6) not null default 0,
  response_time_ms integer,
  status text not null default 'success' check (status in ('success', 'error', 'filtered')),
  language text not null default 'ko' check (language in ('ko', 'en')),
  source text not null default 'app' check (source in ('app', 'web', 'mcp')),
  created_at timestamptz not null default now()
);
```

Add the admin RPC to the same migration:

```sql
create or replace function public.exec_admin_persona(target_user_id uuid, target_tier text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  ) then
    raise exception 'Admin access required';
  end if;

  if target_tier is not null and target_tier not in ('free', 'lite', 'pro') then
    raise exception 'Invalid persona tier';
  end if;

  update public.profiles
  set persona_tier = target_tier
  where id = target_user_id;
end;
$$;
```

**Step 4: Run test to verify it passes**

Run: `npx supabase db reset`
Run: `pytest backend/tests/test_schema_contracts_v2.py -k ai_usage_logs -q`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/tests/test_schema_contracts_v2.py supabase/migrations/00009_ai_usage_logs_and_admin_rpc.sql
git commit -m "db: add V2 usage logs and admin rpc migration"
```

### Task 10: 00010 RLS And Hot Path Indexes

**Files:**
- Create: `supabase/migrations/00010_rls_and_hot_path_indexes.sql`
- Modify: `backend/tests/test_schema_contracts_v2.py`
- Later Modify: `backend/app/dependencies.py`
- Later Modify: `backend/app/services/vein_service.py`
- Later Modify: `backend/app/services/rate_limiter.py`
- Later Modify: `backend/app/routers/lab.py`
- Later Modify: `apps/mobile/lib/api.ts`

**Step 1: Write the failing test**

```python
def test_rls_policies_exist(schema):
    assert schema.has_policy("profiles", "profiles_read_own")
    assert schema.has_policy("veins", "veins_read_own")
    assert schema.has_policy("ideas", "ideas_read_own")
    assert schema.has_policy("overviews", "overviews_read_own")

def test_hot_indexes_exist(schema):
    assert schema.has_index("veins", "uq_veins_active_slot")
    assert schema.has_index("ideas", "idx_ideas_vein_sort_order")
    assert schema.has_index("ideas", "idx_ideas_vaulted_user_created")
    assert schema.has_index("appraisals", "idx_appraisals_overview_created")
```

**Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_schema_contracts_v2.py -k "policies_exist or hot_indexes_exist" -q`
Expected: FAIL

**Step 3: Write minimal implementation**

Create `supabase/migrations/00010_rls_and_hot_path_indexes.sql` with:

```sql
alter table public.profiles enable row level security;
alter table public.keywords enable row level security;
alter table public.user_daily_state enable row level security;
alter table public.active_seasons enable row level security;
alter table public.veins enable row level security;
alter table public.ideas enable row level security;
alter table public.overviews enable row level security;
alter table public.appraisals enable row level security;
alter table public.full_overviews enable row level security;
alter table public.ai_usage_logs enable row level security;

create policy profiles_read_own on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid()) = id);
create policy keywords_read_authenticated on public.keywords for select to authenticated using (true);
create policy active_seasons_read_authenticated on public.active_seasons for select to authenticated using (is_active = true);
create policy daily_state_read_own on public.user_daily_state for select to authenticated using ((select auth.uid()) = user_id);
create policy daily_state_insert_own on public.user_daily_state for insert to authenticated with check ((select auth.uid()) = user_id);
create policy daily_state_update_own on public.user_daily_state for update to authenticated using ((select auth.uid()) = user_id);
create policy veins_read_own on public.veins for select to authenticated using ((select auth.uid()) = user_id);
create policy veins_insert_own on public.veins for insert to authenticated with check ((select auth.uid()) = user_id);
create policy veins_update_own on public.veins for update to authenticated using ((select auth.uid()) = user_id);
create policy ideas_read_own on public.ideas for select to authenticated using ((select auth.uid()) = user_id);
create policy ideas_insert_own on public.ideas for insert to authenticated with check ((select auth.uid()) = user_id);
create policy ideas_update_own on public.ideas for update to authenticated using ((select auth.uid()) = user_id);
create policy ideas_delete_own on public.ideas for delete to authenticated using ((select auth.uid()) = user_id);
create policy overviews_read_own on public.overviews for select to authenticated using ((select auth.uid()) = user_id);
create policy overviews_insert_own on public.overviews for insert to authenticated with check ((select auth.uid()) = user_id);
create policy overviews_update_own on public.overviews for update to authenticated using ((select auth.uid()) = user_id);
create policy appraisals_read_own on public.appraisals for select to authenticated using ((select auth.uid()) = user_id);
create policy appraisals_insert_own on public.appraisals for insert to authenticated with check ((select auth.uid()) = user_id);
create policy full_overviews_read_own on public.full_overviews for select to authenticated using ((select auth.uid()) = user_id);
create policy full_overviews_insert_own on public.full_overviews for insert to authenticated with check ((select auth.uid()) = user_id);
create policy ai_usage_logs_read_own on public.ai_usage_logs for select to authenticated using ((select auth.uid()) = user_id);

create index idx_user_daily_state_user_date on public.user_daily_state (user_id, date);
create index idx_active_seasons_window on public.active_seasons (is_active, start_date, end_date);
create index idx_veins_user_date_active_slot on public.veins (user_id, date, is_active, slot_index);
create index idx_ideas_vein_sort_order on public.ideas (vein_id, sort_order);
create index idx_ideas_user_created on public.ideas (user_id, created_at desc);
create index idx_ideas_vaulted_user_created on public.ideas (user_id, created_at desc) where is_vaulted = true;
create index idx_overviews_user_created on public.overviews (user_id, created_at desc);
create index idx_appraisals_overview_created on public.appraisals (overview_id, created_at desc);
create index idx_appraisals_user_created on public.appraisals (user_id, created_at desc);
create index idx_full_overviews_user_created on public.full_overviews (user_id, created_at desc);
create index idx_ai_usage_logs_user_created on public.ai_usage_logs (user_id, created_at desc);
create index idx_ai_usage_logs_feature_created on public.ai_usage_logs (feature_type, created_at desc);
```

**Step 4: Run test to verify it passes**

Run: `npx supabase db reset`
Run: `pytest backend/tests/test_schema_contracts_v2.py -q`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/tests/test_schema_contracts_v2.py supabase/migrations/00010_rls_and_hot_path_indexes.sql
git commit -m "db: add V2 rls and hot path indexes"
```

---

## Code Sync Follow-Up (Immediately After Migration Chain Lands)

Do not stop after SQL. The schema is only complete when these runtime files match it:

- Backend auth/profile access:
  - `backend/app/dependencies.py`
  - `backend/app/models/schemas.py`
- Mining flow:
  - `backend/app/services/vein_service.py`
  - `backend/app/services/rate_limiter.py`
  - `backend/app/services/idea_service.py`
  - `backend/app/routers/mining.py`
  - `backend/app/routers/ideas.py`
- Lab flow:
  - `backend/app/services/overview_service.py`
  - `backend/app/services/appraisal_service.py`
  - `backend/app/services/full_overview_service.py`
  - `backend/app/routers/lab.py`
  - `backend/app/routers/appraisal.py`
  - `backend/app/routers/admin.py`
- Mobile contracts and screens:
  - `apps/mobile/lib/api.ts`
  - `apps/mobile/hooks/useProfile.ts`
  - `apps/mobile/types/api.ts`
  - `apps/mobile/types/overview.ts`
  - `apps/mobile/types/appraisal.ts`
  - `apps/mobile/types/full_overview.ts`
  - `apps/mobile/app/(tabs)/lab/overview.tsx`
  - `apps/mobile/app/(tabs)/lab/full-overview.tsx`
  - `apps/mobile/lib/mock-data.ts`

## Implementation Notes

- Prefer explicit column lists over `select("*")` once V2 settles.
- Remove V1 assumptions:
  - no single-language `title` / `summary`
  - no single-language `problem` / `target_user`
  - no stringified JSON in `full_overviews`
  - no string-built `feature_type` variants in usage logs
- Keep one authoritative path for writes. Backend should remain the write boundary for Lab and mining flows; mobile direct Supabase reads should be limited to stable read models only.
