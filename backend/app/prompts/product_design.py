"""제품 설계서 프롬프트 — "뭘 만들지" 정하는 문서.

개요서를 기반으로 사용자 흐름, 화면, 기능 우선순위, 비즈니스 규칙을 구체화한다.
한국어로 작성. 축 분류(depth guide) 결과에 따라 섹션별 깊이가 달라진다.
"""


def build_product_design_prompt(
    concept: dict,
    overview: dict,
    market_research: str,
    depth_guide: str = "",
) -> tuple[str, str]:
    """제품 설계서 프롬프트. Returns (system_prompt, user_prompt)."""

    concept_en = concept.get("concept_en", "")
    product_type = concept.get("product_type", "B2C")
    primary_user = concept.get("primary_user_en", "")

    system_prompt = """You are a product designer expanding a project overview into a detailed product specification.
Your output will be used by Korean founders and planners to understand exactly what to build.

=== LANGUAGE ===
Write ALL sections in Korean (한국어). Use natural Korean, not translated-sounding text.
Technical terms can stay in English when commonly used in Korean tech context (API, MVP, SaaS 등).

=== ROLE ===
You are defining the PRODUCT layer — what users see, what they do, and what rules govern the system.
The technology decisions come LATER in a separate document. Do NOT recommend tech stacks or databases here.

=== ANTI-PATTERNS ===
1. SYSTEM VOICE: "시스템이 제공합니다" → 사용자가 주어가 되어야 함. "사용자가 ~합니다"
2. VAGUE SCREENS: "메인 화면" → 화면 이름 + 사용자가 여기서 뭘 하는지 1줄
3. FEATURE OVERLAP: Must와 Should에 같은 기능이 다른 이름으로 반복
4. RULES AS FEATURES: 비즈니스 규칙은 "~하면 안 된다/~해야 한다" 형태의 제약. 기능이 아님.

=== VERIFICATION ===
Before outputting, verify:
1. Every Must feature appears in at least one user_flow step
2. Every screen in screens list is referenced in user_flow
3. business_rules are constraints, not feature descriptions
4. mvp_scope has clear IN and OUT lists"""

    # 개요서 내용 조립
    overview_block = f"""CONCEPT: {concept_en}
PRODUCT TYPE: {product_type}
PRIMARY USER: {primary_user}

PROBLEM: {overview.get("problem_ko", "")}
TARGET: {overview.get("target_ko", "")}
FEATURES: {overview.get("features_ko", "")}
DIFFERENTIATOR: {overview.get("differentiator_ko", "")}
REVENUE: {overview.get("revenue_ko", "")}
MVP SCOPE: {overview.get("mvp_scope_ko", "")}"""

    user_prompt = f"""=== PROJECT OVERVIEW ===

{overview_block}

=== MARKET CONTEXT ===

{market_research}

=== WRITE 8 SECTIONS (한국어) ===

1. USER FLOW (사용자 흐름)
   핵심 사용 흐름을 단계별로 작성. 각 단계에 구체적 화면 이름 포함.
   형식: "1. [화면이름]에서 사용자가 ~한다"
   happy path만. 에러/예외는 business_rules에서 다룸.

2. SCREENS (화면 목록)
   각 화면: "화면이름 — 사용자가 여기서 하는 일 1줄"
   user_flow에 등장하는 모든 화면이 여기 있어야 함.

3. FEATURES MUST (반드시 만들 기능)
   MVP에 반드시 포함. v1에 없으면 제품이 동작하지 않는 것들.
   형식: "기능명: [화면] → [사용자 동작] → [결과]"

4. FEATURES SHOULD (다음에 만들 기능)
   v1.1에 추가하면 좋은 것. 없어도 MVP는 동작.

5. FEATURES LATER (나중에 만들 기능)
   v2+ 백로그. 검증 후 판단.

6. BUSINESS MODEL (비즈니스 모델)
   수익 구조 + 구체적 가격 ($). 경쟁사 가격 벤치마크 최소 1개.

7. BUSINESS RULES (비즈니스 규칙)
   기능이 아니라 제약 조건. "~하면 안 된다", "~일 때 ~해야 한다" 형태.
   예: "무료 유저는 하루 3회까지만 생성 가능", "결제 실패 시 즉시 Free로 전환"

8. MVP SCOPE (MVP 범위)
   IN: MVP에 포함하는 것 (5~7개)
   OUT: 의도적으로 빼는 것 (3~5개)
   핵심 가설: "이것이 맞으면 제품이 성공한다"
   최소 검증 방법: 가장 싸게 가설을 테스트하는 방법

{depth_guide}"""

    return system_prompt, user_prompt
