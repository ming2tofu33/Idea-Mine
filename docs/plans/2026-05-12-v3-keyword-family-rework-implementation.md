# V3 Keyword Family Rework Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rework Daily Mine so every day provides one Cozy Personal Vein, one Indie Tool Vein, and one Practical Twist Vein, then mines each selected Vein into 10 family-weighted Idea Ores.

**Architecture:** Add internal `family` metadata to Daily Mine keywords and Veins. The backend will generate one active Daily Vein per family, pass the selected family into the Ore discovery prompt, and validate a 6 / 2 / 1 / 1 family-weighted lane plan. Public API and UI responses continue to hide all internal metadata.

**Tech Stack:** FastAPI, Pydantic, Supabase/Postgres migrations, Supabase Python client, OpenAI structured output, pytest.

---

## Task 1: Add Family Metadata To The DB Contract

**Files:**
- Create: `supabase/migrations/00021_daily_mine_keyword_families.sql`
- Modify: `backend/tests/test_schema_contracts_v2.py`

**Step 1: Write the failing schema contract test**

Add expectations to `test_keywords_contract`:

```python
assert "family" in columns
assert details["family"]["data_type"] == "text"
assert details["family"]["is_nullable"] is True

constraint_definitions = schema.constraint_definitions("public", "keywords")
assert any(
    "family" in item
    and "'cozy_personal'" in item
    and "'indie_tool'" in item
    and "'practical_twist'" in item
    for item in constraint_definitions
)

indexes = schema.index_definitions("public", "keywords")
assert "idx_keywords_daily_mine_family_role_active" in indexes
assert "keyword_set, family, role, is_active" in indexes["idx_keywords_daily_mine_family_role_active"]
```

Add expectations to `test_veins_contract`:

```python
assert "family" in columns
assert details["family"]["data_type"] == "text"
assert details["family"]["is_nullable"] is True

constraint_definitions = schema.constraint_definitions("public", "veins")
assert any(
    "family" in item
    and "'cozy_personal'" in item
    and "'indie_tool'" in item
    and "'practical_twist'" in item
    for item in constraint_definitions
)
```

**Step 2: Run the schema test to verify it fails**

Run:

```bash
cd backend
python -m pytest tests/test_schema_contracts_v2.py::test_keywords_contract tests/test_schema_contracts_v2.py::test_veins_contract -q
```

Expected: FAIL because `family` columns and indexes do not exist.

**Step 3: Add the migration**

Create `supabase/migrations/00021_daily_mine_keyword_families.sql`:

```sql
-- V3 Daily Mine keyword family metadata.
-- family is internal generation metadata and must not be exposed to clients.

alter table public.keywords
add column if not exists family text;

alter table public.keywords
drop constraint if exists keywords_family_check;

alter table public.keywords
add constraint keywords_family_check
check (
  family is null
  or family in ('cozy_personal', 'indie_tool', 'practical_twist')
);

create index if not exists idx_keywords_daily_mine_family_role_active
on public.keywords (keyword_set, family, role, is_active)
where is_active = true;

alter table public.veins
add column if not exists family text;

alter table public.veins
drop constraint if exists veins_family_check;

alter table public.veins
add constraint veins_family_check
check (
  family is null
  or family in ('cozy_personal', 'indie_tool', 'practical_twist')
);

create index if not exists idx_veins_daily_mine_family_active
on public.veins (user_id, date, keyword_set, family, is_active)
where is_active = true;
```

**Step 4: Run the schema test again**

Run:

```bash
cd backend
python -m pytest tests/test_schema_contracts_v2.py::test_keywords_contract tests/test_schema_contracts_v2.py::test_veins_contract -q
```

Expected: PASS.

**Step 5: Commit**

```bash
git add supabase/migrations/00021_daily_mine_keyword_families.sql backend/tests/test_schema_contracts_v2.py
git commit -m "feat: add daily mine family metadata"
```

---

## Task 2: Rework The Daily Mine Keyword Source

**Files:**
- Modify: `backend/app/services/daily_mine_keywords.py`
- Modify: `backend/scripts/seed_daily_mine_keywords.py`
- Modify: `backend/tests/test_daily_mine_keywords.py`
- Modify: `backend/tests/test_seed_daily_mine_keywords.py`

