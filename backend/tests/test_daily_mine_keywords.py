from app.services.daily_mine_keywords import DAILY_MINE_KEYWORDS, DAILY_MINE_ROLES


def test_daily_mine_keywords_cover_all_roles():
    assert DAILY_MINE_ROLES == [
        "Subject",
        "Material",
        "Tension",
        "Shape",
        "Ritual / Constraint",
    ]

    by_role = {role: [] for role in DAILY_MINE_ROLES}
    for keyword in DAILY_MINE_KEYWORDS:
        by_role[keyword["role"]].append(keyword)

    assert all(len(items) >= 20 for items in by_role.values())


def test_daily_mine_keywords_are_user_visible_labels_only_plus_internal_role():
    for keyword in DAILY_MINE_KEYWORDS:
        assert set(keyword) == {"slug", "label", "role"}
        assert keyword["slug"]
        assert keyword["label"]
        assert keyword["role"] in DAILY_MINE_ROLES


def test_daily_mine_keywords_exclude_old_business_model_terms():
    forbidden = {
        "Marketplace",
        "Licensing",
        "Subscription",
        "B2B SaaS",
        "API Service",
        "Pay-per-use",
        "Enterprise",
    }
    labels = {keyword["label"] for keyword in DAILY_MINE_KEYWORDS}

    assert labels.isdisjoint(forbidden)
