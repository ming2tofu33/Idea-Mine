from scripts.test_ore_taxonomy_prompt import (
    TEST_VEINS,
    TaxonomyOre,
    _validate_result,
    build_taxonomy_prompt,
    render_markdown,
)

from app.prompts.ore_discovery import (
    FAMILY_DISPLAY_NAMES,
    build_ore_discovery_lane_plan,
)


def test_test_veins_use_five_daily_mine_roles():
    expected_roles = {
        "Subject",
        "Material",
        "Tension",
        "Shape",
        "Ritual / Constraint",
    }

    assert len(TEST_VEINS) == 3
    assert [vein["family"] for vein in TEST_VEINS] == [
        "cozy_personal",
        "indie_tool",
        "practical_twist",
    ]
    for vein in TEST_VEINS:
        assert {keyword["role"] for keyword in vein["keywords"]} == expected_roles


def test_prompt_requires_hidden_lanes_and_active_keyword_subsets():
    system_prompt, user_prompt = build_taxonomy_prompt(TEST_VEINS[0])

    assert "Selected hidden Vein family: Cozy Personal" in system_prompt
    assert "6 ores: Cozy Personal" in system_prompt
    assert "2 ores: Indie Tool" in system_prompt
    assert "1 ores: Practical Twist" in system_prompt
    for index in range(1, 7):
        assert f"sort_order {index}: ore_lane must be Cozy Personal" in system_prompt
    assert "sort_order 7: ore_lane must be Indie Tool" in system_prompt
    assert "sort_order 8: ore_lane must be Indie Tool" in system_prompt
    assert "sort_order 9: ore_lane must be Practical Twist" in system_prompt
    assert "sort_order 10: ore_lane must be Weird Bridge" in system_prompt
    assert "Each ore must actively use exactly 3 or 4 keywords" in system_prompt
    assert "active_keywords must contain exact keyword labels only" in system_prompt
    assert "Do not force all 5 Vein keywords into every ore" in system_prompt
    assert "cat (Subject)" in user_prompt
    assert "only at night (Ritual / Constraint)" in user_prompt


def test_render_markdown_groups_samples_by_vein_and_lane():
    sample_results = [
        {
            "vein_name": "Cozy Test",
            "keywords": TEST_VEINS[0]["keywords"],
            "ores": [
                {
                    "sort_order": 1,
                    "ore_lane": "Cozy Personal",
                    "title": "Night Cat Cards",
                    "one_liner": "A tiny nightly archive for dream cards.",
                    "short_summary": "The user saves one dream fragment as a card each night.",
                    "active_keywords": ["cat", "dream fragment", "card archive"],
                    "interesting_point": "The nightly limit makes the archive feel special.",
                    "project_fit": "This can be built with cards and a save flow.",
                    "risk": "It could become too horoscope-like.",
                    "mvp_hint": "Start with one dream entry and one generated card.",
                    "product_form": "card archive",
                    "core_loop_signature": "nightly_dream_card_loop",
                }
            ],
        }
    ]

    markdown = render_markdown(sample_results)

    assert "# Idea Ore Taxonomy Prompt Samples" in markdown
    assert "Hidden lane target per Vein: 6 family-core, 2 adjacent-family, 1 opposite-family, 1 Weird Bridge." in markdown
    assert "## Cozy Test" in markdown
    assert "### 1. Night Cat Cards" in markdown
    assert "**Lane:** Cozy Personal" in markdown
    assert "`cat`, `dream fragment`, `card archive`" in markdown


def test_validate_result_normalizes_lane_by_sort_order():
    ores = [
        TaxonomyOre(
            sort_order=index,
            ore_lane="Wrong Lane",
            title=f"Ore {index}",
            one_liner="A short ore.",
            short_summary="A short summary.",
            interesting_point="A specific hook.",
            project_fit="A small MVP is possible.",
            risk="It could become generic.",
            mvp_hint="Start with one loop.",
            active_keywords=["cat", "dream fragment", "loneliness"],
            product_form=f"form-{index}",
            core_loop_signature=f"loop_{index}",
        )
        for index in range(1, 11)
    ]

    _validate_result(TEST_VEINS[0], ores)

    assert [ore.ore_lane for ore in ores] == build_ore_discovery_lane_plan(
        TEST_VEINS[0]["family"]
    )


def test_prompt_uses_selected_hidden_family_for_each_test_vein():
    for vein in TEST_VEINS:
        system_prompt, _ = build_taxonomy_prompt(vein)
        selected_family = FAMILY_DISPLAY_NAMES[vein["family"]]
        expected_plan = build_ore_discovery_lane_plan(vein["family"])

        assert f"Selected hidden Vein family: {selected_family}" in system_prompt
        for index, lane in enumerate(expected_plan, start=1):
            assert f"sort_order {index}: ore_lane must be {lane}" in system_prompt
