from app.prompts.overview import build_overview_prompt


def _sample_keywords() -> list[dict]:
    return [
        {"category": "WHO", "label": "Solo Founder"},
        {"category": "TECH", "label": "Mobile app"},
        {"category": "AI", "label": "Voice AI"},
        {"category": "DOMAIN", "label": "Fitness"},
        {"category": "VALUE", "label": "consistent workout starts"},
        {"category": "MONEY", "label": "subscription"},
    ]


def _sample_concept() -> dict:
    return {
        "concept": "A mobile app for solo founders that uses Voice AI to deliver consistent workout starts in fitness, monetized via subscription.",
        "product_type": "B2C",
        "primary_user": "Solo founders who keep delaying workouts",
        "core_experience": "Opens the app, speaks their current energy level, and starts a short routine immediately.",
    }


def test_overview_prompt_contains_bilingual_fixed_concept_anchors():
    _, user_prompt = build_overview_prompt(
        title="Voice-first fitness coach",
        summary="A voice coach that gets solo founders to start short workouts.",
        keywords=_sample_keywords(),
        market_research="Users compare Calm and Nike Training Club pricing.",
        concept=_sample_concept(),
    )

    assert "Concept:" in user_prompt
    assert "Primary user:" in user_prompt
    assert "Core experience:" in user_prompt


def test_overview_prompt_requires_english_only_output():
    _, user_prompt = build_overview_prompt(
        title="Voice-first fitness coach",
        summary="A voice coach that gets solo founders to start short workouts.",
        keywords=_sample_keywords(),
        market_research="Users compare Calm and Nike Training Club pricing.",
        concept=_sample_concept(),
    )

    assert "For concept, copy Concept exactly as-is." in user_prompt
    assert "Write all sections in English only." in user_prompt
    assert "Every Korean section must stay in Korean" not in user_prompt
