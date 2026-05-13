import asyncio
import random
from collections import Counter
from datetime import date
from types import SimpleNamespace

import pytest

from app.services import vein_service
from app.services.daily_mine_keywords import (
    DAILY_MINE_FAMILIES,
    DAILY_MINE_KEYWORD_SET,
    DAILY_MINE_ROLES,
)
from app.services.vein_service import (
    _has_expected_daily_mine_families,
    DAILY_MINE_VEIN_ROLE_PATTERNS,
    build_daily_mine_family_vein_keyword_ids,
    build_daily_mine_vein_keyword_ids,
    build_daily_mine_vein_specs,
    get_or_create_today_veins,
)


def _keywords_by_role(prefix: str = "kw", per_role: int = 3) -> dict[str, list[dict]]:
    return {
        role: [
            {
                "id": f"{prefix}-{role.lower().replace(' / ', '-').replace(' ', '-')}-{index}",
                "label": f"{prefix} {role} {index}",
                "role": role,
            }
            for index in range(1, per_role + 1)
        ]
        for role in DAILY_MINE_ROLES
    }


def _roles_for_ids(keywords_by_role: dict[str, list[dict]], ids: list[str]) -> list[str]:
    role_by_id = {
        keyword["id"]: role
        for role, keywords in keywords_by_role.items()
        for keyword in keywords
    }
    return [role_by_id[keyword_id] for keyword_id in ids]


def test_build_daily_mine_vein_keyword_ids_uses_loose_role_patterns():
    keywords_by_role = _keywords_by_role()

    selected_role_patterns = {
        tuple(_roles_for_ids(
            keywords_by_role,
            build_daily_mine_vein_keyword_ids(keywords_by_role, random.Random(seed)),
        ))
        for seed in range(1, 20)
    }

    allowed_patterns = {tuple(pattern) for pattern in DAILY_MINE_VEIN_ROLE_PATTERNS}
    assert selected_role_patterns.issubset(allowed_patterns)
    assert selected_role_patterns != {tuple(DAILY_MINE_ROLES)}
    assert any(
        Counter(pattern)["Subject"] + Counter(pattern)["Material"] >= 3
        and (
            Counter(pattern)["Shape"] == 0
            or Counter(pattern)["Ritual / Constraint"] == 0
        )
        for pattern in selected_role_patterns
    )


def test_build_daily_mine_vein_keyword_ids_selects_five_keywords():
    keywords_by_role = _keywords_by_role()

    ids = build_daily_mine_vein_keyword_ids(keywords_by_role, random.Random(1))

    assert len(ids) == 5


def test_build_daily_mine_vein_keyword_ids_rejects_missing_role():
    keywords_by_role = {
        role: [{"id": role}]
        for role in DAILY_MINE_ROLES
        if role != "Tension"
    }

    with pytest.raises(RuntimeError, match="missing Daily Mine keywords"):
        build_daily_mine_vein_keyword_ids(keywords_by_role, random.Random(1))


def test_build_daily_mine_vein_keyword_ids_avoids_duplicate_visible_labels():
    keywords_by_role = _keywords_by_role(per_role=3)
    keywords_by_role["Subject"][0] = {
        "id": "subject-old-photo",
        "label": "old photo",
        "role": "Subject",
    }
    keywords_by_role["Material"][0] = {
        "id": "material-old-photo",
        "label": "old photo",
        "role": "Material",
    }

    ids = build_daily_mine_vein_keyword_ids(keywords_by_role, random.Random(1))
    label_by_id = {
        keyword["id"]: keyword["label"]
        for keywords in keywords_by_role.values()
        for keyword in keywords
    }
    selected_labels = [label_by_id[keyword_id] for keyword_id in ids]

    assert len(selected_labels) == len(set(selected_labels))


def test_build_daily_mine_vein_keyword_ids_rejects_too_close_keyword_pairs_without_alternative():
    keywords_by_role = _keywords_by_role(per_role=1)
    keywords_by_role["Subject"] = [
        {"id": "subject-browser-tab", "label": "browser tab", "role": "Subject"},
    ]
    keywords_by_role["Material"] = [
        {"id": "material-downloaded-file", "label": "downloaded file", "role": "Material"},
    ]

    with pytest.raises(RuntimeError, match="Cannot create Daily Mine Vein"):
        build_daily_mine_vein_keyword_ids(keywords_by_role, random.Random(1))


