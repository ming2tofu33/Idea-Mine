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


def test_build_v2_mining_context_prefers_dashboard_family_for_dashboard_shape():
    context = build_v2_mining_context(
        [
            {
                "slug": "small-business-owner",
                "category": "who",
                "subtype": "role",
                "label": "Small Business Owner",
                "is_premium": False,
            },
            {
                "slug": "dashboard",
                "category": "tech",
                "subtype": "platform",
                "label": "Dashboard",
                "is_premium": False,
            },
            {
                "slug": "devops-infra",
                "category": "domain",
                "subtype": "function",
                "label": "DevOps/Infra",
                "is_premium": False,
            },
            {
                "slug": "operational-efficiency",
                "category": "value",
                "subtype": "efficiency",
                "label": "Operational Efficiency",
                "is_premium": False,
            },
        ],
        user_tier="free",
    )

    assert context.normalized_seed.surface_hints == ["Dashboard"]
    assert context.branch_plan.primary_family == "dashboard_ops"


def test_build_v2_mining_context_prefers_platform_family_for_marketplace_shape():
    context = build_v2_mining_context(
        [
            {
                "slug": "solopreneur",
                "category": "who",
                "subtype": "role",
                "label": "Solopreneur",
                "is_premium": False,
            },
            {
                "slug": "marketplace",
                "category": "tech",
                "subtype": "product-form",
                "label": "Marketplace",
                "is_premium": False,
            },
            {
                "slug": "creator-economy",
                "category": "domain",
                "subtype": "ecosystem",
                "label": "Creator Economy",
                "is_premium": False,
            },
            {
                "slug": "sense-of-belonging",
                "category": "value",
                "subtype": "emotional",
                "label": "Sense of Belonging",
                "is_premium": False,
            },
        ],
        user_tier="free",
    )

    assert context.normalized_seed.surface_hints == ["Marketplace"]
    assert context.branch_plan.primary_family == "platform_network"


def test_build_v2_mining_context_prefers_assistant_family_for_voice_ai_case():
    context = build_v2_mining_context(
        [
            {
                "slug": "single-person-household",
                "category": "who",
                "subtype": "household",
                "label": "Single-person Household",
                "is_premium": False,
            },
            {
                "slug": "mobile-app",
                "category": "tech",
                "subtype": "platform",
                "label": "Mobile App",
                "is_premium": False,
            },
            {
                "slug": "voice-ai",
                "category": "ai",
                "subtype": "modality",
                "label": "Voice AI (TTS/STT)",
                "is_premium": True,
            },
            {
                "slug": "mental-health",
                "category": "domain",
                "subtype": "industry",
                "label": "Mental Health",
                "is_premium": False,
            },
            {
                "slug": "emotional-care",
                "category": "value",
                "subtype": "emotional",
                "label": "Emotional Care",
                "is_premium": False,
            },
        ],
        user_tier="premium",
    )

    assert "assistant_copilot" in context.normalized_seed.family_biases
    assert context.branch_plan.primary_family == "assistant_copilot"


def test_build_v2_mining_context_limits_active_seed_keywords_to_core_four():
    context = build_v2_mining_context(
        [
            {
                "slug": "solo-traveler",
                "category": "who",
                "subtype": "lifestyle",
                "label": "Solo Traveler",
                "is_premium": False,
            },
            {
                "slug": "wearable",
                "category": "tech",
                "subtype": "product-form",
                "label": "Wearable",
                "is_premium": False,
            },
            {
                "slug": "creator-economy",
                "category": "domain",
                "subtype": "ecosystem",
                "label": "Creator Economy",
                "is_premium": False,
            },
            {
                "slug": "productivity-boost",
                "category": "value",
                "subtype": "efficiency",
                "label": "Productivity Boost",
                "is_premium": False,
            },
            {
                "slug": "freemium",
                "category": "money",
                "subtype": "recurring",
                "label": "Freemium",
                "is_premium": False,
            },
        ],
        user_tier="free",
    )

    assert len(context.active_keywords) == 4
    assert {item["label"] for item in context.active_keywords} == {
        "Solo Traveler",
        "Wearable",
        "Creator Economy",
        "Productivity Boost",
    }
    assert [item["label"] for item in context.suppressed_keywords] == ["Freemium"]


def test_build_v2_mining_context_keeps_ai_when_core_slot_is_open():
    context = build_v2_mining_context(
        [
            {
                "slug": "single-person-household",
                "category": "who",
                "subtype": "household",
                "label": "Single-person Household",
                "is_premium": False,
            },
            {
                "slug": "mobile-app",
                "category": "tech",
                "subtype": "platform",
                "label": "Mobile App",
                "is_premium": False,
            },
            {
                "slug": "voice-ai",
                "category": "ai",
                "subtype": "modality",
                "label": "Voice AI (TTS/STT)",
                "is_premium": True,
            },
            {
                "slug": "mental-health",
                "category": "domain",
                "subtype": "industry",
                "label": "Mental Health",
                "is_premium": False,
            },
        ],
        user_tier="premium",
    )

    assert {item["label"] for item in context.active_keywords} == {
        "Single-person Household",
        "Mobile App",
        "Voice AI (TTS/STT)",
        "Mental Health",
    }
    assert context.suppressed_keywords == []
