from app.evals.mining_eval import (
    build_surface_family_spread,
    get_mining_eval_cases,
    score_mining_batch,
    score_mining_idea,
)


def test_score_mining_idea_flags_monetization_led_output():
    combo = {
        "sort_order": 1,
        "tier_type": "stable",
        "keywords": [
            {"slug": "solo-founder", "category": "who", "label": "solo founder"},
            {"slug": "mobile-app", "category": "tech", "label": "mobile app"},
            {"slug": "voice-ai", "category": "ai", "label": "voice AI"},
            {"slug": "fitness", "category": "domain", "label": "fitness"},
            {"slug": "subscription", "category": "money", "label": "subscription"},
        ],
    }
    idea = {
        "sort_order": 1,
        "title": "Voice Fitness Subscription",
        "summary": "A user signs up for a voice fitness subscription and starts workouts. Subscription tiers and pricing plans are the core value. They use it every day for a month.",
    }

    result = score_mining_idea(idea=idea, combo=combo)

    assert result.checks["title_not_monetization_led"] is False
    assert result.checks["summary_not_money_feature"] is False
    assert "title_monetization_hook" in result.findings
    assert result.score < 80


def test_score_mining_idea_rewards_concrete_user_action_and_difference():
    combo = {
        "sort_order": 2,
        "tier_type": "stable",
        "keywords": [
            {"slug": "restaurant-owner", "category": "who", "label": "restaurant owner"},
            {"slug": "dashboard", "category": "tech", "label": "dashboard"},
            {"slug": "vision-ai", "category": "ai", "label": "vision AI"},
            {"slug": "inventory", "category": "domain", "label": "inventory"},
            {"slug": "waste-reduction", "category": "value", "label": "waste reduction"},
        ],
    }
    idea = {
        "sort_order": 2,
        "title": "Shelf Photo Restock Order",
        "summary": "A restaurant owner photographs the shelf before closing and checks only the items likely to run short tonight. Unlike manual stock sheets, it turns the real shelf state into a reorder list. They finish the order decision in under 3 minutes.",
    }

    result = score_mining_idea(idea=idea, combo=combo)

    assert result.checks["summary_has_user_action"] is True
    assert result.checks["summary_has_difference"] is True
    assert result.checks["summary_has_concrete_outcome"] is True
    assert result.score >= 80


def test_score_mining_batch_flags_format_overconcentration():
    combos = [{"sort_order": index, "tier_type": "stable", "keywords": []} for index in range(1, 7)]
    ideas = [
        {
            "sort_order": index,
            "title": f"Fitness App {index}",
            "summary": "A user opens the app and starts a routine. Unlike manual tracking, it saves instantly. They finish in 5 minutes.",
        }
        for index in range(1, 7)
    ]

    result = score_mining_batch(ideas=ideas, combos=combos)

    assert "format_overconcentration:app:6" in result.batch_findings


def test_get_mining_eval_cases_returns_seeded_coverage():
    cases = get_mining_eval_cases()

    assert len(cases) >= 4
    assert len({case.name for case in cases}) == len(cases)
    assert len({case.seed for case in cases}) == len(cases)
    assert any(case.has_ai_keyword for case in cases)
    assert any(not case.has_ai_keyword for case in cases)


def test_build_surface_family_spread_reports_v2_family_selection():
    spread = build_surface_family_spread(
        [
            {"label": "solo creator", "category": "who", "is_premium": False},
            {"label": "scattered research", "category": "domain", "is_premium": False},
            {"label": "usable first draft", "category": "value", "is_premium": False},
            {"label": "while browsing", "category": "tech", "is_premium": False},
            {"label": "browser-based", "category": "tech", "is_premium": False},
        ]
    )

    assert spread["primary_family"] == "workflow_utility"
    assert spread["secondary_family"] == "assistant_copilot"
    assert "contrast_family" in spread
