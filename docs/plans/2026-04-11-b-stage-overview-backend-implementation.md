# B-Stage Overview Backend Rewrite Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 기존 legacy overview 파이프라인을 제거하고, B 단계 프로젝트 개요서를 canonical 산출물로 생성·저장·렌더링하는 새 백엔드와 web 프론트 계약을 구현한다.

**Architecture:** `/lab/overview`는 `idea intake -> overview plan -> claim split -> verification -> draft -> consistency check -> finalize` 흐름으로 재작성한다. `overviews` 저장 구조는 flat bilingual columns에서 `title/one_liner/language/content/internal_meta` 중심으로 바꾸고, web은 이 새 계약을 직접 렌더링하도록 함께 이동한다. mobile은 1차 범위에서 제외한다.

**Tech Stack:** FastAPI, Pydantic, OpenAI structured output, Tavily, Supabase Postgres/JSONB, Next.js, React Native/Expo, pytest

---

### Task 1: Lock the New Overview Contract

**Files:**
- Modify: `backend/app/models/llm_schemas.py`
- Modify: `backend/app/models/schemas.py`
- Create: `backend/tests/test_b_stage_overview_schema.py`

**Step 1: Write the failing schema tests**

- Add tests that assert the new overview output contains:
  - `title`
  - `one_liner`
  - `language`
  - `content`
  - `internal_meta`
- Add tests for nested section keys:
  - `project_intro`
  - `user_and_problem`
  - `why_now`
  - `smallest_prototype`
  - `first_user_experience`
  - `key_assumptions`
  - `risks_and_open_questions`
  - `validation_plan`

**Step 2: Run the tests to verify failure**

Run:

```bash
cd backend
..\\backend\\venv\\Scripts\\python -m pytest tests/test_b_stage_overview_schema.py -q
```

Expected: FAIL because the overview schema still uses legacy fields.

**Step 3: Replace the Pydantic models**

- Remove or stop using the old `OverviewResponse` flat field shape.
- Introduce nested models for:
  - `OverviewDocumentResponse`
  - `OverviewSections`
  - `KeyAssumption`
  - `RisksAndOpenQuestions`
  - `ValidationPlan`
  - `OverviewInternalMeta`
  - `OverviewClaim`

**Step 4: Update API response models**

- Replace legacy `OverviewOut` in `backend/app/models/schemas.py` with the new overview output contract.
- Keep the response stable enough for frontends to consume directly.

**Step 5: Run the tests to verify pass**

Run:

```bash
cd backend
..\\backend\\venv\\Scripts\\python -m pytest tests/test_b_stage_overview_schema.py -q
```

Expected: PASS

### Task 2: Rewrite the Database Shape for Overviews

**Files:**
- Create: `supabase/migrations/00014_overview_document_rewrite.sql`
- Modify: `backend/tests/test_schema_contracts_v2.py`

**Step 1: Write schema contract tests for the new table shape**

- Add or update tests asserting `public.overviews` contains:
  - `title`
  - `one_liner`
  - `language`
  - `content`
  - `internal_meta`
- Remove assertions that require:
  - `concept_ko`
  - `problem_ko`
  - `target_ko`
  - `features_ko`
  - `differentiator_ko`
  - `revenue_ko`
  - `mvp_scope_ko`

**Step 2: Run the contract tests to verify failure**

Run:

```bash
cd backend
..\\backend\\venv\\Scripts\\python -m pytest tests/test_schema_contracts_v2.py -q
```

Expected: FAIL on overview column contract.

**Step 3: Write the migration**

- Migrate `public.overviews` to the new canonical shape.
- Preserve:
  - primary key
  - `idea_id`
  - `user_id`
  - timestamps
  - triggers / indexes / RLS
- Add JSONB defaults for `content` and `internal_meta`.

**Step 4: Reconcile trigger and index expectations**

- Ensure `set_overviews_updated_at` still exists.
- Keep or recreate the hot-path index on `(user_id, created_at desc)`.

**Step 5: Run the contract tests again**

Run:

```bash
cd backend
..\\backend\\venv\\Scripts\\python -m pytest tests/test_schema_contracts_v2.py -q
```

