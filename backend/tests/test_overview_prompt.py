from app.prompts.overview import build_overview_prompt


def _sample_keywords() -> list[dict]:
    return [
        {"category": "WHO", "en": "Solo Founder"},
        {"category": "TECH", "en": "Mobile app"},
        {"category": "AI", "en": "Voice AI"},
        {"category": "DOMAIN", "en": "Fitness"},
        {"category": "VALUE", "en": "consistent workout starts"},
        {"category": "MONEY", "en": "subscription"},
    ]


def _sample_concept() -> dict:
    return {
        "concept_en": "A mobile app for solo founders that uses Voice AI to deliver consistent workout starts in fitness, monetized via subscription.",
        "concept_ko": "1인 창업가가 운동을 바로 시작할 수 있게 돕는 보이스 AI 피트니스 앱.",
        "product_type": "B2C",
        "primary_user_en": "Solo founders who keep delaying workouts",
        "primary_user_ko": "운동을 계속 미루는 1인 창업가",
        "core_experience_en": "Opens the app, speaks their current energy level, and starts a short routine immediately.",
        "core_experience_ko": "앱을 열고 지금 컨디션을 말하면 바로 짧은 운동 루틴이 시작된다.",
    }


def test_overview_prompt_contains_bilingual_fixed_concept_anchors():
    _, user_prompt = build_overview_prompt(
        title_en="Voice-first fitness coach",
        summary_en="A voice coach that gets solo founders to start short workouts.",
        keywords=_sample_keywords(),
        market_research="Users compare Calm and Nike Training Club pricing.",
        concept=_sample_concept(),
    )

    assert "Concept EN:" in user_prompt
    assert "Concept KO:" in user_prompt
    assert "Primary user EN:" in user_prompt
    assert "Primary user KO:" in user_prompt
    assert "Core experience EN:" in user_prompt
    assert "Core experience KO:" in user_prompt


def test_overview_prompt_separates_korean_and_english_copy_rules():
    _, user_prompt = build_overview_prompt(
        title_en="Voice-first fitness coach",
        summary_en="A voice coach that gets solo founders to start short workouts.",
        keywords=_sample_keywords(),
        market_research="Users compare Calm and Nike Training Club pricing.",
        concept=_sample_concept(),
    )

    assert "For concept_en, copy Concept EN exactly as-is." in user_prompt
    assert "For concept_ko, copy Concept KO exactly as-is." in user_prompt
    assert "Every Korean section must stay in Korean" in user_prompt
    assert "For concept_en and concept_ko, copy the FIXED CONCEPT values exactly as-is." not in user_prompt
