from app.prompts.mining import build_mining_prompt


SAMPLE_COMBOS = [
    {
        "tier_type": "stable",
        "sort_order": 1,
        "keywords": [
            {"slug": "solo-founder", "category": "who", "ko": "1인 창업자", "en": "solo founder"},
            {"slug": "mobile-app", "category": "tech", "ko": "모바일 앱", "en": "mobile app"},
            {"slug": "voice-ai", "category": "ai", "ko": "음성 AI", "en": "voice AI"},
            {"slug": "fitness", "category": "domain", "ko": "피트니스", "en": "fitness"},
            {"slug": "subscription", "category": "money", "ko": "구독", "en": "subscription"},
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
