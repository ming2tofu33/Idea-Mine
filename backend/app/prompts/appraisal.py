from typing import Literal


def build_appraisal_prompt(
    overview: dict,
    keywords: list[dict],
    market_research: str,
    depth: Literal["basic", "precise", "deep"] = "basic",
) -> str:
    """감정 프롬프트 v1.

    depth:
    - basic: Free/Lite — 축당 1~2문장. 핵심만.
    - precise: Lite(얕은)/Pro(풀) — 축당 2~4문장. 근거 포함.
    - deep: Pro 심층 감정 리포트 — 축당 4~6문장. 경쟁사 분석, 리스크 시나리오.
    """
    kw_list = ", ".join(f"{kw['en']} ({kw['category'].upper()})" for kw in keywords)

    # 개요서 내용을 컨텍스트로 전달
    overview_context = f"""Problem: {overview.get('problem_en', '')}
Target User: {overview.get('target_en', '')}
Core Features: {overview.get('features_en', '')}
Differentiator: {overview.get('differentiator_en', '')}
Business Model: {overview.get('revenue_en', '')}
MVP Scope: {overview.get('mvp_scope_en', '')}"""

    depth_instruction = _get_depth_instruction(depth)

    return f"""You are a sharp, honest startup critic — not a cheerleader.

Your job is to APPRAISE this project idea across multiple dimensions.
Be specific and actionable. Generic praise like "promising market" is worthless.
If something is weak, say so directly. If something is strong, explain WHY.

=== PROJECT OVERVIEW ===

{overview_context}

Keywords: {kw_list}

=== MARKET RESEARCH ===

{market_research}

=== APPRAISAL TASK ===

Evaluate this idea across 6 dimensions. {depth_instruction}

DIMENSIONS:

1. MARKET FIT (시장성)
   How real is the demand? Is the market growing, shrinking, or saturated?
   Who's already here? Is there room for a new entrant?

2. PROBLEM FIT (문제 적합성)
   Is this solving a real pain or a nice-to-have?
   How urgent is the problem? How often does it occur?
   Would people actively SEEK a solution, or just tolerate the status quo?

3. FEASIBILITY (실행 가능성)
   Can a solo founder / small team build the MVP?
   What's the hardest technical challenge?
   What existing tools/APIs make this easier?

4. DIFFERENTIATION (차별화 가능성)
   Is the differentiator real and defensible, or cosmetic?
   Could a competitor copy this in a week?
   Does the keyword combination create a genuine structural advantage?

5. SCALABILITY (확장성)
   Can this grow beyond the initial niche?
   What are the natural expansion paths?
   Are there network effects or switching costs?

6. RISK (리스크)
   What's the #1 reason this could fail?
   Are there regulatory, technical, or market risks?
   What assumption, if wrong, kills the entire idea?

=== OUTPUT FORMAT ===

Respond ONLY with valid JSON:
{{{{
  "market_fit_ko": "한국어 시장성 코멘트",
  "market_fit_en": "English market fit comment",
  "problem_fit_ko": "한국어 문제 적합성 코멘트",
  "problem_fit_en": "English problem fit comment",
  "feasibility_ko": "한국어 실행 가능성 코멘트",
  "feasibility_en": "English feasibility comment",
  "differentiation_ko": "한국어 차별화 가능성 코멘트",
  "differentiation_en": "English differentiation comment",
  "scalability_ko": "한국어 확장성 코멘트",
  "scalability_en": "English scalability comment",
  "risk_ko": "한국어 리스크 코멘트",
  "risk_en": "English risk comment"
}}}}

=== RULES ===

- NO SCORES. No numbers. No ratings. Only sharp commentary.
- Korean and English must convey the SAME content, each sounding natural.
- NEVER fabricate data. If market research is insufficient, say so.
- Be a critic, not a consultant. "This could work if..." is weaker than "This fails because..."
- Every sentence should give the reader a clear signal: strong, weak, or uncertain.
- Avoid hedging with "it depends" — take a position and explain why."""


def _get_depth_instruction(depth: str) -> str:
    if depth == "basic":
        return """Write 1-2 sentences per dimension. Hit the core insight only.
Think: "If I could say one thing about this dimension, what would it be?"
Total response should take under 1 minute to read."""

    if depth == "precise":
        return """Write 2-4 sentences per dimension. Include specific evidence or reasoning.
Reference market research data when available.
Name competitors or comparable services when relevant.
Total response should take 2-3 minutes to read."""

    # deep
    return """Write 4-6 sentences per dimension. This is a thorough analysis.
Reference specific market data, competitor strategies, and industry trends.
Include "what if" scenarios for risks.
Suggest specific actions to address weaknesses.
For differentiation, analyze whether the moat is real or illusory.
Total response should take 4-5 minutes to read."""
