from app.models.llm_schemas import OverviewResponse
from app.models.schemas import OverviewOut


def _build_overview_payload() -> dict:
    return {
        "concept": "Voice-first fitness coach for solo founders",
        "problem": (
            "Solo founders often skip workouts because choosing a routine takes too long "
            "once their day is already overloaded."
        ),
        "target": (
            "A solo founder in their late 20s to early 40s who works long days, "
            "wants to stay active, and reaches for the product between meetings or after work."
        ),
        "features": (
            "Quick routine chooser: home screen -> tap one of three routines -> start immediately -> "
            "remove decision fatigue\n"
            "Voice check-in: check-in screen -> describe energy level -> get a tailored routine -> "
            "match effort to real capacity\n"
            "Session recap: finish screen -> review what was completed -> keep momentum -> "
            "make the next session easier to start"
        ),
        "differentiator": (
            "Unlike broad fitness apps that force planning first, this product is designed to help the user start in seconds."
        ),
        "revenue": (
            "Charge $9.99 per month after a 7-day trial and benchmark against other habit and workout subscriptions."
        ),
        "mvp_scope": (
            "Ship three quick-start routines, a voice energy check-in, and a session recap. "
            "Leave coaching history and social features out of the MVP."
        ),
    }


def test_overview_response_requires_flat_sections():
    result = OverviewResponse(**_build_overview_payload())

    assert result.concept
    assert result.problem
    assert result.target
    assert result.features
    assert result.differentiator
    assert result.revenue
    assert result.mvp_scope


def test_overview_out_exposes_flat_runtime_contract():
    payload = {
        "id": "overview-1",
        "idea_id": "idea-1",
        "user_id": "user-1",
        "created_at": "2026-04-11T10:00:00Z",
        "updated_at": "2026-04-11T10:00:00Z",
        **_build_overview_payload(),
    }

    result = OverviewOut(**payload)

    assert result.id == "overview-1"
    assert result.idea_id == "idea-1"
    assert result.user_id == "user-1"
    assert result.concept
    assert result.problem
    assert result.target
    assert result.features
    assert result.differentiator
    assert result.revenue
    assert result.mvp_scope
