import asyncio
from types import SimpleNamespace

from app.services import appraisal_service


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
    def parse(self, **kwargs):
        return _FakeResponse(
            {
                "market_fit": "Strong demand if the onboarding friction is low.",
                "problem_fit": "The pain point is specific and recurring.",
                "feasibility": "An MVP is feasible with existing APIs.",
                "differentiation": "The product wins on speed to first value.",
                "scalability": "It can expand from solo founders to small teams.",
                "risk": "Retention may drop if the first-session habit does not stick.",
            }
        )


class _FakeSupabaseTable:
    def __init__(self):
        self.payload = None

    def insert(self, payload: dict):
        self.payload = payload
        return self

    def execute(self):
        return SimpleNamespace(data=[{"id": "appraisal-1", **self.payload}])


class _FakeSupabase:
    def __init__(self):
        self.appraisals = _FakeSupabaseTable()

    def table(self, name: str):
        if name != "appraisals":
            raise AssertionError(f"Unexpected table access: {name}")
        return self.appraisals


def test_generate_appraisal_returns_single_field_contract(monkeypatch):
    async def fake_log_ai_usage(*args, **kwargs):
        return None

    monkeypatch.setattr(appraisal_service, "_log_ai_usage", fake_log_ai_usage)
    monkeypatch.setattr(
        appraisal_service,
        "get_openai",
        lambda: SimpleNamespace(beta=SimpleNamespace(chat=SimpleNamespace(completions=_FakeCompletions()))),
    )

    overview = {
        "id": "overview-1",
        "problem": "Solo founders delay workouts because setup feels too heavy.",
        "target": "Solo founders who want to start a workout quickly.",
        "features": "Voice check-in and a one-tap workout start.",
    }

    result = asyncio.run(
        appraisal_service.generate_appraisal(
            supabase=_FakeSupabase(),
            user_id="user-1",
            tier="pro",
            overview=overview,
            keywords=[],
            market_research="Users compare fast-start workout apps.",
            depth="basic",
        )
    )

    assert result["overview_id"] == "overview-1"
    assert result["market_fit"] == "Strong demand if the onboarding friction is low."
    assert result["problem_fit"] == "The pain point is specific and recurring."
    assert result["feasibility"] == "An MVP is feasible with existing APIs."
    assert result["differentiation"] == "The product wins on speed to first value."
    assert result["scalability"] == "It can expand from solo founders to small teams."
    assert result["risk"] == "Retention may drop if the first-session habit does not stick."
