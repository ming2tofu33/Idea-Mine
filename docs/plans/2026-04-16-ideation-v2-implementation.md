# Ideation V2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a sidecar `mining + overview` V2 engine that keeps keyword-first UX while replacing direct keyword-to-copy generation with normalized-seed, kernel, and bounded-branching logic.

**Architecture:** Add a new `ideation_v2` service layer under `backend/app/services` and route `mining` and `overview` through it behind an explicit runtime switch. V2 should preserve the current public response contract while changing internal generation logic to use normalized seed roles, family scoring, and bounded hybrid branch planning.

**Tech Stack:** FastAPI, Pydantic, Supabase, OpenAI structured outputs, pytest

---

### Task 1: Add V2 runtime types

**Files:**
- Create: `C:\Users\amy\Desktop\Idea Mine\backend\app\services\ideation_v2\__init__.py`
- Create: `C:\Users\amy\Desktop\Idea Mine\backend\app\services\ideation_v2\types.py`
- Test: `C:\Users\amy\Desktop\Idea Mine\backend\tests\test_ideation_v2_types.py`

**Step 1: Write the failing test**

```python
from backend.app.services.ideation_v2.types import NormalizedSeed, BranchPlan


def test_normalized_seed_and_branch_plan_have_expected_fields():
    seed = NormalizedSeed(
        actors=["solo creator"],
        tensions=["scattered research"],
        outcomes=["usable first draft"],
        environments=["while browsing"],
        surface_hints=["browser-based"],
        mechanism_hints=["automation"],
        premium_modifiers=[],
        ambiguous_keywords=[],
        unresolved_keywords=[],
        role_confidence_map={"actor": 0.9},
        seed_strength_score=0.72,
        seed_strength_label="balanced",
        physical_world_relevance=0.1,
    )

    plan = BranchPlan(
        primary_family="workflow_utility",
        secondary_family="assistant_copilot",
        contrast_family="workspace_studio",
        slot_distribution={"primary": 5, "secondary": 3, "contrast": 2},
        primary_allowed_subfamilies=["browser_extension"],
        secondary_allowed_subfamilies=["sidecar_assistant"],
        contrast_allowed_subfamilies=["drafting_workspace"],
        ai_variant_budget=0,
        branching_confidence="high",
    )

    assert seed.seed_strength_label == "balanced"
    assert plan.slot_distribution["primary"] == 5
```

**Step 2: Run test to verify it fails**

Run: `cd C:\Users\amy\Desktop\Idea Mine && $env:PYTHONPATH='backend'; pytest backend/tests/test_ideation_v2_types.py -v`

Expected: FAIL with import or model errors because the V2 types do not exist yet.

**Step 3: Write minimal implementation**

```python
from pydantic import BaseModel


class NormalizedSeed(BaseModel):
    actors: list[str]
    tensions: list[str]
    outcomes: list[str]
    environments: list[str]
    surface_hints: list[str]
    mechanism_hints: list[str]
    premium_modifiers: list[str]
    ambiguous_keywords: list[dict]
    unresolved_keywords: list[dict]
    role_confidence_map: dict[str, float]
    seed_strength_score: float
    seed_strength_label: str
    physical_world_relevance: float


class BranchPlan(BaseModel):
    primary_family: str
    secondary_family: str
    contrast_family: str | None
    slot_distribution: dict[str, int]
    primary_allowed_subfamilies: list[str]
    secondary_allowed_subfamilies: list[str]
    contrast_allowed_subfamilies: list[str]
    ai_variant_budget: int
    branching_confidence: str
```

**Step 4: Run test to verify it passes**

