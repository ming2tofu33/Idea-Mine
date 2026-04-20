import asyncio
from types import SimpleNamespace

from app.prompts.concept import build_concept_prompt
from app.prompts.overview import build_overview_prompt
from app.services import overview_service


def _sample_keywords() -> list[dict]:
    return [
        {"category": "WHO", "label": "Solo Founder"},
        {"category": "TECH", "label": "Mobile app"},
        {"category": "AI", "label": "Voice AI"},
        {"category": "DOMAIN", "label": "Fitness"},
        {"category": "VALUE", "label": "consistent workout starts"},
    ]


def _sample_concept() -> dict:
    return {
        "concept": "A mobile app for solo founders that uses Voice AI to deliver consistent workout starts in fitness.",
        "product_type": "B2C",
        "primary_user": "Solo founders who keep delaying workouts",
        "core_experience": "Opens the app, speaks their current energy level, and starts a short routine immediately.",
    }


def test_concept_prompt_uses_one_liner_as_primary_anchor():
    _, user_prompt = build_concept_prompt(
        title="Voice-first fitness coach",
        summary="A voice coach that gets solo founders to start short workouts.",
        keywords=_sample_keywords(),
        idea_line="A voice coach that gets a solo founder from hesitation to workout start in under 30 seconds.",
    )

    assert "One-line idea:" in user_prompt
    assert "The selected one-line idea is the source of truth." in user_prompt
    assert "If title, summary, and one-line idea conflict, follow the one-line idea." in user_prompt
    assert "Provide English only." in user_prompt


def test_overview_prompt_uses_one_liner_as_primary_anchor():
    _, user_prompt = build_overview_prompt(
        title="Voice-first fitness coach",
        summary="A voice coach that gets solo founders to start short workouts.",
        keywords=_sample_keywords(),
        market_research="Users compare Calm and Nike Training Club pricing.",
        concept=_sample_concept(),
        idea_line="A voice coach that gets a solo founder from hesitation to workout start in under 30 seconds.",
    )

    assert "Selected one-line idea:" in user_prompt
    assert "The selected one-line idea is the source of truth for what product was chosen." in user_prompt
    assert "Do not broaden, rename, or swap the product described by the one-line idea." in user_prompt
    assert "Write all sections in English only." in user_prompt


class _FakeParsed:
    def __init__(self, data: dict):
        self._data = data

    def model_dump(self) -> dict:
        return self._data


class _FakeResponse:
    def __init__(self, data: dict):
        self.choices = [SimpleNamespace(message=SimpleNamespace(parsed=_FakeParsed(data), refusal=None))]
        self.usage = SimpleNamespace(prompt_tokens=10, completion_tokens=20)


class _FakeCompletions:
    def __init__(self):
        self.calls = 0

    def parse(self, **kwargs):
        self.calls += 1
        if self.calls == 1:
            return _FakeResponse(_sample_concept())
        return _FakeResponse(
            {
                "concept": "A voice-first fitness app for solo founders.",
                "problem": "Problem",
                "target": "Target",
                "features": "Features",
                "differentiator": "Differentiator",
                "revenue": "Revenue",
                "mvp_scope": "MVP",
            }
        )


class _FakeSupabaseTable:
    def __init__(self):
        self.payload = None

    def insert(self, payload: dict):
        self.payload = payload
        return self

    def execute(self):
        return SimpleNamespace(data=[{"id": "overview-1", **self.payload}])


class _FakeSupabase:
    def __init__(self):
        self.overviews = _FakeSupabaseTable()

    def table(self, name: str):
        if name != "overviews":
            raise AssertionError(f"Unexpected table access: {name}")
        return self.overviews


def test_generate_overview_passes_one_liner_to_prompt_builders(monkeypatch):
    captured: dict[str, dict] = {}

    async def fake_research_market(**kwargs):
        return "market"

    def fake_build_concept_prompt(**kwargs):
        captured["concept"] = kwargs
        return "system", "user"

    def fake_build_overview_prompt(**kwargs):
        captured["overview"] = kwargs
        return "system", "user"

    async def fake_log_ai_usage(*args, **kwargs):
        return None

    fake_client = SimpleNamespace(
        beta=SimpleNamespace(
            chat=SimpleNamespace(completions=_FakeCompletions())
        )
    )

    monkeypatch.setattr(overview_service, "research_market", fake_research_market)
    monkeypatch.setattr(overview_service, "build_concept_prompt", fake_build_concept_prompt)
    monkeypatch.setattr(overview_service, "build_overview_prompt", fake_build_overview_prompt)
    monkeypatch.setattr(overview_service, "_log_ai_usage", fake_log_ai_usage)
    monkeypatch.setattr(overview_service, "get_openai", lambda: fake_client)

    idea = {
        "id": "idea-1",
        "title": "Voice-first fitness coach",
        "summary": "A voice coach that gets solo founders to start short workouts.",
        "idea_line": "A voice coach that gets a solo founder from hesitation to workout start in under 30 seconds.",
        "keyword_combo": _sample_keywords(),
    }

    result = asyncio.run(
        overview_service.generate_overview(
            supabase=_FakeSupabase(),
            user_id="user-1",
            tier="free",
            idea=idea,
        )
    )

    assert captured["concept"]["idea_line"] == idea["idea_line"]
    assert captured["overview"]["idea_line"] == idea["idea_line"]
    assert all(kw["category"] != "MONEY" for kw in captured["concept"]["keywords"])
    assert all(kw["category"] != "MONEY" for kw in captured["overview"]["keywords"])
    assert result["idea_id"] == "idea-1"
    assert result["concept"] == "A voice-first fitness app for solo founders."