**Step 1: Write failing keyword source tests**

Update `backend/tests/test_daily_mine_keywords.py`:

```python
from app.services.daily_mine_keywords import (
    DAILY_MINE_FAMILIES,
    DAILY_MINE_KEYWORDS,
    DAILY_MINE_ROLES,
    group_daily_mine_keywords_by_family_and_role,
)


def test_daily_mine_keywords_cover_all_families_and_roles():
    assert DAILY_MINE_FAMILIES == [
        "cozy_personal",
        "indie_tool",
        "practical_twist",
    ]

    grouped = group_daily_mine_keywords_by_family_and_role()
    for family in DAILY_MINE_FAMILIES:
        for role in DAILY_MINE_ROLES:
            assert len(grouped[family][role]) >= 8


def test_daily_mine_keywords_are_visible_labels_plus_internal_role_and_family():
    for keyword in DAILY_MINE_KEYWORDS:
        assert set(keyword) == {"slug", "label", "role", "family"}
        assert keyword["family"] in DAILY_MINE_FAMILIES
        assert keyword["role"] in DAILY_MINE_ROLES


def test_daily_mine_keywords_reduce_over_determining_terms():
    discouraged_labels = {
        "tiny note",
        "printable sheet",
        "packing board",
        "three saved items max",
        "waiting anxiety",
        "safety anxiety",
    }
    labels = {keyword["label"] for keyword in DAILY_MINE_KEYWORDS}
    assert labels.isdisjoint(discouraged_labels)
```

Update `backend/tests/test_seed_daily_mine_keywords.py`:

```python
def test_build_keyword_rows_marks_daily_mine_family():
    row = build_keyword_rows(DAILY_MINE_KEYWORDS[:1])[0]

    assert row["family"] == DAILY_MINE_KEYWORDS[0]["family"]
    assert row["subtype"] == "subject"


def test_find_stale_daily_mine_slugs_detects_removed_rows():
    stale = find_stale_daily_mine_slugs(
        existing_rows=[{"slug": "old-bad-keyword"}, {"slug": DAILY_MINE_KEYWORDS[0]["slug"]}],
        source_keywords=DAILY_MINE_KEYWORDS[:1],
    )

    assert stale == ["old-bad-keyword"]
```

**Step 2: Run tests to verify they fail**

Run:

```bash
cd backend
python -m pytest tests/test_daily_mine_keywords.py tests/test_seed_daily_mine_keywords.py -q
```

Expected: FAIL because keyword shape has no `family`, no family grouping helper exists, and seed rows do not write family.

**Step 3: Add family constants and helpers**

In `backend/app/services/daily_mine_keywords.py`, add:

```python
DAILY_MINE_FAMILIES = [
    "cozy_personal",
    "indie_tool",
    "practical_twist",
]


def group_daily_mine_keywords_by_family_and_role(
    keywords: list[dict] | None = None,
) -> dict[str, dict[str, list[dict]]]:
    grouped = {
        family: {role: [] for role in DAILY_MINE_ROLES}
        for family in DAILY_MINE_FAMILIES
    }
    for keyword in keywords or DAILY_MINE_KEYWORDS:
        grouped[keyword["family"]][keyword["role"]].append(keyword)
    return grouped
```

Update `validate_daily_mine_keyword_source()`:

```python
if set(keyword) != {"slug", "label", "role", "family"}:
    raise RuntimeError(f"Invalid keyword shape: {keyword}")
if keyword["family"] not in DAILY_MINE_FAMILIES:
    raise RuntimeError(f"Invalid Daily Mine family: {keyword['family']}")
```

Then validate every `(family, role)` bucket has at least 8 items.

**Step 4: Replace the keyword pool**

Replace `DAILY_MINE_KEYWORDS` with a family-tagged curated pool. Use Appendix A as the exact starting source. Keep labels English. Keep tags internal only.

Important editing rules:

- Do not keep `tiny note`, `printable sheet`, `packing board`, `three saved items max`, `waiting anxiety`, or `safety anxiety`.
- Keep `packing stress` only in `practical_twist` if needed, because it is a real-life tension rather than a product shape.
- Keep `old photo` in multiple roles only when slugs are unique.
- Prefer digital shapes: `browser side panel`, `mobile check-in`, `timeline strip`, `lock-screen glance`.

