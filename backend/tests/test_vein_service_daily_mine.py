import random

import pytest

from app.services.daily_mine_keywords import DAILY_MINE_FAMILIES, DAILY_MINE_ROLES
from app.services.vein_service import (
    _has_expected_daily_mine_families,
    build_daily_mine_family_vein_keyword_ids,
    build_daily_mine_vein_keyword_ids,
    build_daily_mine_vein_specs,
)


def test_build_daily_mine_vein_keyword_ids_selects_one_keyword_per_role():
    keywords_by_role = {
        role: [{"id": f"{index}-{role.lower().replace(' ', '-')}"}]
        for index, role in enumerate(DAILY_MINE_ROLES, start=1)
    }

    ids = build_daily_mine_vein_keyword_ids(keywords_by_role, random.Random(1))

    assert ids == [
        keywords_by_role[role][0]["id"]
        for role in DAILY_MINE_ROLES
    ]


def test_build_daily_mine_vein_keyword_ids_rejects_missing_role():
    keywords_by_role = {
        role: [{"id": role}]
        for role in DAILY_MINE_ROLES
        if role != "Tension"
    }

    with pytest.raises(RuntimeError, match="missing Daily Mine keywords"):
        build_daily_mine_vein_keyword_ids(keywords_by_role, random.Random(1))


def test_build_daily_mine_vein_keyword_ids_avoids_duplicate_visible_labels():
    keywords_by_role = {
        "Subject": [{"id": "subject-old-photo", "label": "old photo"}],
        "Material": [
            {"id": "material-old-photo", "label": "old photo"},
            {"id": "material-map-pin", "label": "map pin"},
        ],
        "Tension": [{"id": "tension-memory", "label": "memory fading"}],
        "Shape": [{"id": "shape-capsule", "label": "photo capsule"}],
        "Ritual / Constraint": [{"id": "ritual-question", "label": "one question at a time"}],
    }

    ids = build_daily_mine_vein_keyword_ids(keywords_by_role, random.Random(1))

    assert ids[0] == "subject-old-photo"
    assert ids[1] == "material-map-pin"


def test_build_daily_mine_family_vein_keyword_ids_selects_one_keyword_per_role_for_family():
    keywords_by_family_role = {
        family: {
            role: [{"id": f"{family}-{index}", "label": f"{family} {role}"}]
            for index, role in enumerate(DAILY_MINE_ROLES, start=1)
        }
        for family in DAILY_MINE_FAMILIES
    }

    ids = build_daily_mine_family_vein_keyword_ids(
        keywords_by_family_role,
        "indie_tool",
        random.Random(1),
    )

    assert ids == [
        keywords_by_family_role["indie_tool"][role][0]["id"]
        for role in DAILY_MINE_ROLES
    ]


def test_build_daily_mine_family_vein_keyword_ids_rejects_missing_role_for_family():
    keywords_by_family_role = {
        "cozy_personal": {
            role: [{"id": role, "label": role}]
            for role in DAILY_MINE_ROLES
            if role != "Tension"
        }
    }

    with pytest.raises(RuntimeError, match="missing Daily Mine keywords"):
        build_daily_mine_family_vein_keyword_ids(
            keywords_by_family_role,
            "cozy_personal",
            random.Random(1),
        )


def test_build_daily_mine_family_vein_keyword_ids_avoids_duplicate_visible_labels_within_vein():
    keywords_by_family_role = {
        "cozy_personal": {
            "Subject": [{"id": "subject-shoebox", "label": "shoebox"}],
            "Material": [
                {"id": "material-shoebox", "label": "shoebox"},
                {"id": "material-receipt", "label": "receipt"},
            ],
            "Tension": [{"id": "tension-forgotten", "label": "forgotten"}],
            "Shape": [{"id": "shape-timeline", "label": "timeline"}],
            "Ritual / Constraint": [{"id": "ritual-sunday", "label": "only Sundays"}],
        }
    }

    ids = build_daily_mine_family_vein_keyword_ids(
        keywords_by_family_role,
        "cozy_personal",
        random.Random(1),
    )

    assert ids[0] == "subject-shoebox"
    assert ids[1] == "material-receipt"


def test_build_daily_mine_vein_specs_returns_one_spec_per_family_in_daily_order():
    keywords_by_family_role = {
        family: {
            role: [{"id": f"{family}-{index}", "label": f"{family} {role}"}]
            for index, role in enumerate(DAILY_MINE_ROLES, start=1)
        }
        for family in DAILY_MINE_FAMILIES
    }

    specs = build_daily_mine_vein_specs(keywords_by_family_role, random.Random(1))

    assert specs == [
        {
            "slot_index": index,
            "family": family,
            "keyword_ids": [
                keywords_by_family_role[family][role][0]["id"]
                for role in DAILY_MINE_ROLES
            ],
        }
        for index, family in enumerate(DAILY_MINE_FAMILIES, start=1)
    ]


def test_has_expected_daily_mine_families_rejects_family_less_old_veins():
    veins = [
        {"slot_index": 1, "family": None},
        {"slot_index": 2, "family": None},
        {"slot_index": 3, "family": None},
    ]

    assert _has_expected_daily_mine_families(veins) is False