Run: `cd C:\Users\amy\Desktop\Idea Mine && $env:PYTHONPATH='backend'; pytest backend/tests/test_ideation_v2_types.py -v`

Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/services/ideation_v2/__init__.py backend/app/services/ideation_v2/types.py backend/tests/test_ideation_v2_types.py
git commit -m "feat: add ideation v2 runtime types"
```

### Task 2: Add keyword catalog metadata model

**Files:**
- Create: `C:\Users\amy\Desktop\Idea Mine\backend\app\services\ideation_v2\keyword_catalog.py`
- Test: `C:\Users\amy\Desktop\Idea Mine\backend\tests\test_keyword_catalog_v2.py`

**Step 1: Write the failing test**

```python
from backend.app.services.ideation_v2.keyword_catalog import resolve_keyword_metadata


def test_resolve_keyword_metadata_returns_role_and_bias():
    meta = resolve_keyword_metadata("smart home", source="system", premium_only=False)
    assert meta.primary_role == "mechanism_hint"
    assert "real_world_companion" in meta.family_bias
```

**Step 2: Run test to verify it fails**

Run: `cd C:\Users\amy\Desktop\Idea Mine && $env:PYTHONPATH='backend'; pytest backend/tests/test_keyword_catalog_v2.py -v`

Expected: FAIL because the resolver does not exist yet.

**Step 3: Write minimal implementation**

```python
from pydantic import BaseModel


class KeywordMetadata(BaseModel):
    label: str
    primary_role: str | None
    secondary_roles: list[str]
    family_bias: list[str]
    premium_only: bool


CATALOG = {
    "smart home": KeywordMetadata(
        label="smart home",
        primary_role="mechanism_hint",
        secondary_roles=["environment"],
        family_bias=["real_world_companion", "dashboard_ops"],
        premium_only=False,
    ),
}


def resolve_keyword_metadata(label: str, source: str, premium_only: bool) -> KeywordMetadata:
    return CATALOG.get(
        label,
        KeywordMetadata(
            label=label,
            primary_role=None,
            secondary_roles=[],
            family_bias=[],
            premium_only=premium_only,
        ),
    )
```

**Step 4: Run test to verify it passes**

Run: `cd C:\Users\amy\Desktop\Idea Mine && $env:PYTHONPATH='backend'; pytest backend/tests/test_keyword_catalog_v2.py -v`

Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/services/ideation_v2/keyword_catalog.py backend/tests/test_keyword_catalog_v2.py
git commit -m "feat: add ideation v2 keyword metadata catalog"
```

### Task 3: Implement seed normalizer

**Files:**
- Create: `C:\Users\amy\Desktop\Idea Mine\backend\app\services\ideation_v2\normalizer.py`
- Test: `C:\Users\amy\Desktop\Idea Mine\backend\tests\test_seed_normalizer_v2.py`

**Step 1: Write the failing test**

```python
from backend.app.services.ideation_v2.normalizer import normalize_keywords


def test_normalize_keywords_builds_balanced_seed():
    seed = normalize_keywords(
        [
            {"label": "solo creator", "source": "system", "premium_only": False},
            {"label": "scattered research", "source": "system", "premium_only": False},
            {"label": "usable first draft", "source": "system", "premium_only": False},
            {"label": "while browsing", "source": "system", "premium_only": False},
            {"label": "browser-based", "source": "system", "premium_only": False},
        ]
    )
    assert seed.actors == ["solo creator"]
    assert seed.tensions == ["scattered research"]
    assert seed.seed_strength_label == "balanced"
```

**Step 2: Run test to verify it fails**

Run: `cd C:\Users\amy\Desktop\Idea Mine && $env:PYTHONPATH='backend'; pytest backend/tests/test_seed_normalizer_v2.py -v`

Expected: FAIL because the normalizer does not exist yet.

**Step 3: Write minimal implementation**

