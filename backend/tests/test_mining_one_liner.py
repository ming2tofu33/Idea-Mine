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
    assert "tier_type" not in api_fields


def test_mining_prompt_requires_one_liner_before_titles_and_summaries():
    system_prompt, user_prompt = build_mining_prompt(
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
    assert "The one-line idea is the hook, not the full explanation." in system_prompt
    assert "It may be one or two short natural sentences" in system_prompt
    assert "Do not use label-led formats like WHO:" in system_prompt


def test_mining_prompt_forbids_structured_label_output_in_summaries_and_one_liners():
    system_prompt, _ = build_mining_prompt(
        [
            {
                "tier_type": "stable",
                "sort_order": 1,
                "keywords": [
                    {"slug": "pet-owner", "category": "who", "ko": "반려인", "en": "pet owner"},
                    {"slug": "pet-bed", "category": "tech", "ko": "반려동물 침대", "en": "pet bed"},
                    {"slug": "sleep-ai", "category": "ai", "ko": "수면 AI", "en": "sleep AI"},
                    {"slug": "sleep", "category": "domain", "ko": "수면", "en": "sleep"},
                    {"slug": "d2c", "category": "money", "ko": "직접판매", "en": "D2C"},
                ],
            }
        ]
    )

    assert "Do not write summaries as labeled fields like WHO:, ACTION:, DIFFERENCE:, or OUTCOME:" in system_prompt
    assert "Do not write the one-line idea as segmented labels" in system_prompt
    assert "Use the summary as the expanded explanation of the product idea." in system_prompt
