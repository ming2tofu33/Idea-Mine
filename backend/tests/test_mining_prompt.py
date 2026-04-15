from app.prompts.mining import build_mining_prompt


SAMPLE_COMBOS = [
    {
        "tier_type": "stable",
        "sort_order": 1,
        "keywords": [
            {"slug": "solo-founder", "category": "who", "label": "solo founder"},
            {"slug": "mobile-app", "category": "tech", "label": "mobile app"},
            {"slug": "voice-ai", "category": "ai", "label": "voice AI"},
            {"slug": "fitness", "category": "domain", "label": "fitness"},
            {"slug": "subscription", "category": "money", "label": "subscription"},
        ],
    }
]


def test_build_mining_prompt_treats_money_as_background_context():
    system_prompt, _ = build_mining_prompt(SAMPLE_COMBOS)

    assert "MONEY should almost never be the main hook of the idea." in system_prompt
    assert "Do not build the title around monetization words" in system_prompt


def test_build_mining_prompt_prevents_default_api_marketplace_pivots():
    _, user_prompt = build_mining_prompt(SAMPLE_COMBOS)

    assert "Do NOT default to API, marketplace, or subscription pivot" in user_prompt


def test_build_mining_prompt_splits_hook_from_expanded_explanation():
    system_prompt, _ = build_mining_prompt(SAMPLE_COMBOS)

    assert "The one-line idea is the hook, not the full explanation." in system_prompt
    assert "Use the summary as the expanded explanation of the product idea." in system_prompt
    assert "enough specificity for a user to decide whether the idea is worth opening" in system_prompt
