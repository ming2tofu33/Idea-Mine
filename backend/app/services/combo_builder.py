import random

TIER_STRUCTURE = [
    ("stable", 3, 4, 5),
    ("expansion", 3, 3, 4),
    ("pivot", 2, 3, 4),
    ("rare", 2, 3, 3),
]

AI_TIER_EXPOSURE = {
    "stable": 2,
    "expansion": 2,
    "pivot": 1,
    "rare": 1,
}

OPTIONAL_CATEGORY_EXPOSURE = {
    "ai": AI_TIER_EXPOSURE,
}

EXCLUDED_CATEGORIES = {"money"}


def build_keyword_combos(
    keywords: list[dict],
    has_ai_keyword: bool,
    rng: random.Random | None = None,
) -> list[dict]:
    chooser = rng if rng is not None else random
    optional_keywords = {
        kw["category"]: kw
        for kw in keywords
        if kw["category"] in OPTIONAL_CATEGORY_EXPOSURE
    }
    core_keywords = [
        kw
        for kw in keywords
        if kw["category"] not in OPTIONAL_CATEGORY_EXPOSURE
        and kw["category"] not in EXCLUDED_CATEGORIES
    ]

    optional_slots_by_category = _plan_optional_category_slots(
        optional_keywords=optional_keywords,
        has_ai_keyword=has_ai_keyword,
        chooser=chooser,
    )

    combos = []
    sort_order = 1

    for tier_type, count, min_kw, max_kw in TIER_STRUCTURE:
        for combo_index in range(count):
            selected = [
                optional_keywords[category]
                for category, slots_by_tier in optional_slots_by_category.items()
                if combo_index in slots_by_tier.get(tier_type, set())
            ]

            combo_size = _pick_combo_size(
                min_kw=min_kw,
                max_kw=max_kw,
                available_count=len(core_keywords) + len(selected),
                chooser=chooser,
            )

            remaining = combo_size - len(selected)
            if remaining > 0:
                selected.extend(chooser.sample(core_keywords, remaining))

            chooser.shuffle(selected)

            combos.append({
                "tier_type": tier_type,
                "sort_order": sort_order,
                "keywords": [
                    {
                        "slug": kw["slug"],
                        "category": kw["category"],
                        "label": kw["label"],
                    }
                    for kw in selected
                ],
            })
            sort_order += 1

    return combos


def _plan_optional_category_slots(
    optional_keywords: dict[str, dict],
    has_ai_keyword: bool,
    chooser: random.Random,
) -> dict[str, dict[str, set[int]]]:
    slots_by_category: dict[str, dict[str, set[int]]] = {}

    for category, tier_exposure in OPTIONAL_CATEGORY_EXPOSURE.items():
        if category == "ai" and (not has_ai_keyword or category not in optional_keywords):
            continue
        if category not in optional_keywords:
            continue

        slots_by_tier: dict[str, set[int]] = {}
        for tier_type, count, _, _ in TIER_STRUCTURE:
            slot_count = min(tier_exposure.get(tier_type, 0), count)
            slots_by_tier[tier_type] = set(chooser.sample(range(count), slot_count))
        slots_by_category[category] = slots_by_tier

    return slots_by_category


def _pick_combo_size(
    min_kw: int,
    max_kw: int,
    available_count: int,
    chooser: random.Random,
) -> int:
    if available_count <= 0:
        return 0

    upper_bound = min(max_kw, available_count)
    lower_bound = min(min_kw, upper_bound)

    if lower_bound == upper_bound:
        return upper_bound

    return chooser.randint(lower_bound, upper_bound)
