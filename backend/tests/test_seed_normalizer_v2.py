from app.services.ideation_v2.normalizer import normalize_keywords


def test_normalize_keywords_builds_balanced_seed():
    seed = normalize_keywords(
        [
            {"label": "solo creator", "source": "system", "premium_only": False},
            {"label": "scattered research", "source": "system", "premium_only": False},
            {"label": "usable first draft", "source": "system", "premium_only": False},
            {"label": "while browsing", "source": "system", "premium_only": False},
            {"label": "browser-based", "source": "system", "premium_only": False},
        ]
    )
    assert seed.actors == ["solo creator"]
    assert seed.tensions == ["scattered research"]
    assert seed.seed_strength_label == "balanced"