```python
from backend.app.services.ideation_v2.keyword_catalog import resolve_keyword_metadata
from backend.app.services.ideation_v2.types import NormalizedSeed


def normalize_keywords(selected_keywords: list[dict]) -> NormalizedSeed:
    actors, tensions, outcomes, environments = [], [], [], []
    surface_hints, mechanism_hints, premium_modifiers = [], [], []

    for item in selected_keywords:
        meta = resolve_keyword_metadata(item["label"], item["source"], item["premium_only"])
        role = meta.primary_role
        if role == "actor":
            actors.append(item["label"])
        elif role == "tension":
            tensions.append(item["label"])
        elif role == "outcome":
            outcomes.append(item["label"])
        elif role == "environment":
            environments.append(item["label"])
        elif role == "surface_hint":
            surface_hints.append(item["label"])
        elif role == "mechanism_hint":
            mechanism_hints.append(item["label"])
        elif role == "premium_modifier":
            premium_modifiers.append(item["label"])

    strength_score = min(1.0, (len(actors) + len(tensions) + len(outcomes) + len(environments)) / 4)
    strength_label = "balanced" if 0.6 <= strength_score <= 0.9 else ("thin" if strength_score < 0.6 else "dense")

    return NormalizedSeed(
        actors=actors,
        tensions=tensions,
        outcomes=outcomes,
        environments=environments,
        surface_hints=surface_hints,
        mechanism_hints=mechanism_hints,
        premium_modifiers=premium_modifiers,
        ambiguous_keywords=[],
        unresolved_keywords=[],
        role_confidence_map={},
        seed_strength_score=strength_score,
        seed_strength_label=strength_label,
        physical_world_relevance=0.0,
    )
```

**Step 4: Run test to verify it passes**

Run: `cd C:\Users\amy\Desktop\Idea Mine && $env:PYTHONPATH='backend'; pytest backend/tests/test_seed_normalizer_v2.py -v`

Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/services/ideation_v2/normalizer.py backend/tests/test_seed_normalizer_v2.py
git commit -m "feat: add ideation v2 seed normalizer"
```

### Task 4: Implement kernel builder

**Files:**
- Create: `C:\Users\amy\Desktop\Idea Mine\backend\app\services\ideation_v2\kernel.py`
- Test: `C:\Users\amy\Desktop\Idea Mine\backend\tests\test_kernel_builder_v2.py`

**Step 1: Write the failing test**

```python
from backend.app.services.ideation_v2.kernel import build_kernel_set
from backend.app.services.ideation_v2.types import NormalizedSeed


def test_build_kernel_set_prefers_single_primary_kernel():
    seed = NormalizedSeed(
        actors=["dog owner"],
        tensions=["night noise"],
        outcomes=["better sleep"],
        environments=["at home"],
        surface_hints=[],
        mechanism_hints=["smart home"],
        premium_modifiers=[],
        ambiguous_keywords=[],
        unresolved_keywords=[],
        role_confidence_map={},
        seed_strength_score=0.8,
        seed_strength_label="balanced",
        physical_world_relevance=0.8,
    )

    kernel_set = build_kernel_set(seed)
    assert kernel_set.primary_kernel.primary_actor == "dog owner"
    assert kernel_set.alternate_kernel is None
```

**Step 2: Run test to verify it fails**

Run: `cd C:\Users\amy\Desktop\Idea Mine && $env:PYTHONPATH='backend'; pytest backend/tests/test_kernel_builder_v2.py -v`

Expected: FAIL because the kernel builder does not exist yet.

**Step 3: Write minimal implementation**

```python
from pydantic import BaseModel


class KernelCandidate(BaseModel):
    text: str
    primary_actor: str
    primary_tension: str
    primary_outcome: str
    primary_environment: str | None
    confidence: float


class KernelSet(BaseModel):
    primary_kernel: KernelCandidate
    alternate_kernel: KernelCandidate | None = None


