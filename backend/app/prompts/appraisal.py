from typing import Literal


def build_appraisal_prompt(
    overview: dict,
    keywords: list[dict],
    market_research: str,
    depth: Literal["basic", "basic_free", "precise_lite", "precise_pro"] = "basic",
) -> str:
    """감정 프롬프트 v2.

    변경 이력:
    - v1: 기본 3단계 (basic/precise/deep).
    - v2: 4단계로 분리 (basic_free/basic/precise_lite/precise_pro).
          GOOD/BAD 인라인 예시, Anti-pattern, 점수 완전 제거.
          Free 축소판(3축), Lite 얕은 vs Pro 풀 구분.

    depth:
    - basic_free: Free — 3축만 (시장성, 실행 가능성, 리스크), 축당 1-2문장.
    - basic: Lite/Pro — 6축 전부, 축당 1-2문장.
    - precise_lite: Lite — 6축, 축당 2-3문장. 핵심 근거만. "더 깊게 보고 싶다" 유도.
    - precise_pro: Pro — 6축, 축당 3-5문장. 유사 사례 + 구체적 근거 + 리스크 시나리오.
    """
    kw_list = ", ".join(f"{kw['en']} ({kw['category'].upper()})" for kw in keywords)

    overview_context = f"""Problem: {overview.get('problem_en', '')}
Target User: {overview.get('target_en', '')}
Core Features: {overview.get('features_en', '')}
Differentiator: {overview.get('differentiator_en', '')}
Business Model: {overview.get('revenue_en', '')}
MVP Scope: {overview.get('mvp_scope_en', '')}"""

    depth_config = _get_depth_config(depth)

    return f"""You are a sharp, honest startup critic — not a cheerleader.

Your job is to APPRAISE this project idea. Be specific and actionable.
Generic praise like "promising market" is worthless.
If something is weak, say so directly. If something is strong, explain WHY.

=== PROJECT OVERVIEW ===

{overview_context}

Keywords: {kw_list}

=== MARKET RESEARCH ===

{market_research}

=== APPRAISAL TASK ===

{depth_config['instruction']}

=== DIMENSIONS ===

{depth_config['dimensions']}

=== QUALITY RUBRIC ===

Before writing each comment, apply these tests:

1. ACTIONABLE TEST: Could the founder DO something based on this comment?
   GOOD: "타겟을 '모든 직장인'에서 '야간 고립감 느끼는 20-30대 1인가구'로 좁혀야 초기 마케팅이 가능"
   BAD: "타겟이 좀 넓은 것 같습니다"

2. EVIDENCE TEST: Does this comment cite a specific fact, number, or comparison?
   GOOD: "Daylio(MAU 200만)가 이미 감정 트래킹을 하고 있고, 이 앱의 음성 입력이 충분한 차별점이 되려면 인식 정확도가 95% 이상이어야 함"
   BAD: "경쟁이 있을 수 있습니다"

3. POSITION TEST: Does this comment take a clear stance (strong/weak/risky)?
   GOOD: "이 BM은 약하다. 광고 기반 헬스케어 앱은 CPM이 $2-3 수준이라 DAU 10만 이하에서는 수익이 안 나온다"
   BAD: "BM이 잘 될 수도 있고 안 될 수도 있습니다"

=== ANTI-PATTERNS ===

- GENERIC PRAISE: "유망한 시장입니다", "잠재력이 있습니다" → WHY? 구체적 근거를 달아라
- HEDGE: "~할 수 있습니다", "~에 따라 다릅니다" → 입장을 정하고 이유를 써라
- REPEAT OVERVIEW: 개요서 내용을 다시 쓰지 마라. 개요서에 없는 새로운 관점을 줘라
- FAKE COMPARISON: 실제로 존재하는 서비스만 이름을 언급해라. 없으면 "직접적 경쟁자가 보이지 않는다"라고 써라
- SCORE/NUMBER: 점수, 등급, 숫자 평가를 절대 넣지 마라. "7/10", "B+", "상/중/하" 모두 금지.

=== COHERENCE CHECK ===

For each comment:
  □ Can the founder take a specific action from this? If not → rewrite with action.
  □ Does it take a clear stance? If "~할 수도" → pick a side.
  □ Is it NEW information, not repeating the overview? If repeat → add new angle.

For Korean:
  □ Does it sound like a 선배 PM talking honestly? If formal/translated → rewrite naturally.

=== OUTPUT FORMAT ===

{depth_config['output']}

=== RULES ===

- NO SCORES. No numbers. No ratings. No grades. Only sharp commentary.
- Korean and English must convey the SAME content, each sounding natural.
- Korean: 선배 PM이 솔직하게 말하는 톤. "이건 좀 약해" 수준의 직설.
- English: Professional but direct. "This is weak because..." not "This could potentially be challenging."
- NEVER fabricate data. If market research is insufficient, say "시장 데이터가 부족해서 판단이 어렵지만" and give your best assessment.
- Be a critic, not a consultant. "This fails because..." > "This could work if..."
- Every sentence should give the reader a clear signal: strong, weak, or uncertain."""


