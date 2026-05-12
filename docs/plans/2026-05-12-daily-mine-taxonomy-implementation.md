# Daily Mine Taxonomy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

> **Superseded lane-plan note:** This is a historical implementation plan. Its equal-lane 3 Cozy Personal / 3 Indie Tool / 3 Practical Twist / 1 Weird Bridge target is superseded. Current direction: each day has one `cozy_personal`, one `indie_tool`, and one `practical_twist` Vein; the selected Vein produces 10 Ores with `6 family-core + 2 adjacent-family + 1 opposite-family + 1 weird bridge`.

**Goal:** Move V3 Daily Mine from old startup-style keyword generation to the new taxonomy-driven Idea Ore flow.

**Architecture:** Keep the existing FastAPI/Supabase/Next.js Ore flow, but replace the Daily Vein keyword source and Ore discovery prompt contract. The backend remains the source of truth for Vein generation, hidden keyword roles, hidden Ore lanes, active keyword subsets, validation, and persistence.

**Tech Stack:** FastAPI, Supabase Postgres, OpenAI structured outputs, Next.js, TypeScript, pytest.

---

## Context

The current production flow works technically, but content quality is constrained by the old keyword taxonomy:

`who + domain + tech + value + money`

That structure tends to produce generic startup/SaaS ideas because it closes the product direction too early.

The V3 Daily Mine direction is now:

`Subject + Material + Tension + Shape + Ritual / Constraint`

One Daily Vein contains 5 visible keyword labels, one from each role. One mined Vein produces exactly 10 Idea Ores:

> **Superseded:** The following equal-lane target is historical. Current direction uses the selected Vein's hidden family: `6 family-core + 2 adjacent-family + 1 opposite-family + 1 weird bridge`.

- 3 Cozy Personal
- 3 Indie Tool
- 3 Practical Twist
- 1 Weird Bridge

Each Ore should actively use only 3 to 4 of the 5 Vein keywords. Lane and role metadata stay hidden from the UI.

Reference documents:

- `docs/Idea-Mine-V3-Daily-Mine-Keyword-Taxonomy.md`
- `docs/evals/ore-taxonomy-samples-2026-05-12.md`
- `backend/scripts/test_ore_taxonomy_prompt.py`

## Key Decisions

1. Use `gpt-5-mini` as the default Ore discovery model.
   - `gpt-5-nano` was too weak for lane and active keyword constraints.
   - `gpt-5` is too heavy for Daily Mine and should be reserved for deeper Web Lab work unless quality requires otherwise.

2. Keep public keyword responses as `id` and `label`.
   - Role, category, subtype, lane, and validation metadata are internal.

3. Store hidden generation metadata in `idea_ores.generation_meta`.
   - Add `ore_lane`.
   - Add `active_keywords`.
   - Keep existing `generation_lens`, `product_form`, `core_loop_signature`, etc.

4. Render only active keywords on Ore cards.
   - Vein cards still show all 5 visible keyword labels.
   - Ore cards should show the 3 to 4 active keyword labels used by that Ore.

5. Do not rewrite the old mining flow.
   - Add/adjust the Ore V3 path cleanly.
   - Old `who/domain/tech/value/money` data can remain for legacy flows.

---

## Task 1: Lock The Model Default

**Files:**

- Modify: `backend/app/config.py`
- Modify: `backend/tests/test_ore_service.py`

**Step 1: Write/update the failing test**

In `backend/tests/test_ore_service.py`, update the model default assertion:

```python
def test_ore_discovery_defaults_to_fast_daily_mine_generation_settings():
    assert Settings.model_fields["ore_discovery_model"].default == "gpt-5-mini"
    assert Settings.model_fields["ore_discovery_reasoning_effort"].default == "minimal"
```

**Step 2: Run the test and verify it fails**

Run:

```powershell
$env:PYTHONPATH='.'; pytest tests/test_ore_service.py::test_ore_discovery_defaults_to_fast_daily_mine_generation_settings -q
```

Expected: fail because current default is `gpt-5-nano`.

**Step 3: Implement the change**

In `backend/app/config.py`:

```python
ore_discovery_model: str = "gpt-5-mini"
ore_discovery_reasoning_effort: str = "minimal"
```

**Step 4: Run tests**

Run:

```powershell
$env:PYTHONPATH='.'; pytest tests/test_ore_service.py -q
```

Expected: pass.