def build_kernel_set(seed) -> KernelSet:
    actor = seed.actors[0] if seed.actors else "user"
    tension = seed.tensions[0] if seed.tensions else "friction"
    outcome = seed.outcomes[0] if seed.outcomes else "better result"
    environment = seed.environments[0] if seed.environments else None
    text = f"A {actor} wants {outcome} by addressing {tension}" + (f" in {environment}" if environment else "")
    primary = KernelCandidate(
        text=text,
        primary_actor=actor,
        primary_tension=tension,
        primary_outcome=outcome,
        primary_environment=environment,
        confidence=0.8,
    )
    return KernelSet(primary_kernel=primary)
```

**Step 4: Run test to verify it passes**

Run: `cd C:\Users\amy\Desktop\Idea Mine && $env:PYTHONPATH='backend'; pytest backend/tests/test_kernel_builder_v2.py -v`

Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/services/ideation_v2/kernel.py backend/tests/test_kernel_builder_v2.py
git commit -m "feat: add ideation v2 kernel builder"
```

### Task 5: Implement family scoring

**Files:**
- Create: `C:\Users\amy\Desktop\Idea Mine\backend\app\services\ideation_v2\family_scoring.py`
- Test: `C:\Users\amy\Desktop\Idea Mine\backend\tests\test_family_scoring_v2.py`

**Step 1: Write the failing test**

```python
from backend.app.services.ideation_v2.family_scoring import score_families
from backend.app.services.ideation_v2.kernel import KernelSet, KernelCandidate
from backend.app.services.ideation_v2.types import NormalizedSeed


def test_score_families_boosts_real_world_companion_for_physical_context():
    seed = NormalizedSeed(
        actors=["dog owner"],
        tensions=["night noise"],
        outcomes=["better sleep"],
        environments=["at home"],
        surface_hints=[],
        mechanism_hints=["smart home"],
        premium_modifiers=[],
        ambiguous_keywords=[],
        unresolved_keywords=[],
        role_confidence_map={},
        seed_strength_score=0.9,
        seed_strength_label="balanced",
        physical_world_relevance=0.85,
    )
    kernel_set = KernelSet(
        primary_kernel=KernelCandidate(
            text="A dog owner wants better sleep by reducing night noise at home.",
            primary_actor="dog owner",
            primary_tension="night noise",
            primary_outcome="better sleep",
            primary_environment="at home",
            confidence=0.88,
        )
    )
    scores = score_families(seed, kernel_set)
    assert scores["real_world_companion"].score > scores["platform_network"].score
```

**Step 2: Run test to verify it fails**

Run: `cd C:\Users\amy\Desktop\Idea Mine && $env:PYTHONPATH='backend'; pytest backend/tests/test_family_scoring_v2.py -v`

Expected: FAIL because the scorer does not exist yet.

**Step 3: Write minimal implementation**

```python
from pydantic import BaseModel


class FamilyScore(BaseModel):
    family: str
    score: float
    reasons: list[str]


FAMILIES = [
    "workflow_utility",
    "workspace_studio",
    "dashboard_ops",
    "assistant_copilot",
    "agent_automation",
    "platform_network",
    "real_world_companion",
]


def score_families(seed, kernel_set) -> dict[str, FamilyScore]:
    raw = {family: 0.0 for family in FAMILIES}
    if seed.physical_world_relevance > 0.5:
        raw["real_world_companion"] += 1.0
        raw["dashboard_ops"] += 0.3
    if "while browsing" in seed.environments:
        raw["workflow_utility"] += 0.8
        raw["assistant_copilot"] += 0.4
    if seed.outcomes:
        raw["workspace_studio"] += 0.2

    max_score = max(raw.values()) or 1.0
    return {
        family: FamilyScore(family=family, score=score / max_score, reasons=[])
        for family, score in raw.items()
    }
```

**Step 4: Run test to verify it passes**