**Step 5: Update seed rows and stale keyword handling**

In `backend/scripts/seed_daily_mine_keywords.py`, add `family` to `build_keyword_rows()`:

```python
"family": keyword["family"],
```

Add:

```python
def find_stale_daily_mine_slugs(
    existing_rows: list[dict],
    source_keywords: list[dict],
) -> list[str]:
    source_slugs = {keyword["slug"] for keyword in source_keywords}
    return sorted(
        row["slug"]
        for row in existing_rows
        if row.get("slug") not in source_slugs
    )
```

Update `main()` so removed Daily Mine rows are deactivated before upsert:

```python
existing = (
    supabase.table("keywords")
    .select("slug")
    .eq("keyword_set", DAILY_MINE_KEYWORD_SET)
    .execute()
).data

for slug in find_stale_daily_mine_slugs(existing, DAILY_MINE_KEYWORDS):
    supabase.table("keywords").update({"is_active": False}).eq("slug", slug).execute()
```

Then keep the existing upsert.

**Step 6: Run keyword tests**

Run:

```bash
cd backend
python -m pytest tests/test_daily_mine_keywords.py tests/test_seed_daily_mine_keywords.py -q
```

Expected: PASS.

**Step 7: Commit**

```bash
git add backend/app/services/daily_mine_keywords.py backend/scripts/seed_daily_mine_keywords.py backend/tests/test_daily_mine_keywords.py backend/tests/test_seed_daily_mine_keywords.py
git commit -m "feat: add daily mine keyword families"
```

---

## Task 3: Generate One Daily Vein Per Family

**Files:**
- Modify: `backend/app/services/vein_service.py`
- Modify: `backend/app/services/ore_service.py`
- Modify: `backend/tests/test_vein_service_daily_mine.py`
- Modify: `backend/tests/test_ore_service.py`
- Modify: `backend/tests/test_ore_openapi.py` if OpenAPI snapshots assert fields indirectly

**Step 1: Write failing Vein service tests**

Update `backend/tests/test_vein_service_daily_mine.py`:

```python
from app.services.daily_mine_keywords import DAILY_MINE_FAMILIES, DAILY_MINE_ROLES
from app.services.vein_service import (
    build_daily_mine_family_vein_keyword_ids,
    build_daily_mine_vein_specs,
)


def _keyword(family: str, role: str, index: int = 1) -> dict:
    return {
        "id": f"{family}-{role}-{index}",
        "label": f"{family} {role} {index}",
        "family": family,
        "role": role,
    }


def test_build_daily_mine_family_vein_keyword_ids_selects_one_keyword_per_role():
    grouped = {
        family: {
            role: [_keyword(family, role)]
            for role in DAILY_MINE_ROLES
        }
        for family in DAILY_MINE_FAMILIES
    }

    ids = build_daily_mine_family_vein_keyword_ids(
        grouped,
        "indie_tool",
        random.Random(1),
    )

    assert ids == [
        f"indie_tool-{role}-1"
        for role in DAILY_MINE_ROLES
    ]


def test_build_daily_mine_vein_specs_returns_one_spec_per_family():
    grouped = {
        family: {
            role: [_keyword(family, role)]
            for role in DAILY_MINE_ROLES
        }
        for family in DAILY_MINE_FAMILIES
    }

    specs = build_daily_mine_vein_specs(grouped, random.Random(1))

    assert [spec["family"] for spec in specs] == DAILY_MINE_FAMILIES
    assert [spec["slot_index"] for spec in specs] == [1, 2, 3]
    assert all(len(spec["keyword_ids"]) == 5 for spec in specs)
```

Update `backend/tests/test_ore_service.py`:

```python
def test_format_ore_veins_hides_family_metadata():
    result = format_ore_veins(
        [
            {
                "id": "vein-1",
                "slot_index": 1,
                "family": "cozy_personal",
                "is_selected": False,
                "keywords": KEYWORDS,
            }
        ],
        mined_vein_ids=set(),
    )

    assert "family" not in result[0]
    assert result[0]["keywords"][0] == {"id": "kw-cat", "label": "cat"}
```

**Step 2: Run tests to verify they fail**

Run:

