from app.services.ideation_v2.family_graph import (
    get_adjacent_families,
    get_allowed_subfamilies,
    get_far_families,
)
from app.services.ideation_v2.family_scoring import FamilyScore
from app.services.ideation_v2.types import BranchPlan


def _pick_highest_scoring_family(
    scores: dict[str, FamilyScore],
    allowed: set[str],
    excluded: set[str] | None = None,
) -> str | None:
    excluded = excluded or set()
    ordered = sorted(scores.values(), key=lambda item: item.score, reverse=True)
    for item in ordered:
        if item.family in allowed and item.family not in excluded:
            return item.family
    return None


def _resolve_slot_distribution(
    seed_strength_label: str,
    user_tier: str,
    has_contrast: bool,
) -> dict[str, int]:
    if user_tier == "premium":
        if seed_strength_label == "thin":
            return {"primary": 6, "secondary": 3, "contrast": 1} if has_contrast else {
                "primary": 7,
                "secondary": 3,
                "contrast": 0,
            }
        if seed_strength_label == "dense":
            return {"primary": 4, "secondary": 4, "contrast": 2} if has_contrast else {
                "primary": 5,
                "secondary": 5,
                "contrast": 0,
            }
    return {"primary": 5, "secondary": 3, "contrast": 2} if has_contrast else {
        "primary": 7,
        "secondary": 3,
        "contrast": 0,
    }


def _branching_confidence(ordered_scores: list[FamilyScore]) -> str:
    primary_score = ordered_scores[0].score
    secondary_score = ordered_scores[1].score if len(ordered_scores) > 1 else 0.0
    gap = primary_score - secondary_score

    if primary_score >= 0.8 and gap >= 0.1:
        return "high"
    if primary_score >= 0.55:
        return "medium"
    return "low"


def build_branch_plan(
    scores: dict[str, FamilyScore],
    seed_strength_label: str,
    user_tier: str,
    ai_keyword_present: bool,
) -> BranchPlan:
    ordered = sorted(scores.values(), key=lambda item: item.score, reverse=True)
    if not ordered:
        raise ValueError("branch plan requires at least one family score")

    primary = ordered[0].family
    secondary = _pick_highest_scoring_family(
        scores=scores,
        allowed=get_adjacent_families(primary),
    )
    if secondary is None:
        secondary = ordered[1].family if len(ordered) > 1 else primary

    contrast = _pick_highest_scoring_family(
        scores=scores,
        allowed=get_far_families(primary),
        excluded={secondary},
    )

    distribution = _resolve_slot_distribution(
        seed_strength_label=seed_strength_label,
        user_tier=user_tier,
        has_contrast=contrast is not None,
    )

    return BranchPlan(
        primary_family=primary,
        secondary_family=secondary,
        contrast_family=contrast,
        slot_distribution=distribution,
        primary_allowed_subfamilies=get_allowed_subfamilies(primary),
        secondary_allowed_subfamilies=get_allowed_subfamilies(secondary),
        contrast_allowed_subfamilies=get_allowed_subfamilies(contrast) if contrast else [],
        ai_variant_budget=1 if user_tier == "premium" and ai_keyword_present else 0,
        branching_confidence=_branching_confidence(ordered),
    )
