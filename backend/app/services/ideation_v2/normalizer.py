from app.services.ideation_v2.keyword_catalog import resolve_keyword_metadata
from app.services.ideation_v2.types import KeywordSignal, NormalizedSeed


CORE_BUCKET_COUNT = 4
THIN_THRESHOLD = 0.6
DENSE_THRESHOLD = 0.9
CATEGORY_ROLE_FALLBACKS = {
    "who": "actor",
    "value": "outcome",
    "tech": "mechanism_hint",
    "ai": "premium_modifier",
    "domain": "environment",
}


def _seed_strength_label(strength_score: float) -> str:
    if strength_score < THIN_THRESHOLD:
        return "thin"
    if strength_score <= DENSE_THRESHOLD:
        return "balanced"
    return "dense"


def normalize_keywords(selected_keywords: list[dict]) -> NormalizedSeed:
    actors: list[str] = []
    tensions: list[str] = []
    outcomes: list[str] = []
    environments: list[str] = []
    surface_hints: list[str] = []
    mechanism_hints: list[str] = []
    premium_modifiers: list[str] = []
    unresolved_keywords: list[KeywordSignal] = []

    for item in selected_keywords:
        meta = resolve_keyword_metadata(item["label"], item["source"], item["premium_only"])
        role = meta.primary_role or CATEGORY_ROLE_FALLBACKS.get(item.get("category"))

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
        else:
            unresolved_keywords.append(KeywordSignal(keyword=item["label"], context=item.get("source")))

    strength_score = min(
        1.0,
        (len(actors) + len(tensions) + len(outcomes) + len(environments)) / CORE_BUCKET_COUNT,
    )
    strength_label = _seed_strength_label(strength_score)

    return NormalizedSeed(
        actors=actors,
        tensions=tensions,
        outcomes=outcomes,
        environments=environments,
        surface_hints=surface_hints,
        mechanism_hints=mechanism_hints,
        premium_modifiers=premium_modifiers,
        ambiguous_keywords=[],
        unresolved_keywords=unresolved_keywords,
        role_confidence_map={},
        seed_strength_score=strength_score,
        seed_strength_label=strength_label,
        physical_world_relevance=0.0,
    )