```bash
cd backend
python -m pytest tests/test_vein_service_daily_mine.py tests/test_ore_service.py::test_format_ore_veins_hides_family_metadata -q
```

Expected: FAIL because family-aware Vein helpers do not exist yet.

**Step 3: Add family-aware Vein helpers**

In `backend/app/services/vein_service.py`, import:

```python
from app.services.daily_mine_keywords import (
    DAILY_MINE_FAMILIES,
    DAILY_MINE_KEYWORD_SET,
    DAILY_MINE_ROLES,
)
```

Add:

```python
def build_daily_mine_family_vein_keyword_ids(
    keywords_by_family_role: dict[str, dict[str, list[dict]]],
    family: str,
    rng=random,
) -> list[str]:
    keywords_by_role = keywords_by_family_role.get(family, {})
    missing_roles = [
        role for role in DAILY_MINE_ROLES
        if not keywords_by_role.get(role)
    ]
    if missing_roles:
        raise RuntimeError(
            f"Cannot create {family} Daily Mine Vein; missing roles: "
            + ", ".join(missing_roles)
        )

    selected_keywords = []
    selected_labels: set[str] = set()
    for role in DAILY_MINE_ROLES:
        candidates = keywords_by_role[role]
        non_duplicate_candidates = [
            keyword for keyword in candidates
            if str(keyword.get("label", keyword["id"])).strip().lower() not in selected_labels
        ]
        chosen = rng.choice(non_duplicate_candidates or candidates)
        selected_keywords.append(chosen)
        selected_labels.add(str(chosen.get("label", chosen["id"])).strip().lower())

    return [keyword["id"] for keyword in selected_keywords]


def build_daily_mine_vein_specs(
    keywords_by_family_role: dict[str, dict[str, list[dict]]],
    rng=random,
) -> list[dict]:
    return [
        {
            "slot_index": index,
            "family": family,
            "keyword_ids": build_daily_mine_family_vein_keyword_ids(
                keywords_by_family_role,
                family,
                rng,
            ),
        }
        for index, family in enumerate(DAILY_MINE_FAMILIES, start=1)
    ]
```

**Step 4: Use family specs when creating Veins**

Change `_create_veins()` so Daily Mine uses specs:

```python
if keyword_set == DAILY_MINE_KEYWORD_SET:
    vein_specs = _build_daily_mine_vein_specs(supabase)
else:
    vein_specs = [
        {"slot_index": index, "family": None, "keyword_ids": keyword_ids}
        for index, keyword_ids in enumerate(_build_legacy_vein_keyword_sets(supabase, tier), start=1)
    ]

for spec in vein_specs:
    vein = supabase.table("veins").insert(
        {
            "user_id": user_id,
            "date": today,
            "slot_index": spec["slot_index"],
            "keyword_ids": spec["keyword_ids"],
            "keyword_set": keyword_set,
            "family": spec["family"],
            "rarity": pick_rarity(is_season=is_season),
            "is_active": True,
        }
    )
```

Change `_build_daily_mine_vein_keyword_sets()` into `_build_daily_mine_vein_specs()`:

```python
def _build_daily_mine_vein_specs(supabase: Client) -> list[dict]:
    all_keywords = (
        supabase.table("keywords")
        .select("id, slug, category, subtype, role, family, keyword_set, label, is_premium")
        .eq("is_active", True)
        .eq("keyword_set", DAILY_MINE_KEYWORD_SET)
        .execute()
    ).data

    keywords_by_family_role = {
        family: {role_name: [] for role_name in DAILY_MINE_ROLES}
        for family in DAILY_MINE_FAMILIES
    }
    for keyword in all_keywords:
        family = keyword.get("family")
        role_name = keyword.get("role")
        if family in keywords_by_family_role and role_name in keywords_by_family_role[family]:
            keywords_by_family_role[family][role_name].append(keyword)

    return build_daily_mine_vein_specs(keywords_by_family_role, random)
```

**Step 5: Avoid reusing old family-less Daily Mine Veins**

Add helper:

```python
def _has_expected_daily_mine_families(veins: list[dict]) -> bool:
    return [vein.get("family") for vein in sorted(veins, key=lambda item: item["slot_index"])] == DAILY_MINE_FAMILIES
```

In `get_or_create_today_veins()`:

```python
if existing.data and len(existing.data) == 3:
    if keyword_set != DAILY_MINE_KEYWORD_SET or _has_expected_daily_mine_families(existing.data):
        return existing.data
    supabase.table("veins").update({"is_active": False}).eq("user_id", user_id).eq("date", today).eq("keyword_set", keyword_set).eq("is_active", True).execute()
```

This prevents today's old mixed Veins from staying active after deploy.

**Step 6: Include family in internal selects only**

Update selects in `resolve_vein_keywords()` and `ore_service.get_keywords_for_vein()`:

```python
.select("id, slug, category, subtype, role, family, keyword_set, label, is_premium")
```

Do not add `family` to `OreDailyVeinOut`, `OreVisibleKeyword`, `OreVeinOut`, or any frontend-facing response.

**Step 7: Run tests**

Run:

```bash
cd backend
python -m pytest tests/test_vein_service_daily_mine.py tests/test_ore_service.py tests/test_ore_openapi.py -q
```

Expected: PASS.

**Step 8: Commit**

```bash
git add backend/app/services/vein_service.py backend/app/services/ore_service.py backend/tests/test_vein_service_daily_mine.py backend/tests/test_ore_service.py backend/tests/test_ore_openapi.py
git commit -m "feat: generate daily veins by family"
```

---

## Task 4: Make Ore Discovery Family-Weighted

**Files:**
- Modify: `backend/app/prompts/ore_discovery.py`
- Modify: `backend/app/services/ore_service.py`
- Modify: `backend/tests/test_ore_prompt.py`
- Modify: `backend/tests/test_ore_service.py`
- Modify: `backend/app/models/llm_schemas.py` only if adding a new structured field; otherwise leave unchanged

**Step 1: Write failing prompt tests**

Update `backend/tests/test_ore_prompt.py`:

```python
def test_ore_discovery_prompt_uses_family_weighted_distribution():
    system_prompt, user_prompt = build_ore_discovery_prompt(
        SAMPLE_KEYWORDS,
        vein_family="indie_tool",
    )

    assert "Selected hidden Vein family: Indie Tool" in system_prompt
    assert "sort_order 1-6: ore_lane must be Indie Tool" in system_prompt
    assert "sort_order 7: adjacent-family variation" in system_prompt
    assert "sort_order 8: adjacent-family variation" in system_prompt
    assert "sort_order 9: opposite-family twist" in system_prompt
    assert "sort_order 10: ore_lane must be Weird Bridge" in system_prompt
    assert "family" not in user_prompt.lower()
```

Add a pure lane-plan test:

```python
from app.prompts.ore_discovery import build_ore_discovery_lane_plan


def test_build_ore_discovery_lane_plan_weights_selected_family():
    assert build_ore_discovery_lane_plan("practical_twist").count("Practical Twist") == 6
    assert build_ore_discovery_lane_plan("practical_twist")[-1] == "Weird Bridge"
```

**Step 2: Run prompt tests to verify they fail**

Run:

```bash
cd backend
python -m pytest tests/test_ore_prompt.py -q
```

Expected: FAIL because prompt builder does not accept `vein_family`.

**Step 3: Add dynamic lane planning**

In `backend/app/prompts/ore_discovery.py`, replace the fixed `ORE_DISCOVERY_LANE_PLAN` usage with:

```python
FAMILY_DISPLAY_NAMES = {
    "cozy_personal": "Cozy Personal",
    "indie_tool": "Indie Tool",
    "practical_twist": "Practical Twist",
}

FAMILY_VARIATION_ORDER = {
    "cozy_personal": ["Indie Tool", "Practical Twist", "Practical Twist"],
    "indie_tool": ["Practical Twist", "Cozy Personal", "Cozy Personal"],
    "practical_twist": ["Indie Tool", "Cozy Personal", "Cozy Personal"],
}


def build_ore_discovery_lane_plan(vein_family: str | None) -> list[str]:
    if vein_family not in FAMILY_DISPLAY_NAMES:
        return [
            lane
            for lane, count in ORE_DISCOVERY_LANE_PLAN
            for _ in range(count)
        ]

    core = FAMILY_DISPLAY_NAMES[vein_family]
    return [core] * 6 + FAMILY_VARIATION_ORDER[vein_family] + ["Weird Bridge"]
```

