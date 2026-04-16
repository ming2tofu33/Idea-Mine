import asyncio
from types import SimpleNamespace

from app.config import settings
from app.services import idea_service, overview_service


class _FakeParsed:
    def __init__(self, data: dict):
        self._data = data

    def model_dump(self) -> dict:
        return self._data


class _FakeIdeaMessage:
    def __init__(self, ideas: list[dict]):
        self.parsed = SimpleNamespace(ideas=[_FakeParsed(idea) for idea in ideas])
        self.refusal = None


class _FakeOverviewMessage:
    def __init__(self, data: dict):
        self.parsed = _FakeParsed(data)
        self.refusal = None


class _FakeResponse:
    def __init__(self, message):
        self.choices = [SimpleNamespace(message=message)]
        self.usage = SimpleNamespace(prompt_tokens=10, completion_tokens=20)


class _FakeIdeaTable:
    def __init__(self):
        self.payload = None

    def insert(self, payload):
        self.payload = payload
        return self

    def execute(self):
        return SimpleNamespace(
            data=[
                {
                    "id": f"idea-{index}",
                    "is_vaulted": False,
                    **row,
                }
                for index, row in enumerate(self.payload or [], start=1)
            ]
        )


class _FakeVeinTable:
    def update(self, payload):
        return self

    def eq(self, field, value):
        return self

    def execute(self):
        return SimpleNamespace(data=[])


class _FakeOverviewTable:
    def __init__(self):
        self.payload = None

    def insert(self, payload: dict):
        self.payload = payload
        return self

    def execute(self):
        return SimpleNamespace(data=[{"id": "overview-1", **self.payload}])


class _FakeSupabase:
    def __init__(self):
        self.ideas = _FakeIdeaTable()
        self.veins = _FakeVeinTable()
        self.overviews = _FakeOverviewTable()

    def table(self, name: str):
        if name == "ideas":
            return self.ideas
        if name == "veins":
            return self.veins
        if name == "overviews":
            return self.overviews
        raise AssertionError(f"Unexpected table access: {name}")


def test_v2_runtime_switch_defaults_off():
    assert settings.ideation_v2_enabled is False


def test_generate_ideas_uses_v2_slots_when_switch_on(monkeypatch):
    async def fake_log_ai_usage(*args, **kwargs):
        return None

    def fake_build_mining_prompt_v2(*, selected_keywords, context):
        return (
            "system",
            "user",
            [
                {
                    "sort_order": 1,
                    "family": "workflow_utility",
                    "subfamily": "browser_extension",
                    "keywords": selected_keywords,
                },
                {
                    "sort_order": 2,
                    "family": "assistant_copilot",
                    "subfamily": "side_panel",
                    "keywords": selected_keywords,
                },
            ],
        )

    fake_client = SimpleNamespace(
        beta=SimpleNamespace(
            chat=SimpleNamespace(
                completions=SimpleNamespace(
                    parse=lambda **kwargs: _FakeResponse(
                        _FakeIdeaMessage(
                            [
                                {
                                    "sort_order": 1,
                                    "idea_line": "Idea line 1",
                                    "title": "Title 1",
                                    "summary": "Summary 1",
                                },
                                {
                                    "sort_order": 2,
                                    "idea_line": "Idea line 2",
                                    "title": "Title 2",
                                    "summary": "Summary 2",
                                },
                            ]
                        )
                    )
                )
            )
        )
    )

    monkeypatch.setattr(settings, "ideation_v2_enabled", True)
    monkeypatch.setattr(idea_service, "_log_ai_usage", fake_log_ai_usage)
    monkeypatch.setattr(idea_service, "get_openai", lambda: fake_client)
    monkeypatch.setattr(
        idea_service,
        "build_mining_prompt_v2",
        fake_build_mining_prompt_v2,
        raising=False,
    )

    result = asyncio.run(
        idea_service.generate_ideas(
            supabase=_FakeSupabase(),
            user_id="user-1",
            tier="free",
            vein_id="vein-1",
            keywords=[
                {"slug": "solo-creator", "category": "who", "label": "solo creator"},
                {"slug": "browsing", "category": "tech", "label": "while browsing"},
            ],
            source="web",
        )
    )

    assert result[0]["tier_type"] == "workflow_utility|browser_extension"
    assert result[1]["tier_type"] == "assistant_copilot|side_panel"


def test_generate_overview_uses_v2_overview_input_when_switch_on(monkeypatch):
    captured: dict[str, dict] = {}

    async def fake_research_market(**kwargs):
        return "market"

    async def fake_log_ai_usage(*args, **kwargs):
        return None

    def fake_build_v2_overview_input(selected_idea, user_tier="free"):
        return {
            "title": selected_idea["title"],
            "idea_line": selected_idea["idea_line"],
            "summary": selected_idea["summary"],
            "kernel": {
                "primary_actor": "solo creator",
                "primary_tension": "scattered research",
                "primary_outcome": "usable first draft",
                "primary_environment": "while browsing",
            },
            "family": "workflow_utility",
        }

    def fake_build_concept_prompt(**kwargs):
        captured["concept"] = kwargs
        return "system", "user"

    def fake_build_overview_prompt(**kwargs):
        captured["overview"] = kwargs
        return "system", "user"

    class _FakeOverviewCompletions:
        def __init__(self):
            self.calls = 0

        def parse(self, **kwargs):
            self.calls += 1
            if self.calls == 1:
                return _FakeResponse(
                    _FakeOverviewMessage(
                        {
                            "concept": "Concept",
                            "product_type": "B2C",
                            "primary_user": "Solo creator",
                            "core_experience": "Opens the side panel and keeps drafting.",
                        }
                    )
                )
            return _FakeResponse(
                _FakeOverviewMessage(
                    {
                        "concept": "Concept",
                        "problem": "Problem",
                        "target": "Target",
                        "features": "Features",
                        "differentiator": "Differentiator",
                        "revenue": "Revenue",
                        "mvp_scope": "MVP",
                    }
                )
            )

    fake_client = SimpleNamespace(
        beta=SimpleNamespace(
            chat=SimpleNamespace(completions=_FakeOverviewCompletions())
        )
    )

    monkeypatch.setattr(settings, "ideation_v2_enabled", True)
    monkeypatch.setattr(overview_service, "research_market", fake_research_market)
    monkeypatch.setattr(overview_service, "_log_ai_usage", fake_log_ai_usage)
    monkeypatch.setattr(overview_service, "get_openai", lambda: fake_client)
    monkeypatch.setattr(
        overview_service,
        "build_v2_overview_input",
        fake_build_v2_overview_input,
        raising=False,
    )
    monkeypatch.setattr(overview_service, "build_concept_prompt", fake_build_concept_prompt)
    monkeypatch.setattr(overview_service, "build_overview_prompt", fake_build_overview_prompt)

    result = asyncio.run(
        overview_service.generate_overview(
            supabase=_FakeSupabase(),
            user_id="user-1",
            tier="free",
            idea={
                "id": "idea-1",
                "title": "Research Draft Sidecar",
                "summary": "A browser-adjacent drafting tool.",
                "idea_line": "Turn scattered browsing fragments into a usable draft before momentum dies.",
                "keyword_combo": [{"label": "solo creator", "category": "who"}],
            },
            source="web",
        )
    )

    assert captured["concept"]["kernel"]["primary_actor"] == "solo creator"
    assert captured["overview"]["family"] == "workflow_utility"
    assert result["idea_id"] == "idea-1"
