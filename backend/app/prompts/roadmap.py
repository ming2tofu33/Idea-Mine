"""실행 로드맵 프롬프트 — "뭐부터 만들지" 계획하는 문서.

제품 설계서 + 기술 청사진을 참조하여 Phase/Sprint 단위 실행 계획을 만든다.
한국어로 작성 (기획자가 읽는 문서). first_sprint_tasks만 영어 (코딩 태스크).
"""


def build_roadmap_prompt(
    concept: dict,
    product_design: dict,
    blueprint: dict,
    language: str = "ko",
) -> tuple[str, str]:
    """실행 로드맵 프롬프트. Returns (system_prompt, user_prompt)."""

    nl = "\n"

    lang_instruction = (
        "- phase_0, phase_1, phase_2, validation_checkpoints, estimated_complexity: 한국어 (Korean)\n"
        "- first_sprint_tasks: English (these are coding tasks for AI coding tools)"
        if language == "ko"
        else "- ALL sections in English\n"
        "- first_sprint_tasks: English (coding tasks for AI coding tools)"
    )

    system_prompt = f"""You are a technical PM creating a sprint-based execution plan.
The product and technology are ALREADY DECIDED. Your job is to plan the build sequence.

=== LANGUAGE ===
{lang_instruction}

=== ROLE ===
You are sequencing the build. What comes first? What depends on what?
Phase 0 is FOUNDATION (no features). Phase 1 is MVP (Must features). Phase 2 is LAUNCH (Should + deploy).

=== ANTI-PATTERNS ===
1. VAGUE TASKS: "백엔드 구축" → "users 테이블 마이그레이션 + Auth 미들웨어 구현"
2. WRONG ORDER: Auth 없이 유저 기능 먼저 만들기. DB 없이 API 먼저 만들기.
3. MISSING VALIDATION: 각 Phase 끝에 "이게 동작하는지" 검증 포인트가 없음.

=== VERIFICATION ===
Before outputting, verify:
1. Every Must feature from product design appears in Phase 0 or Phase 1
2. Phase 0 has NO features — only foundation (project init, DB, auth, layout)
3. Phase 1 tasks are ordered by dependency (auth before user features, DB before API)
4. first_sprint_tasks are specific enough to copy into AI coding tool and start immediately"""

    # 제품 설계서 요약
    design_must = nl.join(f"- {f}" for f in product_design.get("features_must", []))
    design_should = nl.join(f"- {f}" for f in product_design.get("features_should", []))
    design_later = nl.join(f"- {f}" for f in product_design.get("features_later", []))
    design_rules = nl.join(f"- {r}" for r in product_design.get("business_rules", []))

    # 기술 청사진 요약
    bp_stack = nl.join(f"- {t}" for t in blueprint.get("tech_stack", []))
    bp_tables = blueprint.get("data_model_sql", "")[:500]  # 처음 500자만 (너무 길면 잘라냄)
    bp_endpoints_count = len(blueprint.get("api_endpoints", []))

    user_prompt = f"""=== PROJECT ===

Concept: {concept.get("concept_en", "")}
Product Type: {concept.get("product_type", "B2C")}

=== PRODUCT DESIGN (what to build) ===

MUST FEATURES:
{design_must}

SHOULD FEATURES:
{design_should}

LATER FEATURES:
{design_later}

BUSINESS RULES:
{design_rules}

MVP SCOPE: {product_design.get("mvp_scope", "")}

=== TECHNICAL BLUEPRINT (how to build) ===

TECH STACK:
{bp_stack}

DATA MODEL (summary): {len(blueprint.get("data_model_sql", "").split("CREATE TABLE")) - 1} tables
API ENDPOINTS: {bp_endpoints_count} endpoints defined

=== WRITE 6 SECTIONS ===

1. PHASE 0 (기반 구축) — 한국어
   프로젝트 초기화, DB 세팅, Auth, 기본 레이아웃.
   기능은 없음. "개발을 시작할 수 있는 상태"를 만드는 단계.
   형식: "- 태스크 설명 (예상 시간)"

2. PHASE 1 (MVP 구현) — 한국어
   Must features를 의존성 순서로 나열.
   "이 기능이 동작하려면 먼저 뭐가 있어야 하는가?" 기준으로 순서 결정.
   형식: "- 태스크 설명 (예상 시간)"

3. PHASE 2 (출시 준비) — 한국어
   Should features + 배포 + 테스트 + 랜딩 페이지.
   형식: "- 태스크 설명 (예상 시간)"

4. VALIDATION CHECKPOINTS (검증 포인트) — 한국어
   각 Phase 끝에서 확인할 것.
   형식: "Phase 0 완료: ~가 동작하는가?"

5. ESTIMATED COMPLEXITY (예상 규모) — 한국어
   전체 프로젝트 규모 판단.
   "소규모 (1인 2~3주)" / "중규모 (1인 4~6주)" / "대규모 (팀 필요, 2~3개월+)"
   근거 1~2문장.

6. FIRST SPRINT TASKS (첫 Sprint 태스크) — English
   Phase 0의 첫 번째 Sprint를 5~7개 구체적 태스크로 분해.
   AI 코딩 도구에 "이거 만들어줘"라고 넣을 수 있는 수준의 구체성.
   형식:
   "1. Initialize Next.js project with TypeScript and Tailwind CSS"
   "2. Create Supabase project and configure environment variables"
   "3. Write users table migration with email, name, role columns"
   etc."""

    return system_prompt, user_prompt
