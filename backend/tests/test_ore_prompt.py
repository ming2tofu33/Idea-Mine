from app.prompts.ore_discovery import (
    ORE_DISCOVERY_LANE_BY_SORT_ORDER,
    ORE_DISCOVERY_LENSES,
    build_ore_discovery_lane_plan,
    build_ore_discovery_prompt,
)
from app.prompts.ore_projectize import build_ore_projectize_prompt


SAMPLE_KEYWORDS = [
    {"id": "kw-cat", "label": "cat", "category": "daily_mine", "role": "Subject"},
    {"id": "kw-dream", "label": "dream fragment", "category": "daily_mine", "role": "Material"},
    {
        "id": "kw-archive",
        "label": "loneliness",
        "category": "daily_mine",
        "role": "Tension",
    },
    {
        "id": "kw-symbol",
        "label": "card archive",
        "category": "daily_mine",
        "role": "Shape",
    },
    {
        "id": "kw-night",
        "label": "only at night",
        "category": "daily_mine",
        "role": "Ritual / Constraint",
    },
]


SAMPLE_ORE = {
    "title": "Cat Dream Archive",
    "one_liner": (
        "A cozy app where a cat interpreter turns your dreams into symbolic "
        "cards you can collect."
    ),
    "short_summary": (
        "A dream journaling app turns each entry into a symbolic cat card. "
        "The archive becomes a soft record of recurring emotions."
    ),
    "interesting_point": (
        "Dream journaling, cat characters, and symbolic collection naturally "
        "reinforce each other."
    ),
    "project_fit": (
        "This can become a small MVP with only dream input, interpretation "
        "cards, and an archive."
    ),
    "risk": (
        "If it leans too hard into fortune telling, it may become another "
        "generic horoscope app."
    ),
    "mvp_hint": "Start with dream input -> cat interpretation card -> dream archive.",
    "selected_keywords": SAMPLE_KEYWORDS,
    "sort_order": 1,
    "is_vaulted": False,
}


def test_ore_discovery_prompt_keeps_outputs_short_and_projectable():
    system_prompt, user_prompt = build_ore_discovery_prompt(SAMPLE_KEYWORDS)

    assert "Generate exactly 10 Idea Ores" in system_prompt
    assert "Idea Ores, not finished startup plans" in system_prompt
    assert "Do not produce market-size claims" in system_prompt
    assert "Do not generate long reports" in system_prompt
    assert "software-first" in system_prompt
    assert "Do not propose hardware-first MVPs" in system_prompt
    assert "this might be worth building" in system_prompt
    assert "good idea generator" not in system_prompt.lower()

    assert "cat" in user_prompt
    assert "dream fragment" in user_prompt
    assert "only at night" in user_prompt
    assert "(domain)" not in user_prompt
    assert "(daily_mine)" not in user_prompt


def test_ore_discovery_prompt_uses_hidden_diversity_lenses():
    system_prompt, user_prompt = build_ore_discovery_prompt(SAMPLE_KEYWORDS)

    for lens in ORE_DISCOVERY_LENSES:
        assert lens in system_prompt

    for field in (
        "generation_lens",
        "ore_lane",
        "active_keywords",
        "primary_anchor_keyword",
        "product_form",
        "core_loop_signature",
        "novelty_axis",
    ):
        assert field in system_prompt

    assert "internal only" in system_prompt
    assert "do not expose" in system_prompt.lower()
    assert "Daily Vein keywords" in user_prompt


def test_ore_discovery_prompt_uses_lane_distribution_and_active_keyword_subsets():
    system_prompt, user_prompt = build_ore_discovery_prompt(SAMPLE_KEYWORDS)

    for index, lane in enumerate(ORE_DISCOVERY_LANE_BY_SORT_ORDER, start=1):
        assert f"sort_order {index}: ore_lane must be {lane}" in system_prompt
    assert "Each ore must actively use exactly 3 or 4 keywords" in system_prompt
    assert "active_keywords must contain exact keyword labels only" in system_prompt
    assert "Do not mention non-active Vein keyword labels" in system_prompt
    assert "Do not force all 5 Vein keywords into every ore" in system_prompt
    assert "cat (Subject)" in user_prompt
    assert "only at night (Ritual / Constraint)" in user_prompt


def test_ore_discovery_prompt_limits_anchor_overuse_and_generic_product_forms():
    system_prompt, _ = build_ore_discovery_prompt(SAMPLE_KEYWORDS)

    assert "No single keyword label may appear in active_keywords for all 10 ores" in system_prompt
    assert "primary_anchor_keyword may use the same keyword label at most 4 times" in system_prompt
    assert "Avoid exact generic product_form values" in system_prompt
    assert "mobile app" in system_prompt
    assert "web app" in system_prompt
    assert "If active_keywords would exceed 4 labels, rewrite the public text" in system_prompt


def test_ore_discovery_lane_plan_weights_the_selected_family():
    lane_plan = build_ore_discovery_lane_plan("practical_twist")

    assert len(lane_plan) == 10
    assert lane_plan.count("Practical Twist") == 6
    assert lane_plan.count("Cozy Personal") == 1
    assert lane_plan.count("Indie Tool") == 2
    assert lane_plan[-1] == "Weird Bridge"


def test_ore_discovery_lane_plan_keeps_fallback_distribution_for_unknown_family():
    assert build_ore_discovery_lane_plan(None) == ORE_DISCOVERY_LANE_BY_SORT_ORDER
    assert build_ore_discovery_lane_plan("unknown") == ORE_DISCOVERY_LANE_BY_SORT_ORDER


def test_ore_discovery_prompt_includes_hidden_family_weighted_lane_mapping():
    system_prompt, user_prompt = build_ore_discovery_prompt(
        SAMPLE_KEYWORDS,
        vein_family="practical_twist",
    )

    expected_lanes = [
        "Practical Twist",
        "Practical Twist",
        "Practical Twist",
        "Practical Twist",
        "Practical Twist",
        "Practical Twist",
        "Indie Tool",
        "Indie Tool",
        "Cozy Personal",
        "Weird Bridge",
    ]

    assert "Selected hidden Vein family: Practical Twist" in system_prompt
    assert "family-weighted lane distribution" in system_prompt
    for index, lane in enumerate(expected_lanes, start=1):
        assert f"sort_order {index}: ore_lane must be {lane}" in system_prompt
    assert "Practical Twist" not in user_prompt
    assert "vein_family" not in user_prompt


def test_ore_projectize_prompt_keeps_the_brief_faithful_and_mvp_scoped():
    system_prompt, user_prompt = build_ore_projectize_prompt(SAMPLE_ORE)

    assert "Stay faithful to the selected ore" in system_prompt
    assert "Do not turn it into a different product" in system_prompt
    assert "not_to_build" in system_prompt
    assert "vibe_coding_prompt" in system_prompt

    assert "Cat Dream Archive" in user_prompt
    assert "fortune telling" in user_prompt
    assert "dream input -> cat interpretation card -> dream archive" in user_prompt