**Step 5: Commit**

```powershell
git add backend/app/config.py backend/tests/test_ore_service.py
git commit -m "fix: use gpt-5-mini for ore discovery"
```

---

## Task 2: Add V3 Daily Mine Keyword Seed Source

**Files:**

- Create: `backend/app/services/daily_mine_keywords.py`
- Create: `backend/tests/test_daily_mine_keywords.py`

**Step 1: Write failing tests**

Create `backend/tests/test_daily_mine_keywords.py`:

```python
from app.services.daily_mine_keywords import DAILY_MINE_KEYWORDS, DAILY_MINE_ROLES


def test_daily_mine_keywords_cover_all_roles():
    assert DAILY_MINE_ROLES == [
        "Subject",
        "Material",
        "Tension",
        "Shape",
        "Ritual / Constraint",
    ]

    by_role = {role: [] for role in DAILY_MINE_ROLES}
    for keyword in DAILY_MINE_KEYWORDS:
        by_role[keyword["role"]].append(keyword)

    assert all(len(items) >= 20 for items in by_role.values())


def test_daily_mine_keywords_are_user_visible_labels_only_plus_internal_role():
    for keyword in DAILY_MINE_KEYWORDS:
        assert set(keyword.keys()) == {"slug", "label", "role"}
        assert keyword["slug"]
        assert keyword["label"]
        assert keyword["role"] in DAILY_MINE_ROLES


def test_daily_mine_keywords_exclude_old_business_model_terms():
    forbidden = {
        "Marketplace",
        "Licensing",
        "Subscription",
        "B2B SaaS",
        "API Service",
        "Pay-per-use",
        "Enterprise",
    }
    labels = {keyword["label"] for keyword in DAILY_MINE_KEYWORDS}
    assert labels.isdisjoint(forbidden)
```

**Step 2: Run test and verify it fails**

Run:

```powershell
$env:PYTHONPATH='.'; pytest tests/test_daily_mine_keywords.py -q
```

Expected: import error because module does not exist.

**Step 3: Implement keyword module**

Create `backend/app/services/daily_mine_keywords.py`.

Use the candidate pool from `docs/Idea-Mine-V3-Daily-Mine-Keyword-Taxonomy.md`.

Shape:

```python
DAILY_MINE_ROLES = [
    "Subject",
    "Material",
    "Tension",
    "Shape",
    "Ritual / Constraint",
]

DAILY_MINE_KEYWORDS = [
    {"slug": "solo-traveler", "label": "solo traveler", "role": "Subject"},
    ...
]
```

Use lowercase user-facing labels unless a label naturally needs casing, such as `AI companion`, `PDF stack`, or `QR code`.

**Step 4: Run test**

Run:

```powershell
$env:PYTHONPATH='.'; pytest tests/test_daily_mine_keywords.py -q
```

Expected: pass.

**Step 5: Commit**

```powershell
git add backend/app/services/daily_mine_keywords.py backend/tests/test_daily_mine_keywords.py
git commit -m "feat: add daily mine keyword taxonomy source"
```

---

## Task 3: Add Database Migration For Keyword Roles And Ore Active Keywords

**Files:**

- Create: `supabase/migrations/<next>_daily_mine_taxonomy.sql` or project-equivalent migration path
- Modify: `backend/tests/test_schema_contracts_v2.py`

**Step 1: Inspect migration location**

Run:

```powershell
rg --files | rg "migration|supabase|sql"
```

Use the repo's existing migration pattern.

**Step 2: Write schema contract expectations**

Update schema contract tests to expect:

- `keywords.role text null` or equivalent internal role column.
- `keywords.source text null` or `keyword_set text null` if needed to distinguish `daily_mine_v3`.
- `idea_ores.active_keywords jsonb not null default '[]'::jsonb`.
- `jsonb_typeof(active_keywords) = 'array'`.

Preferred DB shape:

```sql
alter table public.keywords
add column if not exists role text;

alter table public.keywords
add column if not exists keyword_set text;

alter table public.idea_ores
add column if not exists active_keywords jsonb not null default '[]'::jsonb;

alter table public.idea_ores
add constraint idea_ores_active_keywords_array
check (jsonb_typeof(active_keywords) = 'array');
```

**Step 3: Run schema test and verify it fails before migration is applied**

Run only if schema test DB is configured:

```powershell
$env:PYTHONPATH='.'; pytest tests/test_schema_contracts_v2.py -q
```

If `SCHEMA_TEST_DB_URL` is not configured, document that migration is verified manually against Supabase.

**Step 4: Add migration**

Create migration with idempotent SQL. Include comments explaining that `role` is internal and not shown to users.

**Step 5: Apply migration to Supabase**

Use the established local process from previous migrations. Verify with:

```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name in ('keywords', 'idea_ores')
  and column_name in ('role', 'keyword_set', 'active_keywords');
```

**Step 6: Commit**

```powershell
git add <migration-file> backend/tests/test_schema_contracts_v2.py
git commit -m "feat: add daily mine taxonomy schema"
```

---

## Task 4: Seed V3 Daily Mine Keywords

**Files:**

- Create: `backend/scripts/seed_daily_mine_keywords.py`
- Create: `backend/tests/test_seed_daily_mine_keywords.py`

**Step 1: Write tests for row building**

Avoid testing live Supabase in unit tests. Test a pure helper:

```python
from scripts.seed_daily_mine_keywords import build_keyword_rows
from app.services.daily_mine_keywords import DAILY_MINE_KEYWORDS


def test_build_keyword_rows_marks_daily_mine_v3_keywords():
    rows = build_keyword_rows(DAILY_MINE_KEYWORDS[:2])

    assert rows[0]["keyword_set"] == "daily_mine_v3"
    assert rows[0]["is_active"] is True
    assert rows[0]["category"] == "daily_mine"
    assert rows[0]["role"] in {"Subject", "Material"}
```

**Step 2: Run test and verify failure**

Run:

```powershell
$env:PYTHONPATH='.'; pytest tests/test_seed_daily_mine_keywords.py -q
```

Expected: fail because script does not exist.

**Step 3: Implement seeding script**

Create `backend/scripts/seed_daily_mine_keywords.py`.

Behavior:

- Read `DAILY_MINE_KEYWORDS`.
- Build rows with:
  - `slug`
  - `label`
  - `category = "daily_mine"`
  - `role`
  - `keyword_set = "daily_mine_v3"`
  - `is_active = true`
  - `is_premium = false`
- Upsert by `slug` if existing schema supports it.

**Step 4: Run unit test**

Run:

```powershell
$env:PYTHONPATH='.'; pytest tests/test_seed_daily_mine_keywords.py -q
```

**Step 5: Run script manually**

Run:

```powershell
$env:PYTHONPATH='.'; python scripts/seed_daily_mine_keywords.py
```

Verify in Supabase:

```sql
select role, count(*)
from public.keywords
where keyword_set = 'daily_mine_v3'
group by role
order by role;
```

Expected: at least 20 per role.

**Step 6: Commit**

```powershell
git add backend/scripts/seed_daily_mine_keywords.py backend/tests/test_seed_daily_mine_keywords.py
git commit -m "feat: seed daily mine v3 keywords"
```

---

## Task 5: Update Daily Vein Generation

**Files:**

- Modify: `backend/app/services/vein_service.py`
- Modify: `backend/tests/test_ore_service.py` or create `backend/tests/test_vein_service_daily_mine.py`

**Step 1: Write test for role-balanced Veins**

Create or update tests around a pure helper if possible.

Preferred: extract a helper:

```python
def build_daily_mine_vein_keyword_ids(keywords_by_role: dict[str, list[dict]], rng: random.Random) -> list[str]:
    ...
```

Test:

```python
def test_build_daily_mine_vein_keyword_ids_selects_one_keyword_per_role():
    keywords_by_role = {
        "Subject": [{"id": "subject-1"}],
        "Material": [{"id": "material-1"}],
        "Tension": [{"id": "tension-1"}],
        "Shape": [{"id": "shape-1"}],
        "Ritual / Constraint": [{"id": "ritual-1"}],
    }

    ids = build_daily_mine_vein_keyword_ids(keywords_by_role, random.Random(1))

    assert ids == ["subject-1", "material-1", "tension-1", "shape-1", "ritual-1"]
```

**Step 2: Run test and verify failure**

Run:

```powershell
$env:PYTHONPATH='.'; pytest tests/test_vein_service_daily_mine.py -q
```

**Step 3: Implement helper and query change**

In `_create_veins`, for the Ore/Daily Mine flow:

- Query only `keywords.keyword_set = "daily_mine_v3"`.
- Group by `role`.
- Pick one keyword per required role.
- Keep 3 active Veins per day.