Keep `ORE_DISCOVERY_LANE_PLAN` and `ORE_DISCOVERY_LANE_BY_SORT_ORDER` as the fallback plan for compatibility.

Change the prompt function signature:

```python
def build_ore_discovery_prompt(
    keywords: list[dict],
    vein_family: str | None = None,
) -> tuple[str, str]:
```

Build lane lines from the dynamic plan:

```python
lane_plan = build_ore_discovery_lane_plan(vein_family)
selected_family_label = FAMILY_DISPLAY_NAMES.get(vein_family, "Mixed Daily Mine")
```

Add hidden system instructions:

```text
Selected hidden Vein family: {selected_family_label}

Family-weighted distribution:
- sort_order 1-6: ore_lane must be {selected_family_label}
- sort_order 7: adjacent-family variation; ore_lane must be {lane_plan[6]}
- sort_order 8: adjacent-family variation; ore_lane must be {lane_plan[7]}
- sort_order 9: opposite-family twist; ore_lane must be {lane_plan[8]}
- sort_order 10: ore_lane must be Weird Bridge
```

Do not include family in the user prompt.

**Step 4: Write failing validation tests**

In `backend/tests/test_ore_service.py`:

```python
def test_validate_discovered_ores_enforces_family_weighted_lane_plan():
    ores = [
        _ore(index, ore_lane="Wrong Lane")
        for index in range(1, 11)
    ]

    normalized = validate_discovered_ores(
        ores,
        keywords=KEYWORDS,
        vein_family="cozy_personal",
    )

    assert [ore["ore_lane"] for ore in normalized[:6]] == ["Cozy Personal"] * 6
    assert normalized[9]["ore_lane"] == "Weird Bridge"
```

**Step 5: Update validation and discovery calls**

In `backend/app/services/ore_service.py`:

- Import `build_ore_discovery_lane_plan`.
- Change `validate_discovered_ores()` signature:

```python
def validate_discovered_ores(
    ores: list[dict],
    keywords: list[dict] | None = None,
    vein_family: str | None = None,
) -> list[dict]:
```

- Replace `ORE_DISCOVERY_LANE_BY_SORT_ORDER` with:

```python
expected_lanes = build_ore_discovery_lane_plan(vein_family)
expected_lane = expected_lanes[index - 1]
ore["ore_lane"] = expected_lane
```

- In `discover_ores()`, pass:

```python
vein_family = vein.get("family")
system_prompt, user_prompt = build_ore_discovery_prompt(keywords, vein_family=vein_family)
...
result.data = validate_discovered_ores(
    result.data,
    keywords=keywords,
    vein_family=vein_family,
)
```

- Update retry prompt text from "one per lens and lane" to "the selected family-weighted lane plan".

**Step 6: Store Vein family in hidden generation metadata**

In `build_idea_ore_rows()`, either add an optional `vein_family` argument or enrich rows after validation. Preferred:

```python
def build_idea_ore_rows(
    user_id: str,
    vein_id: str,
    keywords: list[dict],
    ores: list[dict],
    vein_family: str | None = None,
) -> list[dict]:
```

Add to `generation_meta`:

```python
"vein_family": vein_family,
```

Do not expose it in public responses.

**Step 7: Run prompt and Ore service tests**

Run:

```bash
cd backend
python -m pytest tests/test_ore_prompt.py tests/test_ore_service.py -q
```

Expected: PASS.

**Step 8: Commit**

```bash
git add backend/app/prompts/ore_discovery.py backend/app/services/ore_service.py backend/tests/test_ore_prompt.py backend/tests/test_ore_service.py backend/app/models/llm_schemas.py
git commit -m "feat: weight ore discovery by vein family"
```

---

## Task 5: Update Docs And Evaluation Script

**Files:**
- Modify: `docs/Idea-Mine-V3-Daily-Mine-Keyword-Taxonomy.md`
- Modify: `docs/Idea-Mine-V3-Idea-Ore-MVP.md`
- Modify: `docs/current-content-schema.md`
- Modify: `backend/scripts/test_ore_taxonomy_prompt.py`
- Modify: `backend/tests/test_ore_taxonomy_prompt_script.py`

