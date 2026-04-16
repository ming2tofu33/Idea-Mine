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
SUBTYPE_ROLE_FALLBACKS = {
    ("who", "demographic"): "actor",
    ("who", "household"): "actor",
    ("who", "life-stage"): "actor",
    ("who", "lifestyle"): "actor",
    ("who", "role"): "actor",
    ("domain", "ecosystem"): "environment",
    ("domain", "function"): "environment",
    ("domain", "industry"): "environment",
    ("tech", "delivery"): "surface_hint",
    ("tech", "interface"): "surface_hint",
    ("tech", "platform"): "surface_hint",
    ("tech", "product-form"): "surface_hint",
    ("value", "efficiency"): "outcome",
    ("value", "emotional"): "outcome",
    ("value", "engagement"): "outcome",
    ("value", "growth"): "outcome",
    ("value", "trust"): "outcome",
    ("value", "wellbeing"): "outcome",
    ("ai", "agent"): "premium_modifier",
    ("ai", "generation"): "premium_modifier",
    ("ai", "modality"): "premium_modifier",
    ("ai", "optimization"): "premium_modifier",
    ("ai", "prediction"): "premium_modifier",
    ("ai", "retrieval"): "premium_modifier",
}
IGNORED_CATEGORIES = {"money"}


def _seed_strength_label(strength_score: float) -> str:
    if strength_score < THIN_THRESHOLD:
        return "thin"
    if strength_score <= DENSE_THRESHOLD:
        return "balanced"
    return "dense"


def _fallback_role(item: dict) -> str | None:
    category = item.get("category")
    subtype = item.get("subtype")
    if category in IGNORED_CATEGORIES:
        return None
    return SUBTYPE_ROLE_FALLBACKS.get((category, subtype)) or CATEGORY_ROLE_FALLBACKS.get(
        category
    )


def infer_keyword_role(item: dict) -> str | None:
    meta = resolve_keyword_metadata(item["label"], item["source"], item["premium_only"])
    return meta.primary_role or _fallback_role(item)


def normalize_keywords(selected_keywords: list[dict]) -> NormalizedSeed:
    actors: list[str] = []
    tensions: list[str] = []
    outcomes: list[str] = []
    environments: list[str] = []
    surface_hints: list[str] = []
    mechanism_hints: list[str] = []
    premium_modifiers: list[str] = []
    family_biases: list[str] = []
    unresolved_keywords: list[KeywordSignal] = []

    for item in selected_keywords:
        meta = resolve_keyword_metadata(item["label"], item["source"], item["premium_only"])
        role = meta.primary_role or _fallback_role(item)
        family_biases.extend(meta.family_bias)

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
        elif item.get("category") in IGNORED_CATEGORIES:
            continue
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
        family_biases=family_biases,
        ambiguous_keywords=[],
        unresolved_keywords=unresolved_keywords,
        role_confidence_map={},
        seed_strength_score=strength_score,
        seed_strength_label=strength_label,
        physical_world_relevance=0.0,
    )
