from app.services.ideation_v2.types import KeywordSignal, NormalizedSeed, BranchPlan


def test_normalized_seed_and_branch_plan_have_expected_fields():
    seed = NormalizedSeed(
        actors=["solo creator"],
        tensions=["scattered research"],
        outcomes=["usable first draft"],
        environments=["while browsing"],
        surface_hints=["browser-based"],
        mechanism_hints=["automation"],
        premium_modifiers=[],
        ambiguous_keywords=[{"keyword": "scattered research"}],
        unresolved_keywords=[{"keyword": "browser-based", "context": None}],
        role_confidence_map={"actor": 0.9},
        seed_strength_score=0.72,
        seed_strength_label="balanced",
        physical_world_relevance=0.1,
    )

    plan = BranchPlan(
        primary_family="workflow_utility",
        secondary_family="assistant_copilot",
        slot_distribution={"primary": 5, "secondary": 3, "contrast": 2},
        primary_allowed_subfamilies=["browser_extension"],
        secondary_allowed_subfamilies=["sidecar_assistant"],
        contrast_allowed_subfamilies=["drafting_workspace"],
        contrast_family=None,
        ai_variant_budget=0,
        branching_confidence="high",
    )

    assert seed.seed_strength_label == "balanced"
    assert plan.slot_distribution["primary"] == 5
    assert plan.contrast_family is None
    assert seed.ambiguous_keywords[0].keyword == "scattered research"
    assert isinstance(seed.unresolved_keywords[0], KeywordSignal)
    assert seed.unresolved_keywords[0].keyword == "browser-based"
    assert seed.unresolved_keywords[0].context is None
