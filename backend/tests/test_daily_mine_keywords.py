import re

from app.services.daily_mine_keywords import (
    DAILY_MINE_FAMILIES,
    DAILY_MINE_KEYWORDS,
    DAILY_MINE_ROLES,
    group_daily_mine_keywords_by_family_and_role,
)


def test_daily_mine_keywords_cover_all_families_and_roles():
    assert DAILY_MINE_FAMILIES == [
        "cozy_personal",
        "indie_tool",
        "practical_twist",
    ]
    assert DAILY_MINE_ROLES == [
        "Subject",
        "Material",
        "Tension",
        "Shape",
        "Ritual / Constraint",
    ]

    grouped = group_daily_mine_keywords_by_family_and_role()
    for family in DAILY_MINE_FAMILIES:
        for role in DAILY_MINE_ROLES:
            assert len(grouped[family][role]) >= 8


def test_daily_mine_keywords_are_visible_labels_plus_internal_role_and_family():
    for keyword in DAILY_MINE_KEYWORDS:
        assert set(keyword) == {"slug", "label", "role", "family"}
        assert keyword["slug"]
        assert keyword["label"]
        assert keyword["role"] in DAILY_MINE_ROLES
        assert keyword["family"] in DAILY_MINE_FAMILIES


def test_daily_mine_keyword_slugs_are_namespaced_lowercase_kebab_case():
    slug_pattern = re.compile(r"^daily-mine-v3-[a-z0-9]+(?:-[a-z0-9]+)*$")

    for keyword in DAILY_MINE_KEYWORDS:
        assert slug_pattern.fullmatch(keyword["slug"])


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


def test_daily_mine_keywords_reduce_over_determining_terms():
    discouraged_labels = {
        "tiny note",
        "printable sheet",
        "packing board",
        "three saved items max",
        "waiting anxiety",
        "safety anxiety",
    }
    labels = {keyword["label"] for keyword in DAILY_MINE_KEYWORDS}

    assert labels.isdisjoint(discouraged_labels)
