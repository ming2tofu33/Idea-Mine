from app.services.ideation_v2.normalizer import normalize_keywords


def test_normalize_keywords_builds_balanced_seed():
    seed = normalize_keywords(
        [
            {"label": "solo creator", "source": "system", "premium_only": False},
            {"label": "scattered research", "source": "system", "premium_only": False},
            {"label": "usable first draft", "source": "system", "premium_only": False},
            {"label": "while browsing", "source": "system", "premium_only": False},
            {"label": "browser-based", "source": "system", "premium_only": False},
            {"label": "unknown label", "source": "system", "premium_only": False},
        ]
    )
    assert seed.actors == ["solo creator"]
    assert seed.tensions == ["scattered research"]
    assert seed.outcomes == ["usable first draft"]
    assert seed.surface_hints == ["while browsing"]
    assert seed.mechanism_hints == ["browser-based"]
    assert seed.unresolved_keywords[0].keyword == "unknown label"
    assert seed.seed_strength_label == "balanced"


def test_normalize_keywords_uses_subtype_fallbacks_and_ignores_money():
    seed = normalize_keywords(
        [
            {
                "label": "Small Business Owner",
                "source": "system",
                "premium_only": False,
                "category": "who",
                "subtype": "role",
            },
            {
                "label": "Dashboard",
                "source": "system",
                "premium_only": False,
                "category": "tech",
                "subtype": "platform",
            },
            {
                "label": "AI Copilot",
                "source": "system",
                "premium_only": True,
                "category": "ai",
                "subtype": "agent",
            },
            {
                "label": "Operational Efficiency",
                "source": "system",
                "premium_only": False,
                "category": "value",
                "subtype": "efficiency",
            },
            {
                "label": "Subscription (SaaS)",
                "source": "system",
                "premium_only": False,
                "category": "money",
                "subtype": "recurring",
            },
        ]
    )

    assert seed.actors == ["Small Business Owner"]
    assert seed.surface_hints == ["Dashboard"]
    assert seed.premium_modifiers == ["AI Copilot"]
    assert seed.outcomes == ["Operational Efficiency"]
    assert seed.unresolved_keywords == []


def test_normalize_keywords_collects_explicit_family_biases():
    seed = normalize_keywords(
        [
            {
                "label": "Voice AI (TTS/STT)",
                "source": "system",
                "premium_only": True,
                "category": "ai",
                "subtype": "modality",
            },
            {
                "label": "Creator Economy",
                "source": "system",
                "premium_only": False,
                "category": "domain",
                "subtype": "ecosystem",
            },
        ]
    )

    assert "assistant_copilot" in seed.family_biases
    assert "platform_network" in seed.family_biases