**Step 1: Update docs**

Record:

- Daily Mine always shows three server-provided Veins.
- The three Veins are internally one `cozy_personal`, one `indie_tool`, and one `practical_twist`.
- Keyword roles and families are hidden from users.
- A selected Vein produces 10 Ores using 6 family-core, 2 adjacent-family, 1 opposite-family, and 1 weird bridge slots.
- Old long flow remains future expansion.

**Step 2: Update taxonomy prompt experiment**

Change `TEST_VEINS` so each test Vein includes:

```python
"family": "cozy_personal"
```

Update `build_taxonomy_prompt()` to call the same family-weighted distribution logic or mirror it. The test script should now evaluate one Vein per family, not the old equal 3 / 3 / 3 / 1 plan.

**Step 3: Write/update tests**

In `backend/tests/test_ore_taxonomy_prompt_script.py`, assert:

```python
assert [vein["family"] for vein in TEST_VEINS] == [
    "cozy_personal",
    "indie_tool",
    "practical_twist",
]
assert "sort_order 1-6" in system_prompt
```

**Step 4: Run docs-adjacent tests**

Run:

```bash
cd backend
python -m pytest tests/test_ore_taxonomy_prompt_script.py -q
```

Expected: PASS.

**Step 5: Commit**

```bash
git add docs/Idea-Mine-V3-Daily-Mine-Keyword-Taxonomy.md docs/Idea-Mine-V3-Idea-Ore-MVP.md docs/current-content-schema.md backend/scripts/test_ore_taxonomy_prompt.py backend/tests/test_ore_taxonomy_prompt_script.py
git commit -m "docs: document daily mine family flow"
```

---

## Task 6: Run Full Backend Verification

**Files:**
- No file edits unless tests reveal failures.

**Step 1: Run targeted Daily Mine tests**

Run:

```bash
cd backend
python -m pytest \
  tests/test_daily_mine_keywords.py \
  tests/test_seed_daily_mine_keywords.py \
  tests/test_vein_service_daily_mine.py \
  tests/test_ore_prompt.py \
  tests/test_ore_service.py \
  tests/test_ore_openapi.py \
  tests/test_ore_taxonomy_prompt_script.py \
  -q
```

Expected: PASS.

**Step 2: Run backend tests excluding external schema DB if needed**

Run:

```bash
cd backend
python -m pytest -q
```

Expected: PASS. If `SCHEMA_TEST_DB_URL` is not configured, run the non-schema subset separately and note it.

**Step 3: Commit fixes if required**

If any tests needed fixes:

```bash
git add <changed-files>
git commit -m "test: stabilize daily mine family flow"
```

---

## Task 7: Apply Migration And Reseed Supabase

**Files:**
- No source edits unless deployment reveals a contract issue.

**Step 1: Apply the migration**

Use the existing Supabase migration workflow for this repo. If applying manually in Supabase SQL editor, run the contents of:

```text
supabase/migrations/00021_daily_mine_keyword_families.sql
```

Expected:

- `public.keywords.family` exists.
- `public.veins.family` exists.
- Family check constraints exist.
- `idx_keywords_daily_mine_family_role_active` exists.

**Step 2: Reseed Daily Mine keywords**

Run:

```bash
cd backend
python scripts/seed_daily_mine_keywords.py
```

Expected:

- New family-tagged keywords are upserted.
- Removed/stale Daily Mine V3 keywords are set to `is_active = false`.
- Active Daily Mine keywords have `keyword_set = 'daily_mine_v3'`.
- Active Daily Mine keywords have `family in ('cozy_personal', 'indie_tool', 'practical_twist')`.

**Step 3: Verify DB counts**

Run a SQL check in Supabase:

```sql
select family, role, count(*)
from public.keywords
where keyword_set = 'daily_mine_v3'
  and is_active = true
group by family, role
order by family, role;
```

Expected:

- 15 rows: 3 families x 5 roles.
- Every count is at least 8.

**Step 4: Reset today's old active Daily Mine Veins if needed**

The code should deactivate family-less active Veins automatically on next `/ore/veins/today` call. If the production state is confusing during manual testing, run:

```sql
update public.veins
set is_active = false
where keyword_set = 'daily_mine_v3'
  and is_active = true
  and family is null;
```