Be careful if old mining flow still uses `vein_service`. If shared usage is risky, add a parameter:

```python
async def get_or_create_today_veins(..., mode: str = "legacy")
```

Then call `mode="daily_mine_v3"` from `ore_service.get_today_ore_veins`.

**Step 4: Run tests**

Run:

```powershell
$env:PYTHONPATH='.'; pytest tests/test_vein_service_daily_mine.py tests/test_ore_service.py -q
```

**Step 5: Manual API check**

After migration and seed:

```powershell
curl.exe -H "Authorization: Bearer <token>" https://idea-mine-production-a06d.up.railway.app/ore/veins/today
```

Verify each Vein has 5 labels and no role/category in public response.

**Step 6: Commit**

```powershell
git add backend/app/services/vein_service.py backend/tests/test_vein_service_daily_mine.py backend/app/services/ore_service.py
git commit -m "feat: generate daily mine taxonomy veins"
```

---

## Task 6: Update Ore Discovery Structured Output And Prompt

**Files:**

- Modify: `backend/app/models/llm_schemas.py`
- Modify: `backend/app/prompts/ore_discovery.py`
- Modify: `backend/tests/test_ore_prompt.py`

**Step 1: Update schema test expectations**

Add fields to `OreDiscoveryIdea`:

```python
ore_lane: str
active_keywords: list[str]
```

Test prompt content:

- Includes lane distribution:
  - **Superseded mapping:** this old fixed 3/3/3/1 sort-order mapping has been replaced by the family-weighted plan. Current direction: selected hidden family gets sort_order 1-6, adjacent family gets 7-8, opposite family gets 9, and Weird Bridge gets 10.
  - `sort_order 1-3: ore_lane must be Cozy Personal`
  - `sort_order 4-6: ore_lane must be Indie Tool`
  - `sort_order 7-9: ore_lane must be Practical Twist`
  - `sort_order 10: ore_lane must be Weird Bridge`
- Includes active keyword rule:
  - exactly 3 or 4 active keywords
  - exact labels only
  - do not force all 5 keywords into every ore

**Step 2: Run tests and verify failure**

Run:

```powershell
$env:PYTHONPATH='.'; pytest tests/test_ore_prompt.py -q
```

**Step 3: Implement prompt update**

Update `ore_discovery.py` using the tested structure from `backend/scripts/test_ore_taxonomy_prompt.py`.

Keep public text short and avoid exposing hidden metadata.

**Step 4: Run tests**

Run:

```powershell
$env:PYTHONPATH='.'; pytest tests/test_ore_prompt.py -q
```

**Step 5: Commit**

```powershell
git add backend/app/models/llm_schemas.py backend/app/prompts/ore_discovery.py backend/tests/test_ore_prompt.py
git commit -m "feat: add taxonomy lanes to ore discovery prompt"
```

---

## Task 7: Persist Active Keywords And Lane Metadata

**Files:**

- Modify: `backend/app/services/ore_service.py`
- Modify: `backend/app/models/schemas.py`
- Modify: `backend/tests/test_ore_service.py`
- Modify: `backend/tests/test_ore_openapi.py`

**Step 1: Update service tests**

Expected behavior:

- `generation_meta` includes `ore_lane`.
- `idea_ores.active_keywords` stores only public visible keyword objects:

```python
[
    {"id": "kw-cat", "label": "cat"},
    {"id": "kw-dream", "label": "dream fragment"},
]
```

- Public `IdeaOreOut.selected_keywords` should map to active keywords if available.

**Step 2: Run tests and verify failure**

Run:

```powershell
$env:PYTHONPATH='.'; pytest tests/test_ore_service.py tests/test_ore_openapi.py -q
```

**Step 3: Implement changes**

In `ore_service.py`:

- Add `ore_lane` and `active_keywords` handling.
- Normalize `ore_lane` by `sort_order`.
- Validate active keywords:
  - exactly 3 or 4
  - labels must be from the Vein
  - no role names
- Convert active keyword labels to `{id, label}` objects before persistence.
- Store:
  - `idea_ores.selected_keywords`: full Vein keywords or keep existing behavior if needed for compatibility.
  - `idea_ores.active_keywords`: active keyword objects.
  - `generation_meta.ore_lane`: hidden lane.

Recommended public API behavior:

