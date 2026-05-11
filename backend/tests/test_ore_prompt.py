from app.prompts.ore_discovery import ORE_DISCOVERY_LENSES, build_ore_discovery_prompt
from app.prompts.ore_projectize import build_ore_projectize_prompt


SAMPLE_KEYWORDS = [
    {"id": "kw-cat", "label": "Cat", "category": "domain"},
    {"id": "kw-dream", "label": "Dream", "category": "mood"},
    {
        "id": "kw-archive",
        "label": "Emotional archive",
        "category": "mechanism",
    },
    {
        "id": "kw-symbol",
        "label": "Symbol interpretation",
        "category": "ai",
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
    assert "this might be worth building" in system_prompt
    assert "good idea generator" not in system_prompt.lower()

    assert "Cat" in user_prompt
    assert "Dream" in user_prompt
    assert "Emotional archive" in user_prompt
    assert "(domain)" not in user_prompt
    assert "(mood)" not in user_prompt
    assert "(mechanism)" not in user_prompt


def test_ore_discovery_prompt_uses_hidden_diversity_lenses():
    system_prompt, user_prompt = build_ore_discovery_prompt(SAMPLE_KEYWORDS)

    for lens in ORE_DISCOVERY_LENSES:
        assert lens in system_prompt

    for field in (
        "generation_lens",
        "primary_anchor_keyword",
        "product_form",
        "core_loop_signature",
        "novelty_axis",
    ):
        assert field in system_prompt

    assert "internal only" in system_prompt
    assert "do not expose" in system_prompt.lower()
    assert "Daily Vein keywords" in user_prompt


def test_ore_projectize_prompt_keeps_the_brief_faithful_and_mvp_scoped():
    system_prompt, user_prompt = build_ore_projectize_prompt(SAMPLE_ORE)

    assert "Stay faithful to the selected ore" in system_prompt
    assert "Do not turn it into a different product" in system_prompt
    assert "not_to_build" in system_prompt
    assert "vibe_coding_prompt" in system_prompt

    assert "Cat Dream Archive" in user_prompt
    assert "fortune telling" in user_prompt
    assert "dream input -> cat interpretation card -> dream archive" in user_prompt