Expected: PASS for overview contract.

### Task 3: Replace Market Research with Claim Verification

**Files:**
- Modify: `backend/app/services/market_research.py`
- Create: `backend/tests/test_overview_claim_verification.py`

**Step 1: Write failing tests for claim-driven verification**

- Test that only `needs_check` claims are sent to search.
- Test that unsupported claims are downgraded instead of returned as fact.
- Test that empty search results produce `supported=false` style outputs.

**Step 2: Run the tests to verify failure**

Run:

```bash
cd backend
..\\backend\\venv\\Scripts\\python -m pytest tests/test_overview_claim_verification.py -q
```

Expected: FAIL because the current service still does unconditional market/competition search.

**Step 3: Rewrite the service API**

- Replace `research_market(title_en, summary_en, keywords)` with a claim-driven API such as:
  - `verify_claims(claims: list[dict]) -> list[dict]`
- Keep Tavily as the initial provider.
- Return structured evidence, not prose blobs.

**Step 4: Add graceful fallback behavior**

- If Tavily fails, return unsupported or unresolved claims.
- Do not inject fabricated fallback prose.

**Step 5: Run the tests to verify pass**

Run:

```bash
cd backend
..\\backend\\venv\\Scripts\\python -m pytest tests/test_overview_claim_verification.py -q
```

Expected: PASS

### Task 4: Rewrite the Overview Prompt Around the B Skeleton

**Files:**
- Modify: `backend/app/prompts/overview.py`
- Delete or stop using: `backend/app/prompts/concept.py`
- Create: `backend/tests/test_overview_prompt_contract.py`

**Step 1: Write failing prompt contract tests**

- Assert the overview prompt explicitly requires the 8 canonical sections.
- Assert the prompt contains:
  - assumption handling
  - external-claim caution
  - anti-example language
  - smallest prototype focus
- Assert the prompt does not require revenue or long feature lists.

**Step 2: Run the tests to verify failure**

Run:

```bash
cd backend
..\\backend\\venv\\Scripts\\python -m pytest tests/test_overview_prompt_contract.py -q
```

Expected: FAIL because the current prompt is still legacy overview oriented.

**Step 3: Replace the prompt**

- Remove concept-stage dependency from the overview generation path.
- Install the new B-stage prompt:
  - skeleton
  - micro examples
  - anti-examples
  - self-check list

**Step 4: Remove concept references**

- Stop importing or calling `build_concept_prompt` for overview generation.
- Mark `concept.py` as removable once all references are gone.

**Step 5: Run the tests to verify pass**

Run:

```bash
cd backend
..\\backend\\venv\\Scripts\\python -m pytest tests/test_overview_prompt_contract.py -q
```

Expected: PASS

### Task 5: Rebuild the Overview Service Pipeline

**Files:**
- Modify: `backend/app/services/overview_service.py`
- Create: `backend/tests/test_overview_service_pipeline.py`

**Step 1: Write failing service pipeline tests**

- Test pipeline stages:
  - idea intake
  - claim split
  - verification call
  - final overview generation
- Test that unsupported claims are softened or moved into assumptions/open questions.
- Test that overview persistence uses the new columns.

**Step 2: Run the tests to verify failure**

Run:

```bash
cd backend
..\\backend\\venv\\Scripts\\python -m pytest tests/test_overview_service_pipeline.py -q
```

Expected: FAIL because the current service still calls concept then overview and inserts legacy columns.

**Step 3: Rewrite the service**

- Remove the concept stage from `generate_overview`.
- Build a single canonical pipeline:
  - normalize input
  - derive overview plan
  - classify claims
  - verify only `needs_check`
  - generate final structured overview
  - run consistency checks
  - persist

**Step 4: Persist the new overview shape**

- Insert:
  - `title`
  - `one_liner`
  - `language`
  - `content`
  - `internal_meta`
- Keep usage logging and rate-limit integration intact.

**Step 5: Run the tests to verify pass**

Run:

```bash
cd backend
..\\backend\\venv\\Scripts\\python -m pytest tests/test_overview_service_pipeline.py -q
```

Expected: PASS

### Task 6: Update the Lab Router Contract

