import random

TIER_STRUCTURE = [
    ("stable", 3, 4, 5),
    ("expansion", 3, 3, 4),
    ("pivot", 2, 3, 4),
    ("rare", 2, 3, 3),
]


def build_keyword_combos(
    keywords: list[dict],
    has_ai_keyword: bool,
) -> list[dict]:
    ai_kw = None
    non_ai_kws = []

    for kw in keywords:
        if kw["category"] == "ai":
            ai_kw = kw
        else:
            non_ai_kws.append(kw)

    combos = []
    sort_order = 1

    for tier_type, count, min_kw, max_kw in TIER_STRUCTURE:
        for _ in range(count):
            num = random.randint(min_kw, max_kw)

            if has_ai_keyword and ai_kw:
                remaining = min(num - 1, len(non_ai_kws))
                selected = [ai_kw] + random.sample(non_ai_kws, remaining)
            else:
                selected = random.sample(keywords, min(num, len(keywords)))

            random.shuffle(selected)

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
