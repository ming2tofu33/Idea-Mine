def build_overview_prompt(
    title_ko: str,
    title_en: str,
    summary_ko: str,
    summary_en: str,
    keywords: list[dict],
    market_research: str,
) -> str:
    """개요서 생성 프롬프트 v3.

    변경 이력:
    - v1: 기본 개요서
    - v2: Tavily 시장 데이터 주입
    - v3: 감정(평가) 완전 분리. 개요서는 순수 설명만.
          차별점/MVP 범위 섹션 추가. 점수 제거.
          모델: gpt-4o-mini → gpt-4o
    """
    kw_list = ", ".join(f"{kw['en']} ({kw['category'].upper()})" for kw in keywords)

    return f"""You are a senior startup advisor writing a concise project overview.

=== INPUT ===

Idea: {title_en}
Summary: {summary_en}
Keywords: {kw_list}

=== MARKET CONTEXT (from web search) ===

{market_research}

=== YOUR TASK ===

Write a PROJECT OVERVIEW — a "first draft pitch" that lets a founder understand what this project is in under 2 minutes.

This is NOT an evaluation. Do NOT score or judge the idea. Just describe it clearly and specifically.

=== SECTIONS (each section: 3-5 sentences, be specific not generic) ===

1. PROBLEM
   - What specific pain does this solve? Who feels it, how often?
   - What do people do today? Why is that not good enough?
   - Ground this in real behavior, not hypothetical scenarios.
   - Reference market research data when available.

2. TARGET USER
   - Describe ONE vivid persona. Give them a context, not just demographics.
   - What does their week look like? When would they reach for this product?
   - What's their current workaround? Why is it frustrating?
   - Be specific enough that a reader says "I know someone like this."

3. CORE FEATURES (4-5 bullet points)
   - Format: "Feature Name: what it does — why it matters"
   - Order by criticality (most essential first)
   - Only include what's needed for the first working version.
   - Each feature must directly address the problem or serve the target user.

4. DIFFERENTIATOR
   - Why would someone use THIS instead of existing alternatives?
   - Name 1-2 specific competitors or workarounds and explain the gap.
   - The answer should NOT be "better UX" or "AI-powered" — those are generic.
   - What structural advantage does this keyword combination create?

5. BUSINESS MODEL
   - Suggest a specific pricing structure (free tier, paid tier, price point).
   - Who pays and why? What's the value they're buying?
   - Reference comparable services from the market research for benchmarking.
   - Keep it realistic for a solo founder / small team.

6. MVP SCOPE
   - What would a 4-week MVP look like?
   - What's IN (must-have for first version) vs OUT (defer to later)?
   - What's the ONE thing users must experience to say "this is useful"?
   - What's the cheapest way to test if people want this?

=== OUTPUT FORMAT ===

Respond ONLY with valid JSON:
{{{{
  "problem_ko": "한국어 문제 정의 (3-5문장)",
  "problem_en": "English problem definition (3-5 sentences)",
  "target_ko": "한국어 타겟 유저 (3-5문장, 생생한 페르소나)",
  "target_en": "English target user (3-5 sentences, vivid persona)",
  "features_ko": "• 기능1: 설명 — 이유\\n• 기능2: 설명 — 이유\\n• 기능3: 설명 — 이유\\n• 기능4: 설명 — 이유",
  "features_en": "• Feature1: desc — why\\n• Feature2: desc — why\\n• Feature3: desc — why\\n• Feature4: desc — why",
  "differentiator_ko": "한국어 차별점 (3-5문장, 구체적 경쟁사/대안 언급)",
  "differentiator_en": "English differentiator (3-5 sentences, name competitors)",
  "revenue_ko": "한국어 BM 초안 (3-5문장, 벤치마크 포함)",
  "revenue_en": "English BM draft (3-5 sentences, with benchmarks)",
  "mvp_scope_ko": "한국어 MVP 범위 (IN/OUT 구분, 4주 기준)",
  "mvp_scope_en": "English MVP scope (IN/OUT, 4-week target)"
}}}}

=== RULES ===

- Korean and English must convey the SAME content, each sounding natural.
- features MUST use • bullet points with \\n separators.
- NEVER fabricate statistics. Only cite data from the market research section.
- If no market data is available, say so honestly.
- Do NOT include scores, ratings, or evaluations. This is description only.
- Be specific. "Users aged 25-40 who value convenience" is too vague.
  "Solo freelancers who lose 2+ hours/week switching between invoice tools" is specific.
- Avoid generic AI startup clichés ("leveraging AI to revolutionize...").
  Describe what the product actually does in plain language."""
