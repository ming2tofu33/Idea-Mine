import random

from app.services.combo_builder import build_keyword_combos


KEYWORDS_WITH_AI = [
    {"slug": "solo-founder", "category": "who", "label": "solo founder"},
    {"slug": "mobile-app", "category": "tech", "label": "mobile app"},
    {"slug": "voice-ai", "category": "ai", "label": "voice AI"},
    {"slug": "fitness", "category": "domain", "label": "fitness"},
    {"slug": "habit-building", "category": "value", "label": "habit building"},
    {"slug": "subscription", "category": "money", "label": "subscription"},
]


def _has_category(combo: dict, category: str) -> bool:
    return any(keyword["category"] == category for keyword in combo["keywords"])


def test_build_keyword_combos_is_reproducible_with_rng_seed():
    combos_a = build_keyword_combos(
        KEYWORDS_WITH_AI,
        has_ai_keyword=True,
        rng=random.Random(7),
    )
    combos_b = build_keyword_combos(
        KEYWORDS_WITH_AI,
        has_ai_keyword=True,
        rng=random.Random(7),
    )

    assert combos_a == combos_b


def test_build_keyword_combos_with_ai_reserves_non_ai_slots():
    combos = build_keyword_combos(
        KEYWORDS_WITH_AI,
        has_ai_keyword=True,
        rng=random.Random(11),
    )

    combos_without_ai = [combo for combo in combos if not _has_category(combo, "ai")]
    assert len(combos_without_ai) == 4


def test_build_keyword_combos_spreads_ai_across_tiers_instead_of_forcing_every_combo():
    combos = build_keyword_combos(
        KEYWORDS_WITH_AI,
        has_ai_keyword=True,
        rng=random.Random(19),
    )

    ai_counts_by_tier = {}
    for tier in ("stable", "expansion", "pivot", "rare"):
        tier_combos = [combo for combo in combos if combo["tier_type"] == tier]
        ai_counts_by_tier[tier] = sum(1 for combo in tier_combos if _has_category(combo, "ai"))

    assert ai_counts_by_tier == {
        "stable": 2,
        "expansion": 2,
        "pivot": 1,
        "rare": 1,
    }


def test_build_keyword_combos_excludes_money_from_idea_generation_inputs():
    combos = build_keyword_combos(
        KEYWORDS_WITH_AI,
        has_ai_keyword=True,
        rng=random.Random(23),
    )

    assert all(not _has_category(combo, "money") for combo in combos)
