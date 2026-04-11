from app.models.llm_schemas import OverviewDocumentResponse
from app.models.schemas import OverviewOut


def _build_overview_payload() -> dict:
    return {
        "title": "Voice-first fitness coach for solo founders",
        "one_liner": "A lightweight voice coach that helps solo founders start a workout without opening a complex fitness app.",
        "language": "ko",
        "content": {
            "project_intro": {
                "summary": "이 프로젝트는 운동 계획보다 시작 장벽을 낮추는 데 초점을 둔다."
            },
            "user_and_problem": {
                "target_user": "운동을 미루기 쉬운 1인 창업자",
                "problem_situation": "하루가 끝나면 운동을 해야 한다는 건 알지만 앱을 열고 계획을 고르는 순간 피로가 커진다.",
                "why_it_matters": "문제는 운동 지식이 아니라 매일 시작하지 못한다는 데 있다.",
            },
            "why_now": {
                "reason_to_try": "문제 자체가 작지 않고, 작은 상호작용 실험만으로도 첫 반응을 확인할 수 있다.",
                "gap_in_existing_options": "기존 앱은 추적과 계획에는 강하지만 시작 장벽을 낮추는 데는 약할 수 있다.",
                "why_small_prototype_is_enough": "핵심은 긴 기능 목록이 아니라 첫 실행 흐름에 있다.",
            },
            "smallest_prototype": {
                "prototype_description": "음성으로 운동 시작을 유도하는 단일 플로우",
                "core_experience": "사용자가 앱을 열면 30초 안에 오늘 루틴을 시작하게 만든다.",
                "not_in_scope": [
                    "정교한 분석 대시보드",
                    "복잡한 운동 추천 엔진",
                ],
            },
            "first_user_experience": {
                "entry_point": "앱 실행 직후",
                "first_actions": [
                    "오늘 상태를 말한다",
                    "제안된 짧은 루틴을 듣는다",
                    "바로 시작 버튼을 누른다",
                ],
                "initial_value": "생각보다 빨리 시작할 수 있다는 감각을 얻는다.",
            },
            "key_assumptions": [
                {
                    "assumption": "사용자는 더 많은 기능보다 시작 장벽이 낮은 흐름에 먼저 반응한다.",
                    "why_it_matters": "핵심 가치가 첫 실행 경험에 달려 있기 때문이다.",
                    "risk_if_wrong": "음성 인터랙션 자체가 귀찮게 느껴질 수 있다.",
                }
            ],
            "risks_and_open_questions": {
                "main_risks": [
                    "반복 사용성이 약할 수 있다."
                ],
                "open_questions": [
                    "사용자가 음성 인터랙션을 실제로 선호할까?"
                ],
            },
            "validation_plan": {
                "what_to_build": "핵심 시작 흐름만 담은 프로토타입",
                "who_to_test_with": "운동을 자주 미루는 1인 창업자 몇 명",
                "signals_to_watch": [
                    "첫 반응",
                    "다시 써보고 싶은지",
                ],
                "next_step_if_positive": "반복 사용 흐름을 더 다듬는다.",
            },
        },
        "internal_meta": {
            "claims": [
                {
                    "text": "기존 앱은 시작 장벽을 낮추는 데 약할 수 있다.",
                    "type": "assumption",
                    "status": "kept",
                }
            ],
            "consistency_checks": {
                "same_user": True,
                "same_product": True,
                "no_major_contradiction": True,
            },
            "quality_notes": [
                "시장 규모 숫자는 포함하지 않았다."
            ],
        },
    }


def test_overview_document_response_requires_b_stage_sections():
    result = OverviewDocumentResponse(**_build_overview_payload())

    assert result.content.project_intro.summary
    assert result.content.user_and_problem.target_user
    assert result.content.why_now.reason_to_try
    assert result.content.smallest_prototype.core_experience
    assert result.content.first_user_experience.initial_value
    assert result.content.key_assumptions[0].assumption
    assert result.content.risks_and_open_questions.main_risks
    assert result.content.validation_plan.signals_to_watch


def test_overview_out_exposes_render_and_eval_fields():
    payload = {
        "id": "overview-1",
        "idea_id": "idea-1",
        "user_id": "user-1",
        "created_at": "2026-04-11T10:00:00Z",
        "updated_at": "2026-04-11T10:00:00Z",
        **_build_overview_payload(),
    }

    result = OverviewOut(**payload)

    assert result.title
    assert result.one_liner
    assert result.language == "ko"
    assert "project_intro" in result.content
    assert "claims" in result.internal_meta
