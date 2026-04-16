from app.services.ideation_v2.family_scoring import score_families
from app.services.ideation_v2.kernel import KernelSet, KernelCandidate
from app.services.ideation_v2.types import NormalizedSeed


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
    assert set(scores) == {
        "workflow_utility",
        "workspace_studio",
        "dashboard_ops",
        "assistant_copilot",
        "agent_automation",
        "platform_network",
        "real_world_companion",
    }
    assert scores["real_world_companion"].score > scores["platform_network"].score
    assert scores["real_world_companion"].reasons
