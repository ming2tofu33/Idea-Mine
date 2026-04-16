from app.services.ideation_v2.overview import build_v2_overview_input


def test_build_v2_overview_input_anchors_to_kernel_and_family():
    selected_idea = {
        "title": "Research Draft Sidecar",
        "idea_line": "Turn scattered browsing fragments into a usable draft before momentum dies.",
        "summary": "A browser-adjacent tool for solo creators.",
        "v2_kernel": {
            "text": "A solo creator wants a usable first draft from scattered browsing fragments.",
            "primary_actor": "solo creator",
            "primary_tension": "scattered browsing fragments",
            "primary_outcome": "usable first draft",
            "primary_environment": "while browsing",
        },
        "v2_family": "workflow_utility",
    }

    payload = build_v2_overview_input(selected_idea)

    assert payload["family"] == "workflow_utility"
    assert "primary_tension" in payload["kernel"]


def test_build_v2_overview_input_rebuilds_missing_v2_metadata():
    selected_idea = {
        "title": "Research Draft Sidecar",
        "idea_line": "Turn scattered browsing fragments into a usable draft before momentum dies.",
        "summary": "A browser-adjacent tool for solo creators.",
        "keyword_combo": [
            {"label": "solo creator", "category": "who", "is_premium": False},
            {"label": "scattered research", "category": "domain", "is_premium": False},
            {"label": "usable first draft", "category": "value", "is_premium": False},
            {"label": "while browsing", "category": "tech", "is_premium": False},
            {"label": "browser-based", "category": "tech", "is_premium": False},
        ],
    }

    payload = build_v2_overview_input(selected_idea, user_tier="free")

    assert payload["family"] == "workflow_utility"
    assert payload["kernel"]["primary_actor"] == "solo creator"
