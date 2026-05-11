import asyncio
from types import SimpleNamespace

import pytest

from app.config import Settings
from app.services import ore_service
from app.services.ore_service import (
    build_idea_ore_rows,
    build_project_seed_brief_row,
    discover_ores,
    format_ore_veins,
    normalize_discovered_ores,
    validate_discovered_ores,
)
from app.prompts.ore_discovery import ORE_DISCOVERY_LENSES


KEYWORDS = [
    {"id": "kw-cat", "label": "Cat", "category": "domain"},
    {"id": "kw-dream", "label": "Dream", "category": "mood"},
    {"id": "kw-guide", "label": "AI guide", "category": "ai"},
]


ORES = [
    {
        "title": "Cat Dream Archive",
        "one_liner": "A cat guide turns dreams into symbolic cards.",
        "short_summary": "A lightweight dream archive with collectible cat cards.",
        "interesting_point": "The cat persona makes dream reflection feel less clinical.",
        "project_fit": "The MVP only needs input, card generation, and archive.",
        "risk": "It could drift into generic horoscope language.",
        "mvp_hint": "Build dream input -> interpretation card -> archive.",
        "sort_order": 1,
        "generation_lens": "Direct Core",
        "primary_anchor_keyword": "Cat",
        "product_form": "card archive",
        "core_loop_signature": "dream_input_to_card_archive",
        "novelty_axis": "cat_symbol_interpreter",
    }
]


BRIEF = {
    "product_concept": "A small dream archive where a cat guide interprets entries.",
    "target_user": "People who want a gentle daily reflection ritual.",
    "core_loop": ["Write a dream", "Receive a cat card", "Save it to archive"],
    "mvp_features": ["Dream input", "Interpretation card", "Archive"],
    "first_screens": ["Mine", "Dream entry", "Archive"],
    "not_to_build": ["Social feed", "Fortune telling claims"],
    "data_model_hint": "Store dreams, cards, and symbols.",
    "api_hint": "POST /dreams, GET /dreams, POST /dreams/{id}/interpret",
    "vibe_coding_prompt": "Build the first dream entry and cat card archive flow.",
}


def test_build_idea_ore_rows_persists_generated_ores_as_unvaulted_rows():
    rows = build_idea_ore_rows(
        user_id="user-1",
        vein_id="vein-1",
        keywords=KEYWORDS,
        ores=ORES,
    )

    assert rows == [
        {
            "user_id": "user-1",
            "vein_id": "vein-1",
            "title": "Cat Dream Archive",
            "one_liner": "A cat guide turns dreams into symbolic cards.",
            "short_summary": "A lightweight dream archive with collectible cat cards.",
            "interesting_point": "The cat persona makes dream reflection feel less clinical.",
            "project_fit": "The MVP only needs input, card generation, and archive.",
            "risk": "It could drift into generic horoscope language.",
            "mvp_hint": "Build dream input -> interpretation card -> archive.",
            "selected_keywords": KEYWORDS,
            "generation_meta": {
                "generation_lens": "Direct Core",
                "primary_anchor_keyword": "Cat",
                "product_form": "card archive",
                "core_loop_signature": "dream_input_to_card_archive",
                "novelty_axis": "cat_symbol_interpreter",
            },
            "sort_order": 1,
            "is_vaulted": False,
        }
    ]


def test_build_project_seed_brief_row_keeps_brief_linked_to_the_ore():
    row = build_project_seed_brief_row(
        user_id="user-1",
        ore_id="ore-1",
        brief=BRIEF,
    )

    assert row == {
        "user_id": "user-1",
        "ore_id": "ore-1",
        "product_concept": "A small dream archive where a cat guide interprets entries.",
        "target_user": "People who want a gentle daily reflection ritual.",
        "core_loop": ["Write a dream", "Receive a cat card", "Save it to archive"],
        "mvp_features": ["Dream input", "Interpretation card", "Archive"],
        "first_screens": ["Mine", "Dream entry", "Archive"],
        "not_to_build": ["Social feed", "Fortune telling claims"],
        "data_model_hint": "Store dreams, cards, and symbols.",
        "api_hint": "POST /dreams, GET /dreams, POST /dreams/{id}/interpret",
        "vibe_coding_prompt": "Build the first dream entry and cat card archive flow.",
    }