**Files:**
- Modify: `backend/app/routers/lab.py`
- Create: `backend/tests/test_lab_overview_route.py`

**Step 1: Write failing route tests**

- Test that `POST /lab/overview` returns the new overview response shape.
- Test that route ownership and rate limiting still work.
- Test that deleted legacy fields are not returned.

**Step 2: Run the tests to verify failure**

Run:

```bash
cd backend
..\\backend\\venv\\Scripts\\python -m pytest tests/test_lab_overview_route.py -q
```

Expected: FAIL

**Step 3: Update the route implementation**

- Keep `idea_id` request shape.
- Return the new overview contract directly.
- Keep `source` plumbed through so app/web can be distinguished later.

**Step 4: Run the tests to verify pass**

Run:

```bash
cd backend
..\\backend\\venv\\Scripts\\python -m pytest tests/test_lab_overview_route.py -q
```

Expected: PASS

### Task 7: Migrate Web Overview Consumption

**Files:**
- Modify: `apps/web/src/types/api.ts`
- Modify: `apps/web/src/lib/api.ts`
- Modify: `apps/web/src/app/(app)/lab/overview/[ideaId]/page.tsx`
- Modify: `apps/web/src/app/(app)/vault/[ideaId]/page.tsx`
- Modify: `apps/web/src/app/(app)/lab/collection/[ideaId]/page.tsx`
- Modify: `apps/web/src/components/lab/overview-row.tsx`
- Modify: `apps/web/src/lib/mock-data.ts`

**Step 1: Write or update failing UI data-shape tests if present**

- If the repo already has tests for web overview rendering, update them first.
- If not, add lightweight type-level or render tests for overview sections.

**Step 2: Replace the web `Overview` type**

- Remove legacy flat field dependencies.
- Model:
  - `title`
  - `one_liner`
  - `language`
  - `content`
  - `internal_meta`

**Step 3: Rewrite overview rendering**

- Render the 8 canonical sections.
- Update overview cards to use `one_liner` or a derived summary instead of `problem_ko`.

**Step 4: Update mock data**

- Replace legacy mock overview generators with the new nested content shape.

**Step 5: Run the web checks**

Run the project’s existing web typecheck/test command after the code change.

### Task 8: Defuse Downstream Legacy Dependencies

**Files:**
- Modify: `apps/web/src/app/(app)/lab/overview/[ideaId]/page.tsx`
- Modify: `backend/app/routers/lab.py`

**Step 1: Decide temporary downstream behavior**

- Hide or soften entry points to:
  - appraisal
  - full overview
  - design
  - blueprint
  - roadmap
- Do this if those flows still assume the old overview shape.

**Step 2: Apply the temporary guard**

- Prefer UI-level hide/disable first.
- Add backend safeguards only if route usage would otherwise error in production.

**Step 3: Verify the B-stage journey works cleanly**

- Idea click
- Overview generation
- Overview readback from vault/lab
- Overview list rendering

### Task 9: Remove Dead Legacy Overview Code

**Files:**
- Delete or stop using: `backend/app/prompts/concept.py`
- Delete or stop using old overview mapping code in `backend/app/services/overview_service.py`
- Clean references in:
  - `backend/app/services/overview_service.py`
  - `backend/app/routers/lab.py`
  - tests and types updated above

**Step 1: Search for dead references**

Run:

```bash
rg -n "concept_ko|problem_ko|target_ko|features_ko|revenue_ko|build_concept_prompt|ConceptResponse" backend apps
```

**Step 2: Remove or refactor remaining references**

- Only remove references that are fully replaced by the new overview contract.

**Step 3: Run the focused full test pass**

Run:

```bash
cd backend
..\\backend\\venv\\Scripts\\python -m pytest tests/test_b_stage_overview_schema.py tests/test_overview_claim_verification.py tests/test_overview_prompt_contract.py tests/test_overview_service_pipeline.py tests/test_lab_overview_route.py tests/test_schema_contracts_v2.py -q
```

Then run the project’s web and mobile verification commands.

**Step 4: Manual smoke test**

- Generate an overview from a mined idea.
- Open it in web.
- Confirm the 8-section structure appears correctly in web and no legacy fields are required.
