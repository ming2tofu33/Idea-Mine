def build_overview_prompt(
    title_ko: str,
    title_en: str,
    summary_ko: str,
    summary_en: str,
    keywords: list[dict],
    market_research: str,
) -> str:
    """개요서 생성 프롬프트 v2. Tavily 시장 데이터 기반 근거 있는 개요서."""
    kw_list = ", ".join(f"{kw['en']} ({kw['category'].upper()})" for kw in keywords)

    return f"""You are a senior startup analyst writing a project overview for IDEA MINE.

=== INPUT ===

Idea Title: {title_en}
Idea Summary: {summary_en}
Keywords: {kw_list}

=== MARKET RESEARCH (from web search) ===

{market_research}

=== YOUR TASK ===

Write a PROJECT OVERVIEW that a founder could actually use to evaluate this idea.
Use the market research data above as evidence — cite specific numbers, trends, or competitors when available.

=== SECTIONS ===

1. PROBLEM (3-5 sentences):
   - What specific pain point does this solve?
   - Who experiences this pain, and how often?
   - Why do existing solutions fall short?
   - Reference any relevant market data from the research above.

2. TARGET USER (3-5 sentences):
   - Describe ONE specific persona (age range, occupation, behavior pattern)
   - What does their day look like? When does this product fit in?
   - What's their current workaround?
   - How big is this user segment?

3. CORE FEATURES (4-5 bullet points):
   - Each feature: "[Feature Name]: [What it does] — [Why it matters]"
   - Order by priority (most critical first)
   - Think MVP — what's the minimum to deliver value?

4. REVENUE MODEL (3-5 sentences):
   - Specific pricing suggestion (e.g., "$9.99/month")
   - Benchmark against similar services from the research
   - Free-to-paid conversion scenario
   - Revenue projection hint (e.g., "1000 users × $10 = $10K MRR")

=== APPRAISAL ===

Rate on 1-10 scale with EVIDENCE-BASED comments:

MARKET_SCORE: Market size, growth trend, competition level, timing.
- Score 1-3: Tiny/saturated market
- Score 4-6: Moderate opportunity
- Score 7-10: Large/growing/underserved market
- Comment MUST reference specific data from the market research.

FEASIBILITY_SCORE: Technical complexity, team requirements, time to MVP.
- Score 1-3: Requires deep tech, large team, 6+ months
- Score 4-6: Moderate complexity, small team, 3-4 months
- Score 7-10: Standard tech stack, solo/duo, 1-2 months
- Comment MUST be specific about what tech is needed.

=== RESPONSE FORMAT ===

Respond ONLY with valid JSON. Generate BOTH Korean and English:
{{{{
  "problem_ko": "한국어 문제 정의 (3-5문장, 구체적 근거 포함)",
  "problem_en": "English problem definition (3-5 sentences, with evidence)",
  "target_ko": "한국어 타깃 유저 페르소나 (3-5문장)",
  "target_en": "English target user persona (3-5 sentences)",
  "features_ko": "• 기능1: 설명 — 이유\\n• 기능2: 설명 — 이유\\n• 기능3: 설명 — 이유\\n• 기능4: 설명 — 이유",
  "features_en": "• Feature1: description — why\\n• Feature2: description — why\\n• Feature3: description — why\\n• Feature4: description — why",
  "revenue_ko": "한국어 수익 모델 (구체적 가격, 벤치마크 포함)",
  "revenue_en": "English revenue model (specific pricing, benchmarks)",
  "market_score": 7,
  "market_comment_ko": "한국어 시장성 근거 (데이터 인용)",
  "market_comment_en": "English market evidence (cite data)",
  "feasibility_score": 8,
  "feasibility_comment_ko": "한국어 실행성 근거 (기술 스택 명시)",
  "feasibility_comment_en": "English feasibility evidence (specific tech)"
}}}}

CRITICAL RULES:
- Korean and English must convey the SAME content, each feeling natural
- features MUST use bullet points with • separator and \\n between items
- NEVER make up statistics — only cite data from the market research section
- If no relevant data found, say "시장 데이터 추가 조사 필요" / "Further market research needed"
- Scores MUST be integers 1-10"""