def _ore(index: int, **overrides):
    base = {
        **ORES[0],
        "title": f"Ore {index}",
        "sort_order": index,
        "generation_lens": ORE_DISCOVERY_LENSES[(index - 1) % len(ORE_DISCOVERY_LENSES)],
        "primary_anchor_keyword": KEYWORDS[(index - 1) % len(KEYWORDS)]["label"],
        "product_form": f"form-{(index - 1) % 5}",
        "core_loop_signature": f"loop-{index}",
        "novelty_axis": f"axis-{index}",
    }
    return {**base, **overrides}


def test_normalize_discovered_ores_keeps_exactly_ten_sorted_ores():
    ores = [
        _ore(index)
        for index in range(11, 0, -1)
    ]

    with pytest.raises(RuntimeError, match="exactly 10"):
        normalize_discovered_ores(ores)


def test_validate_discovered_ores_accepts_ten_diverse_ores():
    ores = [_ore(index) for index in range(1, 11)]

    normalized = validate_discovered_ores(ores)

    assert [ore["title"] for ore in normalized] == [f"Ore {index}" for index in range(1, 11)]
    assert [ore["sort_order"] for ore in normalized] == list(range(1, 11))


def test_validate_discovered_ores_rejects_duplicate_titles():
    ores = [_ore(index) for index in range(1, 11)]
    ores[1]["title"] = ores[0]["title"]

    with pytest.raises(RuntimeError, match="Duplicate Idea Ore title"):
        validate_discovered_ores(ores)


def test_validate_discovered_ores_rejects_duplicate_core_loops():
    ores = [_ore(index) for index in range(1, 11)]
    ores[1]["core_loop_signature"] = ores[0]["core_loop_signature"]

    with pytest.raises(RuntimeError, match="Duplicate core_loop_signature"):
        validate_discovered_ores(ores)


def test_validate_discovered_ores_rejects_overused_product_forms():
    ores = [_ore(index, product_form="same-form") for index in range(1, 11)]

    with pytest.raises(RuntimeError, match="product_form"):
        validate_discovered_ores(ores)


class _FakeParsedOre:
    def __init__(self, data: dict):
        self.data = data

    def model_dump(self) -> dict:
        return self.data


class _FakeResponse:
    def __init__(self, ores: list[dict]):
        self.choices = [
            SimpleNamespace(
                message=SimpleNamespace(
                    parsed=SimpleNamespace(
                        ores=[_FakeParsedOre(ore) for ore in ores],
                    ),
                    refusal=None,
                )
            )
        ]
        self.usage = SimpleNamespace(prompt_tokens=100, completion_tokens=200)


class _FakeCompletions:
    def __init__(self, attempts: list[list[dict]]):
        self.attempts = attempts
        self.calls = 0
        self.kwargs = []

    def parse(self, **kwargs):
        self.kwargs.append(kwargs)
        self.calls += 1
        return _FakeResponse(self.attempts[self.calls - 1])


class _FakeTable:
    def __init__(self, supabase, name: str):
        self.supabase = supabase
        self.name = name
        self.filters = []
        self.insert_rows = None
        self.order_field = None

    def select(self, *_args):
        return self

    def eq(self, key: str, value):
        self.filters.append((key, value))
        return self

    def order(self, field: str, desc: bool = False):
        self.order_field = (field, desc)
        return self

    def limit(self, _count: int):
        return self

    def insert(self, rows):
        self.insert_rows = rows if isinstance(rows, list) else [rows]
        return self

    def update(self, _fields):
        return self

    def execute(self):
        rows = self.supabase.rows.setdefault(self.name, [])
        if self.insert_rows is not None:
            inserted = []
            for index, row in enumerate(self.insert_rows, start=1):
                item = {"id": f"{self.name}-{len(rows) + index}", **row}
                inserted.append(item)
            rows.extend(inserted)
            return SimpleNamespace(data=inserted)

        data = rows
        for key, value in self.filters:
            data = [row for row in data if row.get(key) == value]
        if self.order_field:
            field, desc = self.order_field
            data = sorted(data, key=lambda row: row.get(field), reverse=desc)
        return SimpleNamespace(data=data)


class _FakeSupabase:
    def __init__(self):
        self.rows = {"idea_ores": [], "ai_usage_logs": []}

    def table(self, name: str):
        return _FakeTable(self, name)


