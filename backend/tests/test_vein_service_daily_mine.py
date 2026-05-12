import random

import pytest

from app.services.daily_mine_keywords import DAILY_MINE_ROLES
from app.services.vein_service import build_daily_mine_vein_keyword_ids


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