Run: `cd C:\Users\amy\Desktop\Idea Mine && $env:PYTHONPATH='backend'; pytest backend/tests/test_family_scoring_v2.py -v`

Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/services/ideation_v2/family_scoring.py backend/tests/test_family_scoring_v2.py
git commit -m "feat: add ideation v2 family scoring"
```

### Task 6: Implement family graph and branch plan builder

**Files:**
- Create: `C:\Users\amy\Desktop\Idea Mine\backend\app\services\ideation_v2\family_graph.py`
- Create: `C:\Users\amy\Desktop\Idea Mine\backend\app\services\ideation_v2\branch_plan.py`
- Test: `C:\Users\amy\Desktop\Idea Mine\backend\tests\test_branch_plan_v2.py`

**Step 1: Write the failing test**

```python
from backend.app.services.ideation_v2.branch_plan import build_branch_plan
from backend.app.services.ideation_v2.family_scoring import FamilyScore


def test_build_branch_plan_uses_bounded_hybrid_distribution():
    scores = {
        "workflow_utility": FamilyScore(family="workflow_utility", score=0.9, reasons=[]),
        "assistant_copilot": FamilyScore(family="assistant_copilot", score=0.7, reasons=[]),
        "workspace_studio": FamilyScore(family="workspace_studio", score=0.5, reasons=[]),
        "dashboard_ops": FamilyScore(family="dashboard_ops", score=0.2, reasons=[]),
        "agent_automation": FamilyScore(family="agent_automation", score=0.1, reasons=[]),
        "platform_network": FamilyScore(family="platform_network", score=0.05, reasons=[]),
        "real_world_companion": FamilyScore(family="real_world_companion", score=0.02, reasons=[]),
    }
    plan = build_branch_plan(
        scores=scores,
        seed_strength_label="balanced",
        user_tier="free",
        ai_keyword_present=False,
    )
    assert plan.primary_family == "workflow_utility"
    assert plan.secondary_family == "assistant_copilot"
    assert plan.slot_distribution == {"primary": 5, "secondary": 3, "contrast": 2}
```

**Step 2: Run test to verify it fails**

Run: `cd C:\Users\amy\Desktop\Idea Mine && $env:PYTHONPATH='backend'; pytest backend/tests/test_branch_plan_v2.py -v`

Expected: FAIL because the plan builder does not exist yet.

**Step 3: Write minimal implementation**

```python
from backend.app.services.ideation_v2.types import BranchPlan


ADJACENT = {
    "workflow_utility": {"assistant_copilot", "workspace_studio"},
    "assistant_copilot": {"workflow_utility", "workspace_studio", "agent_automation"},
}

FAR = {
    "workflow_utility": {"dashboard_ops", "agent_automation", "platform_network"},
}


def build_branch_plan(scores, seed_strength_label: str, user_tier: str, ai_keyword_present: bool) -> BranchPlan:
    ordered = sorted(scores.values(), key=lambda item: item.score, reverse=True)
    primary = ordered[0].family
    secondary = next(
        (item.family for item in ordered[1:] if item.family in ADJACENT.get(primary, set())),
        ordered[1].family,
    )
    contrast = next(
        (item.family for item in ordered[1:] if item.family in FAR.get(primary, set()) and item.score >= 0.3),
        None,
    )

    distribution = {"primary": 5, "secondary": 3, "contrast": 2}
    if user_tier == "premium" and seed_strength_label == "thin":
        distribution = {"primary": 6, "secondary": 3, "contrast": 1}
    elif user_tier == "premium" and seed_strength_label == "dense":
        distribution = {"primary": 4, "secondary": 4, "contrast": 2}
    elif contrast is None:
        distribution = {"primary": 7, "secondary": 3, "contrast": 0}

    ai_budget = 0
    if user_tier == "premium" and ai_keyword_present:
        ai_budget = 1

    return BranchPlan(
        primary_family=primary,
        secondary_family=secondary,
        contrast_family=contrast,
        slot_distribution=distribution,
        primary_allowed_subfamilies=[],
        secondary_allowed_subfamilies=[],
        contrast_allowed_subfamilies=[],
        ai_variant_budget=ai_budget,
        branching_confidence="high" if scores[primary].score >= 0.75 else "medium",
    )
