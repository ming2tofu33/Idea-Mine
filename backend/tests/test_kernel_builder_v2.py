from app.services.ideation_v2.kernel import build_kernel_set
from app.services.ideation_v2.types import NormalizedSeed


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
    assert kernel_set.primary_kernel.primary_tension == "night noise"
    assert kernel_set.primary_kernel.primary_outcome == "better sleep"
    assert kernel_set.primary_kernel.primary_environment == "at home"
    assert kernel_set.primary_kernel.text == (
        "A dog owner wants better sleep by addressing night noise in at home"
    )
    assert kernel_set.primary_kernel.primary_actor == "dog owner"
    assert kernel_set.alternate_kernel is None


def test_build_kernel_set_uses_deterministic_fallback_when_environment_is_missing():
    seed = NormalizedSeed(
        actors=["dog owner"],
        tensions=["night noise"],
        outcomes=["better sleep"],
        environments=[],
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
    assert kernel_set.primary_kernel.primary_environment is None
    assert kernel_set.primary_kernel.text == (
        "A dog owner wants better sleep by addressing night noise"
    )
