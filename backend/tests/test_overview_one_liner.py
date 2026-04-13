import asyncio
from types import SimpleNamespace

from app.prompts.concept import build_concept_prompt
from app.prompts.overview import build_overview_prompt
from app.services import overview_service


def _sample_keywords() -> list[dict]:
    return [
        {"category": "WHO", "en": "Solo Founder"},
        {"category": "TECH", "en": "Mobile app"},
        {"category": "AI", "en": "Voice AI"},
        {"category": "DOMAIN", "en": "Fitness"},
        {"category": "VALUE", "en": "consistent workout starts"},
        {"category": "MONEY", "en": "subscription"},
    ]


def _sample_concept() -> dict:
    return {
        "concept_en": "A mobile app for solo founders that uses Voice AI to deliver consistent workout starts in fitness, monetized via subscription.",
        "concept_ko": "1인 창업가가 운동을 바로 시작할 수 있게 돕는 보이스 AI 피트니스 앱.",
        "product_type": "B2C",
        "primary_user_en": "Solo founders who keep delaying workouts",
        "primary_user_ko": "운동을 계속 미루는 1인 창업가",
        "core_experience_en": "Opens the app, speaks their current energy level, and starts a short routine immediately.",
        "core_experience_ko": "앱을 열고 지금 컨디션을 말하면 바로 짧은 운동 루틴이 시작된다.",
    }


def test_concept_prompt_uses_one_liner_as_primary_anchor():
    _, user_prompt = build_concept_prompt(
        title_en="Voice-first fitness coach",
        summary_en="A voice coach that gets solo founders to start short workouts.",
        keywords=_sample_keywords(),
        idea_line_en="A voice coach that gets a solo founder from hesitation to workout start in under 30 seconds.",
        idea_line_ko="운동을 미루는 1인 창업가가 30초 안에 운동을 시작하게 만드는 보이스 코치.",
    )

    assert "One-line idea EN:" in user_prompt
    assert "One-line idea KO:" in user_prompt
    assert "The selected one-line idea is the source of truth." in user_prompt
    assert "If title, summary, and one-line idea conflict, follow the one-line idea." in user_prompt


def test_overview_prompt_uses_one_liner_as_primary_anchor():
    _, user_prompt = build_overview_prompt(
        title_en="Voice-first fitness coach",
        summary_en="A voice coach that gets solo founders to start short workouts.",
        keywords=_sample_keywords(),
        market_research="Users compare Calm and Nike Training Club pricing.",
        concept=_sample_concept(),
        idea_line_en="A voice coach that gets a solo founder from hesitation to workout start in under 30 seconds.",
        idea_line_ko="운동을 미루는 1인 창업가가 30초 안에 운동을 시작하게 만드는 보이스 코치.",
    )

    assert "Selected one-line idea EN:" in user_prompt
    assert "Selected one-line idea KO:" in user_prompt
    assert "The selected one-line idea is the source of truth for what product was chosen." in user_prompt
    assert "Do not broaden, rename, or swap the product described by the one-line idea." in user_prompt


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
                "concept_ko": "1인 창업가가 운동을 바로 시작할 수 있게 돕는 보이스 AI 피트니스 앱.",
                "concept_en": "A voice-first fitness app for solo founders.",
                "problem_ko": "문제",
                "problem_en": "Problem",
                "target_ko": "타깃",
                "target_en": "Target",
                "features_ko": "기능",
                "features_en": "Features",
                "differentiator_ko": "차별점",
                "differentiator_en": "Differentiator",
                "revenue_ko": "수익",
                "revenue_en": "Revenue",
                "mvp_scope_ko": "MVP",
                "mvp_scope_en": "MVP",
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
        "title_en": "Voice-first fitness coach",
        "summary_en": "A voice coach that gets solo founders to start short workouts.",
        "idea_line_en": "A voice coach that gets a solo founder from hesitation to workout start in under 30 seconds.",
        "idea_line_ko": "운동을 미루는 1인 창업가가 30초 안에 운동을 시작하게 만드는 보이스 코치.",
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

    assert captured["concept"]["idea_line_en"] == idea["idea_line_en"]
    assert captured["concept"]["idea_line_ko"] == idea["idea_line_ko"]
    assert captured["overview"]["idea_line_en"] == idea["idea_line_en"]
    assert captured["overview"]["idea_line_ko"] == idea["idea_line_ko"]
    assert result["idea_id"] == "idea-1"