```

**Step 4: Run test to verify it passes**

Run: `cd C:\Users\amy\Desktop\Idea Mine && $env:PYTHONPATH='backend'; pytest backend/tests/test_branch_plan_v2.py -v`

Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/services/ideation_v2/family_graph.py backend/app/services/ideation_v2/branch_plan.py backend/tests/test_branch_plan_v2.py
git commit -m "feat: add ideation v2 branch planning"
```

### Task 7: Build mining V2 orchestrator

**Files:**
- Create: `C:\Users\amy\Desktop\Idea Mine\backend\app\services\ideation_v2\mining.py`
- Modify: `C:\Users\amy\Desktop\Idea Mine\backend\app\services\idea_service.py`
- Test: `C:\Users\amy\Desktop\Idea Mine\backend\tests\test_mining_v2_orchestrator.py`
- Test: `C:\Users\amy\Desktop\Idea Mine\backend\tests\test_mining_eval.py`

**Step 1: Write the failing test**

```python
from backend.app.services.ideation_v2.mining import build_v2_mining_context


def test_build_v2_mining_context_returns_normalized_seed_and_branch_plan():
    context = build_v2_mining_context(
        [
            {"label": "solo creator", "source": "system", "premium_only": False},
            {"label": "scattered research", "source": "system", "premium_only": False},
            {"label": "usable first draft", "source": "system", "premium_only": False},
            {"label": "while browsing", "source": "system", "premium_only": False},
            {"label": "browser-based", "source": "system", "premium_only": False},
        ],
        user_tier="free",
    )
    assert context.branch_plan.primary_family == "workflow_utility"
```

**Step 2: Run test to verify it fails**

Run: `cd C:\Users\amy\Desktop\Idea Mine && $env:PYTHONPATH='backend'; pytest backend/tests/test_mining_v2_orchestrator.py -v`

Expected: FAIL because the orchestrator does not exist yet.

**Step 3: Write minimal implementation**

```python
from pydantic import BaseModel
from backend.app.services.ideation_v2.normalizer import normalize_keywords
from backend.app.services.ideation_v2.kernel import build_kernel_set
from backend.app.services.ideation_v2.family_scoring import score_families
from backend.app.services.ideation_v2.branch_plan import build_branch_plan


class MiningV2Context(BaseModel):
    normalized_seed: object
    kernel_set: object
    family_scores: dict
    branch_plan: object


def build_v2_mining_context(selected_keywords: list[dict], user_tier: str) -> MiningV2Context:
    normalized_seed = normalize_keywords(selected_keywords)
    kernel_set = build_kernel_set(normalized_seed)
    family_scores = score_families(normalized_seed, kernel_set)
    branch_plan = build_branch_plan(
        scores=family_scores,
        seed_strength_label=normalized_seed.seed_strength_label,
        user_tier=user_tier,
        ai_keyword_present=bool(normalized_seed.premium_modifiers),
    )
    return MiningV2Context(
        normalized_seed=normalized_seed,
        kernel_set=kernel_set,
        family_scores=family_scores,
        branch_plan=branch_plan,
    )
```

**Step 4: Run test to verify it passes**

Run: `cd C:\Users\amy\Desktop\Idea Mine && $env:PYTHONPATH='backend'; pytest backend/tests/test_mining_v2_orchestrator.py -v`

Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/services/ideation_v2/mining.py backend/app/services/idea_service.py backend/tests/test_mining_v2_orchestrator.py
git commit -m "feat: add ideation v2 mining orchestrator"
```

### Task 8: Build overview V2 input builder

**Files:**
- Create: `C:\Users\amy\Desktop\Idea Mine\backend\app\services\ideation_v2\overview.py`
- Modify: `C:\Users\amy\Desktop\Idea Mine\backend\app\services\overview_service.py`
- Test: `C:\Users\amy\Desktop\Idea Mine\backend\tests\test_overview_v2_builder.py`

**Step 1: Write the failing test**

```python
from backend.app.services.ideation_v2.overview import build_v2_overview_input


