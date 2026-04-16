from app.services.ideation_v2.mining import build_v2_mining_context


def test_build_v2_mining_context_returns_normalized_seed_and_branch_plan():
    context = build_v2_mining_context(
        [
            {"label": "solo creator", "source": "system", "premium_only": False},
            {"label": "scattered research", "source": "system", "premium_only": False},
            {"label": "usable first draft", "source": "system", "premium_only": False},
            {"label": "while browsing", "source": "system", "premium_only": False},
            {"label": "browser-based", "source": "system", "premium_only": False},
        ],
        user_tier="free",
    )

    assert context.normalized_seed.actors == ["solo creator"]
    assert context.branch_plan.primary_family == "workflow_utility"
    assert context.branch_plan.secondary_family == "assistant_copilot"


def test_build_v2_mining_context_accepts_runtime_keyword_shape():
    context = build_v2_mining_context(
        [
            {
                "slug": "support-manager",
                "category": "who",
                "label": "solo creator",
                "is_premium": False,
            },
            {
                "slug": "browser-extension",
                "category": "tech",
                "label": "browser-based",
                "is_premium": False,
            },
            {
                "slug": "language-model",
                "category": "ai",
                "label": "language model",
                "is_premium": True,
            },
            {
                "slug": "research-fragmentation",
                "category": "value",
                "label": "usable first draft",
                "is_premium": False,
            },
        ],
        user_tier="premium",
    )

    assert context.branch_plan.ai_variant_budget == 1
    assert context.family_scores["workflow_utility"].score >= 0.0