Only do this for Daily Mine V3 rows.

---

## Task 8: Live Quality Check

**Files:**
- Usually none. If prompt issues appear, edit `backend/app/prompts/ore_discovery.py` and tests.

**Step 1: Get today's Veins**

Call:

```http
GET /ore/veins/today
```

Expected public response:

- Exactly 3 Veins.
- Each Vein has 5 keyword labels.
- No `family`, `role`, `category`, or `subtype` is visible.

Internal DB expectation:

- Slot 1: `cozy_personal`
- Slot 2: `indie_tool`
- Slot 3: `practical_twist`

**Step 2: Mine one Vein from each family**

Call:

```http
POST /ore/discover
{"vein_id": "<vein id>"}
```

Expected:

- Exactly 10 Ores.
- Ores are short, not reports.
- At least six Ores clearly match the selected family.
- At least two or three Ores feel worth saving to Vault.
- No hardware-first or physical-kit MVPs.

**Step 3: Inspect hidden metadata in DB**

SQL:

```sql
select sort_order, title, generation_meta
from public.idea_ores
where vein_id = '<vein id>'
order by sort_order;
```

Expected:

- `generation_meta->>'vein_family'` matches the selected Vein family.
- Sort orders 1-6 use the family-core lane.
- Sort order 10 uses Weird Bridge.

---

## Appendix A: Curated Starting Keyword Pool

Use this as the first implementation source. Slugs should be lowercase kebab-case and unique. Labels are public-facing; roles and families are internal.

### Cozy Personal

Subject:

- cat
- dream journaler
- old photo
- bedside table
- houseplant
- book collector
- quiet overthinker
- home corner
- favorite mug
- forgotten notebook

Material:

- dream fragment
- voice snippet
- old photo
- mood color
- postcard
- tiny memory
- saved sentence
- window light
- symbolic object
- sleep log

Tension:

- fear of forgetting
- memory fading
- loneliness
- unfinished feeling
- private worry
- decision residue
- nostalgia
- quiet restlessness
- hard to name
- small avoidance

Shape:

- mood card
- private archive
- memory capsule
- daily deck
- symbol cards
- ritual tracker
- photo capsule
- voice inbox
- local-first vault
- lock-screen glance

Ritual / Constraint:

- before sleep
- one saved moment per day
- only at night
- one question at a time
- no public sharing
- after taking a photo
- three-minute check-in
- offline-first
- private by default
- save only favorites

### Indie Tool

Subject:

- browser tab
- download folder
- desktop clutter
- clipboard
- empty inbox
- unread manual
- unfinished project
- late-night coder
- first-time creator
- tiny desk

Material:

- downloaded file
- screenshot
- bookmark
- PDF stack
- email thread
- clipboard text
- terminal command
- saved link
- calendar block
- error message

Tension:

- lost context
- messy backlog
- unread pressure
- hard to start
- hard to stop
- time blindness
- not knowing what matters
- decision fatigue
- context switching
- tab overload

Shape:

- browser side panel
- desktop tray app
- command palette
- new tab page
- file inbox
- sorting tray
- mini calendar
- tiny widget
- local shortcut
- one-page workbench

Ritual / Constraint:

- when opening a new tab
- when closing the laptop
- keyboard only
- two-minute sort
- one folder only
- single-screen only
- works without internet
- no account needed
- local only
- before the tab closes

### Practical Twist

Subject:

- solo traveler
- new city walker
- commuter
- working parent
- shared housemate
- small apartment
- empty fridge
- medicine cabinet
- lost item
- appointment calendar

Material:

- receipt
- grocery list
- medicine label
- map pin
- train ticket
- bank alert
- warranty card
- route line
- QR code
- family group chat

Tension:

- last-minute doubt
- schedule drift
- forgetfulness
- repeating mistakes
- awkward follow-up
- private uncertainty
- safety check
- where did this go
- low energy
- packing stress

Shape:

- mobile check-in
- receipt vault
- route memory
- checklist card
- timeline strip
- map layer
- calm checklist
- decision card
- notification digest
- shared home panel

Ritual / Constraint:

- before leaving home
- on the way home
- after a receipt scan
- morning preview
- evening recap
- under 60 seconds
- camera first
- voice first
- no typing
- only when asked