def test_build_v2_overview_input_anchors_to_kernel_and_family():
    selected_idea = {
        "title": "Research Draft Sidecar",
        "idea_line": "Turn scattered browsing fragments into a usable draft before momentum dies.",
        "summary": "A browser-adjacent tool for solo creators.",
        "v2_kernel": {
            "text": "A solo creator wants a usable first draft from scattered browsing fragments.",
            "primary_actor": "solo creator",
            "primary_tension": "scattered browsing fragments",
            "primary_outcome": "usable first draft",
            "primary_environment": "while browsing",
        },
        "v2_family": "workflow_utility",
    }

    payload = build_v2_overview_input(selected_idea)
    assert payload["family"] == "workflow_utility"
    assert "primary_tension" in payload["kernel"]
```

**Step 2: Run test to verify it fails**

Run: `cd C:\Users\amy\Desktop\Idea Mine && $env:PYTHONPATH='backend'; pytest backend/tests/test_overview_v2_builder.py -v`

Expected: FAIL because the builder does not exist yet.

**Step 3: Write minimal implementation**

```python
def build_v2_overview_input(selected_idea: dict) -> dict:
    return {
        "title": selected_idea["title"],
        "idea_line": selected_idea["idea_line"],
        "summary": selected_idea["summary"],
        "kernel": selected_idea["v2_kernel"],
        "family": selected_idea["v2_family"],
    }
```

**Step 4: Run test to verify it passes**

Run: `cd C:\Users\amy\Desktop\Idea Mine && $env:PYTHONPATH='backend'; pytest backend/tests/test_overview_v2_builder.py -v`

Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/services/ideation_v2/overview.py backend/app/services/overview_service.py backend/tests/test_overview_v2_builder.py
git commit -m "feat: add ideation v2 overview builder"
```

### Task 9: Add runtime switch and preserve public contracts

**Files:**
- Modify: `C:\Users\amy\Desktop\Idea Mine\backend\app\config.py`
- Modify: `C:\Users\amy\Desktop\Idea Mine\backend\app\services\idea_service.py`
- Modify: `C:\Users\amy\Desktop\Idea Mine\backend\app\services\overview_service.py`
- Test: `C:\Users\amy\Desktop\Idea Mine\backend\tests\test_v2_runtime_switch.py`

**Step 1: Write the failing test**

```python
from backend.app.config import settings


def test_v2_runtime_switch_defaults_off():
    assert settings.ideation_v2_enabled is False
```

**Step 2: Run test to verify it fails**

Run: `cd C:\Users\amy\Desktop\Idea Mine && $env:PYTHONPATH='backend'; pytest backend/tests/test_v2_runtime_switch.py -v`

Expected: FAIL because the setting does not exist yet.

**Step 3: Write minimal implementation**

```python
class Settings(BaseSettings):
    ideation_v2_enabled: bool = False
```

Then in services:

```python
if settings.ideation_v2_enabled:
    # call V2 orchestrator and builder
else:
    # keep current V1 path
```

**Step 4: Run test to verify it passes**

Run: `cd C:\Users\amy\Desktop\Idea Mine && $env:PYTHONPATH='backend'; pytest backend/tests/test_v2_runtime_switch.py -v`

Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/config.py backend/app/services/idea_service.py backend/app/services/overview_service.py backend/tests/test_v2_runtime_switch.py
git commit -m "feat: add ideation v2 runtime switch"
```

### Task 10: Add evaluation coverage and rollout docs

**Files:**
- Modify: `C:\Users\amy\Desktop\Idea Mine\backend\app\evals\mining_eval.py`
- Modify: `C:\Users\amy\Desktop\Idea Mine\backend\tests\test_mining_eval.py`
- Modify: `C:\Users\amy\Desktop\Idea Mine\docs\current-content-schema.md`
- Modify: `C:\Users\amy\Desktop\Idea Mine\docs\plans\2026-04-11-prompt-quality-checklist.md`
- Test: `C:\Users\amy\Desktop\Idea Mine\backend\tests\test_mining_eval.py`

**Step 1: Write the failing test**

```python
def test_mining_eval_reports_surface_family_spread():
    report = run_eval_fixture(...)
    assert "surface_family_spread" in report
