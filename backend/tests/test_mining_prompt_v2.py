from app.prompts.mining_v2 import build_mining_prompt_v2
from app.services.ideation_v2.mining import build_v2_mining_context


def test_build_mining_prompt_v2_uses_active_seed_keywords_and_background_notes():
    selected_keywords = [
        {
            "slug": "solo-traveler",
            "category": "who",
            "subtype": "lifestyle",
            "label": "Solo Traveler",
            "is_premium": False,
        },
        {
            "slug": "wearable",
            "category": "tech",
            "subtype": "product-form",
            "label": "Wearable",
            "is_premium": False,
        },
        {
            "slug": "creator-economy",
            "category": "domain",
            "subtype": "ecosystem",
            "label": "Creator Economy",
            "is_premium": False,
        },
        {
            "slug": "productivity-boost",
            "category": "value",
            "subtype": "efficiency",
            "label": "Productivity Boost",
            "is_premium": False,
        },
        {
            "slug": "freemium",
            "category": "money",
            "subtype": "recurring",
            "label": "Freemium",
            "is_premium": False,
        },
    ]

    context = build_v2_mining_context(selected_keywords, user_tier="free")
    _, user_prompt, slots = build_mining_prompt_v2(selected_keywords, context)

    assert "=== ACTIVE SEED KEYWORDS ===" in user_prompt
    assert "=== BACKGROUND KEYWORDS ===" in user_prompt
    assert "=== SELECTED KEYWORDS ===" not in user_prompt
    assert user_prompt.count("Freemium (MONEY)") == 1
    assert "Freemium (MONEY)" in user_prompt
    assert slots[0]["keywords"] == context.active_keywords