def test_discover_ores_retries_once_after_diversity_validation_failure(monkeypatch):
    bad_ores = [_ore(index) for index in range(1, 11)]
    bad_ores[1]["core_loop_signature"] = bad_ores[0]["core_loop_signature"]
    good_ores = [_ore(index) for index in range(1, 11)]
    completions = _FakeCompletions([bad_ores, good_ores])
    monkeypatch.setattr(
        ore_service,
        "get_openai",
        lambda: SimpleNamespace(
            beta=SimpleNamespace(
                chat=SimpleNamespace(completions=completions),
            )
        ),
    )
    supabase = _FakeSupabase()

    result = asyncio.run(
        discover_ores(
            supabase=supabase,
            user_id="user-1",
            tier="free",
            vein={"id": "vein-1"},
            keywords=KEYWORDS,
            source="web",
        )
    )

    assert completions.calls == 2
    assert len(result["ores"]) == 10
    assert supabase.rows["ai_usage_logs"][0]["status"] == "success"


def test_ore_discovery_defaults_to_fast_daily_mine_generation_settings():
    assert Settings.model_fields["ore_discovery_model"].default == "gpt-5-nano"
    assert Settings.model_fields["ore_discovery_reasoning_effort"].default == "minimal"


def test_discover_ores_uses_configured_reasoning_effort(monkeypatch):
    completions = _FakeCompletions([[_ore(index) for index in range(1, 11)]])
    monkeypatch.setattr(
        ore_service,
        "get_openai",
        lambda: SimpleNamespace(
            beta=SimpleNamespace(
                chat=SimpleNamespace(completions=completions),
            )
        ),
    )
    supabase = _FakeSupabase()

    asyncio.run(
        discover_ores(
            supabase=supabase,
            user_id="user-1",
            tier="free",
            vein={"id": "vein-1"},
            keywords=KEYWORDS,
            source="web",
        )
    )

    assert completions.kwargs[0]["reasoning_effort"] == "minimal"


def test_discover_ores_returns_existing_ores_without_calling_openai(monkeypatch):
    existing = [
        {
            "id": f"ore-{index}",
            "user_id": "user-1",
            "vein_id": "vein-1",
            "selected_keywords": KEYWORDS,
            "generation_meta": {},
            "is_vaulted": False,
            **_ore(index),
        }
        for index in range(1, 11)
    ]
    supabase = _FakeSupabase()
    supabase.rows["idea_ores"] = existing
    completions = _FakeCompletions([[_ore(index) for index in range(1, 11)]])
    monkeypatch.setattr(
        ore_service,
        "get_openai",
        lambda: SimpleNamespace(
            beta=SimpleNamespace(
                chat=SimpleNamespace(completions=completions),
            )
        ),
    )

    result = asyncio.run(
        discover_ores(
            supabase=supabase,
            user_id="user-1",
            tier="free",
            vein={"id": "vein-1"},
            keywords=KEYWORDS,
            source="web",
        )
    )

    assert completions.calls == 0
    assert [ore["id"] for ore in result["ores"]] == [f"ore-{index}" for index in range(1, 11)]
    assert result["vein"]["keywords"] == [
        {"id": "kw-cat", "label": "Cat"},
        {"id": "kw-dream", "label": "Dream"},
        {"id": "kw-guide", "label": "AI guide"},
    ]


def test_format_ore_veins_hides_keyword_categories_and_marks_mined():
    veins = [
        {
            "id": "vein-1",
            "slot_index": 1,
            "is_selected": False,
            "keywords": KEYWORDS,
        },
        {
            "id": "vein-2",
            "slot_index": 2,
            "is_selected": True,
            "keywords": KEYWORDS[:1],
        },
    ]

    result = format_ore_veins(veins, mined_vein_ids={"vein-1"})

    assert result == [
        {
            "id": "vein-1",
            "slot_index": 1,
            "keywords": [
                {"id": "kw-cat", "label": "Cat"},
                {"id": "kw-dream", "label": "Dream"},
                {"id": "kw-guide", "label": "AI guide"},
            ],
            "is_mined": True,
        },
        {
            "id": "vein-2",
            "slot_index": 2,
            "keywords": [{"id": "kw-cat", "label": "Cat"}],
            "is_mined": True,
        },
    ]