```

**Step 2: Run test to verify it fails**

Run: `cd C:\Users\amy\Desktop\Idea Mine && $env:PYTHONPATH='backend'; pytest backend/tests/test_mining_eval.py -v`

Expected: FAIL because V2 spread reporting is not implemented yet.

**Step 3: Write minimal implementation**

```python
report["surface_family_spread"] = {
    "primary_family": branch_plan.primary_family,
    "secondary_family": branch_plan.secondary_family,
    "contrast_family": branch_plan.contrast_family,
}
```

Update docs to describe:

- V2 sidecar architecture
- runtime switch
- quality targets for family spread

**Step 4: Run test to verify it passes**

Run: `cd C:\Users\amy\Desktop\Idea Mine && $env:PYTHONPATH='backend'; pytest backend/tests/test_mining_eval.py -v`

Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/evals/mining_eval.py backend/tests/test_mining_eval.py docs/current-content-schema.md docs/plans/2026-04-11-prompt-quality-checklist.md
git commit -m "chore: document and evaluate ideation v2 rollout"
```

### Task 11: Final verification

**Files:**
- Modify: none
- Test: `C:\Users\amy\Desktop\Idea Mine\backend\tests\test_ideation_v2_types.py`
- Test: `C:\Users\amy\Desktop\Idea Mine\backend\tests\test_keyword_catalog_v2.py`
- Test: `C:\Users\amy\Desktop\Idea Mine\backend\tests\test_seed_normalizer_v2.py`
- Test: `C:\Users\amy\Desktop\Idea Mine\backend\tests\test_kernel_builder_v2.py`
- Test: `C:\Users\amy\Desktop\Idea Mine\backend\tests\test_family_scoring_v2.py`
- Test: `C:\Users\amy\Desktop\Idea Mine\backend\tests\test_branch_plan_v2.py`
- Test: `C:\Users\amy\Desktop\Idea Mine\backend\tests\test_mining_v2_orchestrator.py`
- Test: `C:\Users\amy\Desktop\Idea Mine\backend\tests\test_overview_v2_builder.py`
- Test: `C:\Users\amy\Desktop\Idea Mine\backend\tests\test_v2_runtime_switch.py`
- Test: `C:\Users\amy\Desktop\Idea Mine\backend\tests\test_mining_eval.py`

**Step 1: Run focused V2 test suite**

Run:

```bash
cd C:\Users\amy\Desktop\Idea Mine
$env:PYTHONPATH='backend'
pytest \
  backend/tests/test_ideation_v2_types.py \
  backend/tests/test_keyword_catalog_v2.py \
  backend/tests/test_seed_normalizer_v2.py \
  backend/tests/test_kernel_builder_v2.py \
  backend/tests/test_family_scoring_v2.py \
  backend/tests/test_branch_plan_v2.py \
  backend/tests/test_mining_v2_orchestrator.py \
  backend/tests/test_overview_v2_builder.py \
  backend/tests/test_v2_runtime_switch.py \
  backend/tests/test_mining_eval.py -v
```

Expected: PASS

**Step 2: Run compile check**

Run:

```bash
cd C:\Users\amy\Desktop\Idea Mine
python -m compileall backend/app
```

Expected: PASS

**Step 3: Commit**

```bash
git add .
git commit -m "test: verify ideation v2 vertical slice"
```