def test_build_daily_mine_family_vein_keyword_ids_uses_loose_pattern_for_family():
    keywords_by_family_role = {
        family: _keywords_by_role(prefix=family)
        for family in DAILY_MINE_FAMILIES
    }

    ids = build_daily_mine_family_vein_keyword_ids(
        keywords_by_family_role,
        "indie_tool",
        random.Random(1),
    )

    roles = _roles_for_ids(keywords_by_family_role["indie_tool"], ids)
    assert tuple(roles) in {tuple(pattern) for pattern in DAILY_MINE_VEIN_ROLE_PATTERNS}
    assert len(ids) == 5


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
        "cozy_personal": _keywords_by_role(per_role=3),
    }
    keywords_by_family_role["cozy_personal"]["Subject"][0] = {
        "id": "subject-shoebox",
        "label": "shoebox",
        "role": "Subject",
    }
    keywords_by_family_role["cozy_personal"]["Material"][0] = {
        "id": "material-shoebox",
        "label": "shoebox",
        "role": "Material",
    }

    ids = build_daily_mine_family_vein_keyword_ids(
        keywords_by_family_role,
        "cozy_personal",
        random.Random(1),
    )
    label_by_id = {
        keyword["id"]: keyword["label"]
        for keywords in keywords_by_family_role["cozy_personal"].values()
        for keyword in keywords
    }
    selected_labels = [label_by_id[keyword_id] for keyword_id in ids]

    assert len(selected_labels) == len(set(selected_labels))


def test_build_daily_mine_vein_specs_returns_one_spec_per_family_in_daily_order():
    keywords_by_family_role = {
        family: _keywords_by_role(prefix=family)
        for family in DAILY_MINE_FAMILIES
    }

    specs = build_daily_mine_vein_specs(keywords_by_family_role, random.Random(1))

    assert [spec["slot_index"] for spec in specs] == [1, 2, 3]
    assert [spec["family"] for spec in specs] == DAILY_MINE_FAMILIES
    assert all(len(spec["keyword_ids"]) == 5 for spec in specs)


def test_has_expected_daily_mine_families_rejects_family_less_old_veins():
    veins = [
        {"slot_index": 1, "family": None},
        {"slot_index": 2, "family": None},
        {"slot_index": 3, "family": None},
    ]

    assert _has_expected_daily_mine_families(veins) is False


def _daily_mine_keyword_rows() -> list[dict]:
    return [
        {
            "id": f"{family}-{role_index}-{variant}",
            "slug": f"{family}-{role_index}-{variant}",
            "category": "daily_mine",
            "subtype": None,
            "role": role,
            "family": family,
            "keyword_set": DAILY_MINE_KEYWORD_SET,
            "label": f"{family} {role} {variant}",
            "is_premium": False,
            "is_active": True,
        }
        for family in DAILY_MINE_FAMILIES
        for role_index, role in enumerate(DAILY_MINE_ROLES, start=1)
        for variant in range(1, 4)
    ]


def _old_familyless_veins() -> list[dict]:
    today = date.today().isoformat()
    return [
        {
            "id": f"old-{slot_index}",
            "user_id": "user-1",
            "date": today,
            "slot_index": slot_index,
            "family": None,
            "keyword_ids": [f"old-kw-{slot_index}"],
            "keyword_set": DAILY_MINE_KEYWORD_SET,
            "is_active": True,
        }
        for slot_index in range(1, 4)
    ]


