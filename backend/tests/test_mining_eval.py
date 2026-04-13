from app.evals.mining_eval import (
    get_mining_eval_cases,
    score_mining_batch,
    score_mining_idea,
)


def test_score_mining_idea_flags_monetization_led_output():
    combo = {
        "sort_order": 1,
        "tier_type": "stable",
        "keywords": [
            {"slug": "solo-founder", "category": "who", "ko": "1인 창업자", "en": "solo founder"},
            {"slug": "mobile-app", "category": "tech", "ko": "모바일 앱", "en": "mobile app"},
            {"slug": "voice-ai", "category": "ai", "ko": "음성 AI", "en": "voice AI"},
            {"slug": "fitness", "category": "domain", "ko": "피트니스", "en": "fitness"},
            {"slug": "subscription", "category": "money", "ko": "구독", "en": "subscription"},
        ],
    }
    idea = {
        "sort_order": 1,
        "title_ko": "음성 피트니스 구독",
        "title_en": "Voice Fitness Subscription",
        "summary_ko": "사용자가 구독형 음성 피트니스 서비스에 가입하고 운동을 시작한다. 구독 플랜과 요금제 옵션이 핵심 가치다. 한 달 동안 매일 이용한다.",
        "summary_en": "A user signs up for a voice fitness subscription and starts workouts. Subscription tiers and pricing plans are the core value. They use it every day for a month.",
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
            {"slug": "restaurant-owner", "category": "who", "ko": "식당 사장", "en": "restaurant owner"},
            {"slug": "dashboard", "category": "tech", "ko": "대시보드", "en": "dashboard"},
            {"slug": "vision-ai", "category": "ai", "ko": "비전 AI", "en": "vision AI"},
            {"slug": "inventory", "category": "domain", "ko": "재고 관리", "en": "inventory"},
            {"slug": "waste-reduction", "category": "value", "ko": "폐기 절감", "en": "waste reduction"},
        ],
    }
    idea = {
        "sort_order": 2,
        "title_ko": "선반 사진 발주",
        "title_en": "Shelf Photo Restock Order",
        "summary_ko": "식당 사장이 마감 전에 선반 사진을 찍고 오늘 밤 부족한 재고만 바로 확인한다. 수기 재고표와 달리 실제 선반 상태를 기준으로 발주 목록이 정리된다. 3분 안에 발주 결정을 끝낸다.",
        "summary_en": "A restaurant owner photographs the shelf before closing and checks only the items likely to run short tonight. Unlike manual stock sheets, it turns the real shelf state into a reorder list. They finish the order decision in under 3 minutes.",
    }

    result = score_mining_idea(idea=idea, combo=combo)

    assert result.checks["summary_has_user_action"] is True
    assert result.checks["summary_has_difference"] is True
    assert result.checks["summary_has_concrete_outcome"] is True
    assert result.score >= 80


def test_score_mining_batch_flags_format_overconcentration():
    combos = [
        {"sort_order": index, "tier_type": "stable", "keywords": []}
        for index in range(1, 7)
    ]
    ideas = [
        {
            "sort_order": index,
            "title_ko": f"앱 아이디어 {index}",
            "title_en": f"Fitness App {index}",
            "summary_ko": "사용자가 앱을 열고 루틴을 시작한다. 기존 수기 기록과 달리 바로 저장된다. 5분 안에 끝낸다.",
            "summary_en": "A user opens the app and starts a routine. Unlike manual tracking, it saves instantly. They finish in 5 minutes.",
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
