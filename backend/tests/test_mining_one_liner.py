from app.models.llm_schemas import MiningIdea
from app.models.schemas import IdeaOut
from app.prompts.mining import build_mining_prompt


def test_mining_models_require_one_liner_fields():
    llm_fields = MiningIdea.model_fields
    api_fields = IdeaOut.model_fields

    assert "idea_line_ko" in llm_fields
    assert "idea_line_en" in llm_fields
    assert "idea_line_ko" in api_fields
    assert "idea_line_en" in api_fields


def test_mining_prompt_requires_one_liner_before_titles_and_summaries():
    _, user_prompt = build_mining_prompt(
        [
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
    )

    assert "idea_line_ko" in user_prompt
    assert "idea_line_en" in user_prompt
    assert "Generate the one-line idea first" in user_prompt