class _DailyMineTable:
    def __init__(self, supabase, name: str):
        self.supabase = supabase
        self.name = name
        self.filters = []
        self.in_filters = []
        self.order_field = None
        self.insert_rows = None
        self.update_fields = None

    def select(self, fields: str):
        self.supabase.operations.append((self.name, "select", fields))
        return self

    def eq(self, key: str, value):
        self.filters.append((key, value))
        return self

    def in_(self, key: str, values: list):
        self.in_filters.append((key, values))
        return self

    def lte(self, key: str, value):
        self.filters.append((key, ("lte", value)))
        return self

    def gte(self, key: str, value):
        self.filters.append((key, ("gte", value)))
        return self

    def order(self, field: str):
        self.order_field = field
        return self

    def limit(self, _count: int):
        return self

    def update(self, fields: dict):
        self.update_fields = fields
        return self

    def insert(self, rows):
        self.insert_rows = rows if isinstance(rows, list) else [rows]
        return self

    def execute(self):
        if self.name == "active_seasons":
            return SimpleNamespace(data=[])

        rows = self.supabase.rows.setdefault(self.name, [])

        if self.update_fields is not None:
            self.supabase.operations.append((self.name, "update", self.update_fields))
            updated = []
            for row in rows:
                if self._matches(row):
                    row.update(self.update_fields)
                    updated.append(row)
            return SimpleNamespace(data=updated)

        if self.insert_rows is not None:
            self.supabase.operations.append((self.name, "insert", list(self.insert_rows)))
            if self.supabase.fail_vein_insert and self.name == "veins":
                raise RuntimeError("insert failed")
            inserted = []
            for index, row in enumerate(self.insert_rows, start=1):
                item = {"id": f"new-{index}", **row}
                rows.append(item)
                inserted.append(item)
            return SimpleNamespace(data=inserted)

        data = [row for row in rows if self._matches(row)]
        if self.order_field:
            data = sorted(data, key=lambda row: row.get(self.order_field))
        return SimpleNamespace(data=data)

    def _matches(self, row: dict) -> bool:
        for key, value in self.filters:
            if isinstance(value, tuple):
                continue
            if row.get(key) != value:
                return False
        for key, values in self.in_filters:
            if row.get(key) not in values:
                return False
        return True


class _DailyMineSupabase:
    def __init__(
        self,
        veins: list[dict],
        keywords: list[dict],
        fail_vein_insert: bool = False,
    ):
        self.rows = {
            "veins": veins,
            "keywords": keywords,
            "active_seasons": [],
        }
        self.operations = []
        self.fail_vein_insert = fail_vein_insert

    def table(self, name: str):
        return _DailyMineTable(self, name)


def test_replacement_spec_generation_failure_does_not_deactivate_existing_daily_mine_veins():
    supabase = _DailyMineSupabase(
        veins=_old_familyless_veins(),
        keywords=[],
    )

    with pytest.raises(RuntimeError, match="missing Daily Mine keywords"):
        asyncio.run(
            get_or_create_today_veins(
                supabase,
                user_id="user-1",
                tier="free",
                mode=DAILY_MINE_KEYWORD_SET,
            )
        )

    assert all(vein["is_active"] for vein in supabase.rows["veins"])
    assert not [
        operation for operation in supabase.operations
        if operation[0] == "veins" and operation[1] == "update"
    ]


def test_familyless_daily_mine_veins_replace_only_after_specs_are_available(monkeypatch):
    supabase = _DailyMineSupabase(
        veins=_old_familyless_veins(),
        keywords=_daily_mine_keyword_rows(),
    )
    monkeypatch.setattr(vein_service, "pick_rarity", lambda is_season=False: "common")

    veins = asyncio.run(
        get_or_create_today_veins(
            supabase,
            user_id="user-1",
            tier="free",
            mode=DAILY_MINE_KEYWORD_SET,
        )
    )

    first_keyword_select = next(
        index for index, operation in enumerate(supabase.operations)
        if operation[0] == "keywords" and operation[1] == "select"
    )
    first_vein_update = next(
        index for index, operation in enumerate(supabase.operations)
        if operation[0] == "veins" and operation[1] == "update"
    )

    assert first_keyword_select < first_vein_update
    assert [vein["family"] for vein in veins] == DAILY_MINE_FAMILIES
    assert [vein["slot_index"] for vein in veins] == [1, 2, 3]
    assert all(not vein["is_active"] for vein in supabase.rows["veins"][:3])


def test_daily_mine_replacement_insert_failure_attempts_to_restore_old_vein_ids(monkeypatch):
    supabase = _DailyMineSupabase(
        veins=_old_familyless_veins(),
        keywords=_daily_mine_keyword_rows(),
        fail_vein_insert=True,
    )
    monkeypatch.setattr(vein_service, "pick_rarity", lambda is_season=False: "common")

    with pytest.raises(RuntimeError, match="insert failed"):
        asyncio.run(
            get_or_create_today_veins(
                supabase,
                user_id="user-1",
                tier="free",
                mode=DAILY_MINE_KEYWORD_SET,
            )
        )

    assert all(vein["is_active"] for vein in supabase.rows["veins"])
    restore_operations = [
        operation for operation in supabase.operations
        if operation == ("veins", "update", {"is_active": True})
    ]
    assert restore_operations