def _get_depth_config(depth: str) -> dict:
    """depth별 지시사항, 차원, 출력 포맷을 반환."""

    # 6축 전체 정의
    all_dimensions = """1. MARKET FIT (시장성)
   How real is the demand? Is the market growing, shrinking, or saturated?
   Who's already here? Is there room for a new entrant?

   GOOD: "헬스케어 AI 시장이 연 23% 성장 중이지만, 감정 트래킹 앱은 이미 Daylio, Moodpath가 MAU 100만+ 확보. 음성 AI라는 폼팩터가 차별화되려면 시니어 특화가 아닌 이상 어려울 수 있다"
   BAD: "시장이 성장하고 있어서 기회가 있습니다"

2. PROBLEM FIT (문제 적합성)
   Is this solving a real pain or a nice-to-have?
   How urgent is the problem? Would people actively SEEK a solution?

   GOOD: "매일 저녁 메뉴 고민은 실제 통증이지만, 지불 의사로 연결되기엔 '짜증' 수준이지 '절박함' 수준이 아니다. 광고 모델이 구독보다 맞을 수 있다"
   BAD: "사용자들이 이 문제를 가지고 있습니다"

3. FEASIBILITY (실행 가능성)
   Can a solo founder / small team build the MVP?
   What's the hardest technical challenge?

   GOOD: "OpenAI API + Expo로 2주 안에 MVP 가능. 가장 큰 기술 허들은 음식 추천의 위치 기반 필터링인데, Google Places API로 해결 가능"
   BAD: "기술적으로 구현 가능합니다"

4. DIFFERENTIATION (차별화 가능성)
   Is the differentiator real and defensible, or cosmetic?
   Could a competitor copy this in a week?

   GOOD: "스와이프 UI 자체는 2일이면 복제 가능. 진짜 moat는 취향 데이터가 쌓인 후의 추천 정확도인데, 이건 MAU 1만+ 되어야 의미 있다. 초기엔 방어 불가"
   BAD: "차별화된 기능이 있어서 경쟁력이 있습니다"

5. SCALABILITY (확장성)
   Can this grow beyond the initial niche?
   Are there network effects or switching costs?

   GOOD: "1인가구 음식 → 커플 음식 → 가족 식단으로 확장 가능. 하지만 네트워크 효과 없이 콘텐츠 추천이라 이탈 장벽이 낮다. 데이터 lock-in을 만들어야 한다"
   BAD: "확장 가능성이 있습니다"

6. RISK (리스크)
   What's the #1 reason this could fail?
   What assumption, if wrong, kills the entire idea?

   GOOD: "핵심 가정: 'Z세대가 음식 선택에 앱을 추가로 깔 의향이 있다'. 이미 배민/요기요가 추천을 하고 있어서, 별도 앱을 깔 이유가 약할 수 있다. 배민 내 플러그인이 더 현실적일 수도"
   BAD: "경쟁이 리스크입니다" """

    # Free: 3축만
    free_dimensions = """1. MARKET FIT (시장성)
   How real is the demand? Is the market growing, shrinking, or saturated?

   GOOD: "헬스케어 AI 시장이 연 23% 성장 중이지만, 감정 트래킹은 이미 Daylio가 MAU 100만+ 확보"
   BAD: "시장이 성장하고 있어서 기회가 있습니다"

2. FEASIBILITY (실행 가능성)
   Can a solo founder build the MVP? What's the hardest challenge?

   GOOD: "OpenAI API + Expo로 2주 안에 MVP 가능. 허들은 위치 기반 필터링"
   BAD: "기술적으로 구현 가능합니다"

3. RISK (리스크)
   What's the #1 reason this could fail?

   GOOD: "이미 배민/요기요가 추천을 하고 있어서, 별도 앱을 깔 이유가 약할 수 있다"
   BAD: "경쟁이 리스크입니다" """

    if depth == "basic_free":
        return {
            "instruction": """Write 1-2 sentences per dimension. 3 dimensions only.
Hit the ONE core insight per dimension. Nothing more.
Total should take under 30 seconds to read.""",
            "dimensions": free_dimensions,
            "output": """Respond ONLY with valid JSON:
{{{{
  "market_fit_ko": "한국어 1-2문장",
  "market_fit_en": "English 1-2 sentences",
  "feasibility_ko": "한국어 1-2문장",
  "feasibility_en": "English 1-2 sentences",
  "risk_ko": "한국어 1-2문장",
  "risk_en": "English 1-2 sentences"
}}}}""",
        }

    if depth == "basic":
        return {
            "instruction": """Write 1-2 sentences per dimension. All 6 dimensions.
Hit the ONE core insight per dimension.
Total should take under 1 minute to read.""",
            "dimensions": all_dimensions,
            "output": """Respond ONLY with valid JSON:
{{{{
  "market_fit_ko": "한국어 1-2문장",
  "market_fit_en": "English 1-2 sentences",
  "problem_fit_ko": "한국어 1-2문장",
  "problem_fit_en": "English 1-2 sentences",
  "feasibility_ko": "한국어 1-2문장",
  "feasibility_en": "English 1-2 sentences",
  "differentiation_ko": "한국어 1-2문장",
  "differentiation_en": "English 1-2 sentences",
  "scalability_ko": "한국어 1-2문장",
  "scalability_en": "English 1-2 sentences",
  "risk_ko": "한국어 1-2문장",
  "risk_en": "English 1-2 sentences"
}}}}""",
        }

    if depth == "precise_lite":
        return {
            "instruction": """Write 2-3 sentences per dimension. All 6 dimensions.
Include ONE specific evidence or reasoning per dimension.
Keep it tight — this should make the reader think "I want to see the full analysis."
Total should take 1-2 minutes to read.""",
            "dimensions": all_dimensions,
            "output": """Respond ONLY with valid JSON:
{{{{
  "market_fit_ko": "한국어 2-3문장, 근거 1개",
  "market_fit_en": "English 2-3 sentences, 1 evidence",
  "problem_fit_ko": "한국어 2-3문장",
  "problem_fit_en": "English 2-3 sentences",
  "feasibility_ko": "한국어 2-3문장",
  "feasibility_en": "English 2-3 sentences",
  "differentiation_ko": "한국어 2-3문장",
  "differentiation_en": "English 2-3 sentences",
  "scalability_ko": "한국어 2-3문장",
  "scalability_en": "English 2-3 sentences",
  "risk_ko": "한국어 2-3문장",
  "risk_en": "English 2-3 sentences"
}}}}""",
        }

    # precise_pro
    return {
        "instruction": """Write 3-5 sentences per dimension. All 6 dimensions. This is the FULL analysis.
For each dimension:
- Cite specific market data, competitor names, or industry trends from the research.
- Name comparable services with concrete details (funding, MAU, pricing).
- For risks, include "if [assumption] is wrong, then [consequence]" scenarios.
- For differentiation, analyze whether the moat is REAL (data, network effect, brand) or COSMETIC (UI, features).
- End each dimension with a clear verdict: strong, weak, or conditional.
Total should take 3-4 minutes to read.""",
        "dimensions": all_dimensions,
        "output": """Respond ONLY with valid JSON:
{{{{
  "market_fit_ko": "한국어 3-5문장, 근거 + 경쟁사 + 판정",
  "market_fit_en": "English 3-5 sentences, evidence + competitors + verdict",
  "problem_fit_ko": "한국어 3-5문장",
  "problem_fit_en": "English 3-5 sentences",
  "feasibility_ko": "한국어 3-5문장",
  "feasibility_en": "English 3-5 sentences",
  "differentiation_ko": "한국어 3-5문장, moat 분석",
  "differentiation_en": "English 3-5 sentences, moat analysis",
  "scalability_ko": "한국어 3-5문장, 확장 경로 + lock-in",
  "scalability_en": "English 3-5 sentences, expansion + lock-in",
  "risk_ko": "한국어 3-5문장, if-then 시나리오",
  "risk_en": "English 3-5 sentences, if-then scenarios"
}}}}""",
    }
