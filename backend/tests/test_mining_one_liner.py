from app.models.llm_schemas import MiningIdea
from app.models.schemas import IdeaOut
from app.prompts.mining import build_mining_prompt


def test_mining_models_require_one_liner_fields():
    llm_fields = MiningIdea.model_fields
    api_fields = IdeaOut.model_fields

    assert "idea_line" in llm_fields
    assert "title" in llm_fields
    assert "summary" in llm_fields
    assert "idea_line_ko" not in llm_fields
    assert "idea_line_en" not in llm_fields
    assert "idea_line" in api_fields
    assert "title" in api_fields
    assert "summary" in api_fields
    assert "idea_line_ko" not in api_fields
    assert "idea_line_en" not in api_fields
    assert "title_ko" not in api_fields
    assert "title_en" not in api_fields
    assert "summary_ko" not in api_fields
    assert "summary_en" not in api_fields
    assert "tier_type" not in api_fields


def test_mining_prompt_requires_one_liner_before_titles_and_summaries():
    system_prompt, user_prompt = build_mining_prompt(
        [
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
    )

    assert "- idea_line" in user_prompt
    assert "- title" in user_prompt
    assert "- summary" in user_prompt
    assert "Generate the one-line idea first" in user_prompt
    assert "The one-line idea is the hook, not the full explanation." in system_prompt
    assert "It may be one or two short natural sentences" in system_prompt
    assert "Do not use label-led formats like WHO:" in system_prompt
    assert "Write all outputs in English only." in system_prompt


def test_mining_prompt_forbids_structured_label_output_in_summaries_and_one_liners():
    system_prompt, _ = build_mining_prompt(
        [
            {
                "tier_type": "stable",
                "sort_order": 1,
                "keywords": [
                    {"slug": "pet-owner", "category": "who", "label": "pet owner"},
                    {"slug": "pet-bed", "category": "tech", "label": "pet bed"},
                    {"slug": "sleep-ai", "category": "ai", "label": "sleep AI"},
                    {"slug": "sleep", "category": "domain", "label": "sleep"},
                    {"slug": "d2c", "category": "money", "label": "D2C"},
                ],
            }
        ]
    )

    assert (
        "Do not write summaries as labeled fields like WHO:, ACTION:, DIFFERENCE:, or OUTCOME:"
        in system_prompt
    )
    assert "Do not write the one-line idea as segmented labels" in system_prompt
    assert "Use the summary as the expanded explanation of the product idea." in system_prompt