- `selected_keywords` in `IdeaOreOut` should become active keywords.
- If old rows have no `active_keywords`, fall back to `selected_keywords`.

**Step 4: Run tests**

Run:

```powershell
$env:PYTHONPATH='.'; pytest tests/test_ore_service.py tests/test_ore_openapi.py -q
```

**Step 5: Commit**

```powershell
git add backend/app/services/ore_service.py backend/app/models/schemas.py backend/tests/test_ore_service.py backend/tests/test_ore_openapi.py
git commit -m "feat: persist ore active keywords"
```

---

## Task 8: Frontend Active Keyword Rendering

**Files:**

- Modify: `apps/web/src/types/api.ts`
- Modify: `apps/web/src/app/(app)/mine/mine-client.tsx`
- Modify: `apps/web/src/lib/mock-data.ts`

**Step 1: Type update**

Keep `IdeaOre.selected_keywords` as the public active keyword list unless backend adds a separate public `active_keywords`.

Preferred minimal frontend change:

- No new UI metadata.
- Existing keyword chip rendering keeps working.
- Mock data uses 3 to 4 selected keywords per Ore.

**Step 2: Run TypeScript**

Run:

```powershell
npx tsc --noEmit
```

**Step 3: Run lint**

Run:

```powershell
npm run lint
```

**Step 4: Commit**

```powershell
git add apps/web/src/types/api.ts apps/web/src/app/(app)/mine/mine-client.tsx apps/web/src/lib/mock-data.ts
git commit -m "feat: show active ore keywords"
```

---

## Task 9: End-To-End Local And Production Validation

**Files:**

- Modify or create: `docs/evals/ore-taxonomy-production-check-YYYY-MM-DD.md`

**Step 1: Run backend tests**

```powershell
$env:PYTHONPATH='.'; pytest -q --ignore=tests/test_schema_contracts_v2.py
```

Expected: pass.

**Step 2: Run frontend checks**

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

Expected: pass.

**Step 3: Run taxonomy experiment again**

```powershell
$env:PYTHONPATH='.'; python scripts/test_ore_taxonomy_prompt.py --model gpt-5-mini
```

Expected: writes `docs/evals/ore-taxonomy-samples-YYYY-MM-DD.md`.

**Step 4: Test production API after deploy**

Use a temporary account or current authenticated session:

- `GET /ore/veins/today`
- `POST /ore/discover`

Verify:

- 3 Veins shown.
- Each Vein has 5 keyword labels.
- No role/category shown in public API.
- One Vein mines exactly 10 Ores.
- Ore cards show 3 to 4 active keyword labels.
- Generated content includes at least:
  - 2 save-worthy ores in Cozy/Personal direction
  - 2 save-worthy ores in Indie Tool direction
  - 2 save-worthy ores in Practical Twist direction

**Step 5: Record QA notes**

Create `docs/evals/ore-taxonomy-production-check-YYYY-MM-DD.md` with:

- Vein tested
- 10 Ore titles
- quick quality score
- observed issues
- prompt/taxonomy follow-up recommendations

**Step 6: Commit**

```powershell
git add docs/evals/ore-taxonomy-production-check-YYYY-MM-DD.md
git commit -m "docs: record daily mine taxonomy qa"
```

---

## Risks

1. `gpt-5-mini` may increase latency.
   - Mitigation: keep loading state clear; consider async job later.

2. New taxonomy may overfit to cute/cozy concepts.
   - Mitigation: keep practical subjects/materials and Practical Twist lane.

3. Shape keywords may dominate.
   - Mitigation: validate active keyword distribution and product_form duplication.

4. Existing legacy rows may not have `active_keywords`.
   - Mitigation: fallback to `selected_keywords` for old rows.

5. Keyword seeding may collide with existing slugs.
   - Mitigation: use `keyword_set='daily_mine_v3'` and idempotent upserts.

## Done Criteria

- `gpt-5-mini` is the Ore discovery default.
- Daily Mine Veins use 5 V3 taxonomy keywords.
- Public API hides role/category/lane metadata.
- Current superseding target: Ore generation uses hidden family-weighted lanes: 6 family-core + 2 adjacent-family + 1 opposite-family + 1 weird bridge.
- Each Ore stores and renders 3 to 4 active keywords.
- Backend and frontend checks pass.
- A production QA document confirms that at least one real Vein produces a diverse, save-worthy 10-Ore set.

