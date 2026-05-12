from app.prompts.ore_discovery import ORE_DISCOVERY_LENSES, build_ore_discovery_prompt
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

    assert "sort_order 1-3: ore_lane must be Cozy Personal" in system_prompt
    assert "sort_order 4-6: ore_lane must be Indie Tool" in system_prompt
    assert "sort_order 7-9: ore_lane must be Practical Twist" in system_prompt
    assert "sort_order 10: ore_lane must be Weird Bridge" in system_prompt
    assert "Each ore must actively use exactly 3 or 4 keywords" in system_prompt
    assert "active_keywords must contain exact keyword labels only" in system_prompt
    assert "Do not mention non-active Vein keyword labels" in system_prompt
    assert "Do not force all 5 Vein keywords into every ore" in system_prompt
    assert "cat (Subject)" in user_prompt
    assert "only at night (Ritual / Constraint)" in user_prompt


def test_ore_projectize_prompt_keeps_the_brief_faithful_and_mvp_scoped():
    system_prompt, user_prompt = build_ore_projectize_prompt(SAMPLE_ORE)

    assert "Stay faithful to the selected ore" in system_prompt
    assert "Do not turn it into a different product" in system_prompt
    assert "not_to_build" in system_prompt
    assert "vibe_coding_prompt" in system_prompt

    assert "Cat Dream Archive" in user_prompt
    assert "fortune telling" in user_prompt
    assert "dream input -> cat interpretation card -> dream archive" in user_prompt
