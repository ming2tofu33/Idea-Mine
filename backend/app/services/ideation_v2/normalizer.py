from app.services.ideation_v2.keyword_catalog import resolve_keyword_metadata
from app.services.ideation_v2.types import NormalizedSeed


def normalize_keywords(selected_keywords: list[dict]) -> NormalizedSeed:
    actors: list[str] = []
    tensions: list[str] = []
    outcomes: list[str] = []
    environments: list[str] = []
    surface_hints: list[str] = []
    mechanism_hints: list[str] = []
    premium_modifiers: list[str] = []

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
