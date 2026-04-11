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


def build_keyword_combos(
    keywords: list[dict],
    has_ai_keyword: bool,
    rng: random.Random | None = None,
) -> list[dict]:
    chooser = rng if rng is not None else random
    ai_kw = None
    non_ai_kws = []

    for kw in keywords:
        if kw["category"] == "ai":
            ai_kw = kw
        else:
            non_ai_kws.append(kw)

    ai_slots_by_tier = _plan_ai_slots(has_ai_keyword and ai_kw is not None, chooser)

    combos = []
    sort_order = 1

    for tier_type, count, min_kw, max_kw in TIER_STRUCTURE:
        ai_slots = ai_slots_by_tier.get(tier_type, set())

        for combo_index in range(count):
            num = chooser.randint(min_kw, max_kw)
            include_ai = combo_index in ai_slots and ai_kw is not None

            if include_ai:
                remaining = min(num - 1, len(non_ai_kws))
                selected = [ai_kw] + chooser.sample(non_ai_kws, remaining)
            elif has_ai_keyword and non_ai_kws:
                selected = chooser.sample(non_ai_kws, min(num, len(non_ai_kws)))
            else:
                selected = chooser.sample(keywords, min(num, len(keywords)))

            chooser.shuffle(selected)

            combos.append({
                "tier_type": tier_type,
                "sort_order": sort_order,
                "keywords": [
                    {
                        "slug": kw["slug"],
                        "category": kw["category"],
                        "ko": kw["ko"],
                        "en": kw["en"],
                    }
                    for kw in selected
                ],
            })
            sort_order += 1

    return combos


def _plan_ai_slots(has_ai_keyword: bool, chooser: random.Random) -> dict[str, set[int]]:
    if not has_ai_keyword:
        return {}

    slots_by_tier: dict[str, set[int]] = {}
    for tier_type, count, _, _ in TIER_STRUCTURE:
        ai_count = min(AI_TIER_EXPOSURE.get(tier_type, 0), count)
        slots_by_tier[tier_type] = set(chooser.sample(range(count), ai_count))
    return slots_by_tier
