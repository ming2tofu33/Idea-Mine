def build_overview_prompt(
    title_ko: str,
    title_en: str,
    summary_ko: str,
    summary_en: str,
    keywords: list[dict],
    market_research: str,
) -> str:
    """개요서 생성 프롬프트 v3.1.

    변경 이력:
    - v1: 기본 개요서
    - v2: Tavily 시장 데이터 주입
    - v3: 감정(평가) 완전 분리. 차별점/MVP 범위 추가. 점수 제거. 모델 gpt-4o.
    - v3.1: Product Concept 선행 단계 추가. 키워드 역할 명시.
            안티패턴 + 코히런스 체크로 B2B/B2C 혼동 방지.
    """
    # 키워드를 역할별로 분류하여 전달
    kw_by_role: dict[str, str] = {}
    for kw in keywords:
        kw_by_role[kw["category"].upper()] = kw["en"]

    role_labels = {
        "WHO": "이 사람이 직접 쓴다 (end user)",
        "TECH": "이 형태로 만든다 (product form)",
        "AI": "이 기술을 내부에 쓴다 (embedded tech, NOT the product itself)",
        "DOMAIN": "이 산업에 속한다 (industry)",
        "VALUE": "이 가치를 준다 (core value)",
        "MONEY": "이렇게 돈을 번다 (revenue model)",
    }

    kw_lines = []
    for cat in ["WHO", "TECH", "AI", "DOMAIN", "VALUE", "MONEY"]:
        if cat in kw_by_role:
            kw_lines.append(f"  {cat} — {role_labels.get(cat, '')}: {kw_by_role[cat]}")

    kw_block = "\n".join(kw_lines)

    return f"""You are a senior startup advisor writing a concise project overview.

=== INPUT ===

Idea: {title_en}
Summary: {summary_en}

Keywords (with roles — read these carefully):
{kw_block}

=== MARKET CONTEXT (from web search) ===

{market_research}

=== STEP 0: PRODUCT CONCEPT (do this first, include in response) ===

Before writing anything else, generate a ONE-SENTENCE product concept that connects the keywords:

"A [TECH] for [WHO] that uses [AI] to deliver [VALUE] in [DOMAIN], monetized via [MONEY]."

This sentence MUST drive every section that follows.
If you find yourself describing something that doesn't match this concept, stop and realign.

=== STEP 1: SECTIONS (each section: 3-5 sentences, be specific not generic) ===

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
   - Name 1-2 specific competitors or workarounds THE TARGET USER actually knows.
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

=== ANTI-PATTERNS (do NOT do these) ===

- Do NOT build a developer API/SDK/platform when WHO is a consumer.
  The AI technology is EMBEDDED in the product, not sold as a standalone service.
  Wrong: "An emotion analysis API for developers"
  Right: "A mobile app that uses emotion AI to check in on your mood daily"

- Do NOT list pricing structure, business model, or monetization as a "core feature."
  Features are things the USER interacts with.

- Do NOT compare with enterprise platforms (IBM, AWS, Google Cloud) when WHO is an individual.
  Compare with products the TARGET USER actually uses or considers.
  Wrong: "Unlike IBM Watson's sentiment API..."
  Right: "Unlike Calm which only offers guided meditation..."

- Do NOT describe a B2B tool when WHO is a consumer persona.
  If the target is a person (not a company), the product must be something they download/open/use directly.

=== COHERENCE CHECK (verify before outputting) ===

Before generating the final JSON, verify:
1. Would the target user (WHO) actually open/use each core feature?
2. Does the product form match TECH?
3. Is every feature something WHO would understand without technical knowledge?
4. Does the differentiator compare against products WHO actually knows?
5. Does the concept sentence still describe what you wrote?
If any check fails, revise that section.

=== OUTPUT FORMAT ===

Respond ONLY with valid JSON:
{{{{
  "concept_en": "One-sentence product concept (from Step 0)",
  "concept_ko": "한국어 한 줄 제품 컨셉 (Step 0)",
  "problem_ko": "한국어 문제 정의 (3-5문장)",
  "problem_en": "English problem definition (3-5 sentences)",
  "target_ko": "한국어 타겟 유저 (3-5문장, 생생한 페르소나)",
  "target_en": "English target user (3-5 sentences, vivid persona)",
  "features_ko": "• 기능1: 설명 — 이유\\n• 기능2: 설명 — 이유\\n• 기능3: 설명 — 이유\\n• 기능4: 설명 — 이유",
  "features_en": "• Feature1: desc — why\\n• Feature2: desc — why\\n• Feature3: desc — why\\n• Feature4: desc — why",
  "differentiator_ko": "한국어 차별점 (3-5문장, 타겟이 아는 경쟁자 언급)",
  "differentiator_en": "English differentiator (3-5 sentences, competitors target knows)",
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
