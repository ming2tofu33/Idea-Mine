from app.services.ideation_v2.branch_plan import build_branch_plan
from app.services.ideation_v2.family_scoring import FamilyScore


def test_build_branch_plan_uses_bounded_hybrid_distribution():
    scores = {
        "workflow_utility": FamilyScore(
            family="workflow_utility",
            score=0.9,
            reasons=["strong browser-fit"],
        ),
        "assistant_copilot": FamilyScore(
            family="assistant_copilot",
            score=0.7,
            reasons=["adjacent assisted flow"],
        ),
        "workspace_studio": FamilyScore(
            family="workspace_studio",
            score=0.5,
            reasons=["drafting workspace fit"],
        ),
        "dashboard_ops": FamilyScore(
            family="dashboard_ops",
            score=0.2,
            reasons=["operational surface"],
        ),
        "agent_automation": FamilyScore(
            family="agent_automation",
            score=0.1,
            reasons=["automation angle"],
        ),
        "platform_network": FamilyScore(
            family="platform_network",
            score=0.05,
            reasons=["weak network fit"],
        ),
        "real_world_companion": FamilyScore(
            family="real_world_companion",
            score=0.02,
            reasons=["minimal physical tie"],
        ),
    }

    plan = build_branch_plan(
        scores=scores,
        seed_strength_label="balanced",
        user_tier="free",
        ai_keyword_present=False,
    )

    assert plan.primary_family == "workflow_utility"
    assert plan.secondary_family == "assistant_copilot"
    assert plan.contrast_family == "dashboard_ops"
    assert plan.slot_distribution == {"primary": 5, "secondary": 3, "contrast": 2}
    assert "browser_extension" in plan.primary_allowed_subfamilies
    assert "side_panel" in plan.secondary_allowed_subfamilies
    assert "operator_console" in plan.contrast_allowed_subfamilies
    assert plan.ai_variant_budget == 0


def test_build_branch_plan_adjusts_distribution_for_premium_seed_density():
    scores = {
        "assistant_copilot": FamilyScore(
            family="assistant_copilot",
            score=0.86,
            reasons=["direct assisted interaction"],
        ),
        "workflow_utility": FamilyScore(
            family="workflow_utility",
            score=0.72,
            reasons=["adjacent fast utility"],
        ),
        "agent_automation": FamilyScore(
            family="agent_automation",
            score=0.51,
            reasons=["strong automation path"],
        ),
        "workspace_studio": FamilyScore(
            family="workspace_studio",
            score=0.41,
            reasons=["draft surface"],
        ),
        "dashboard_ops": FamilyScore(
            family="dashboard_ops",
            score=0.27,
            reasons=["ops angle"],
        ),
        "platform_network": FamilyScore(
            family="platform_network",
            score=0.14,
            reasons=["network fit"],
        ),
        "real_world_companion": FamilyScore(
            family="real_world_companion",
            score=0.03,
            reasons=["weak physical context"],
        ),
    }

    plan = build_branch_plan(
        scores=scores,
        seed_strength_label="dense",
        user_tier="premium",
        ai_keyword_present=True,
    )

    assert plan.primary_family == "assistant_copilot"
    assert plan.secondary_family == "workflow_utility"
    assert plan.contrast_family == "dashboard_ops"
    assert plan.slot_distribution == {"primary": 4, "secondary": 4, "contrast": 2}
    assert plan.ai_variant_budget == 1
    assert plan.branching_confidence in {"high", "medium"}
