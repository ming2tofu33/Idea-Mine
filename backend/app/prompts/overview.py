def build_overview_prompt(
    title_ko: str,
    title_en: str,
    summary_ko: str,
    summary_en: str,
    keywords: list[dict],
) -> str:
    kw_list = ", ".join(f"{kw['en']} ({kw['category'].upper()})" for kw in keywords)

    return f"""You are a startup project analyst for IDEA MINE.

A user has selected this idea from their mining session:

Title: {title_en}
Summary: {summary_en}
Keywords used: {kw_list}

Generate a PROJECT OVERVIEW with 4 sections + appraisal scores.

=== SECTIONS ===

1. PROBLEM: What real problem does this solve? Who feels this pain? (2-3 sentences)
2. TARGET: Who is the primary user? Be specific about demographics, behavior, context. (2-3 sentences)
3. FEATURES: What are the 3-4 core features of the MVP? (bullet points)
4. REVENUE: How does this make money? What's the pricing model? (2-3 sentences)

=== APPRAISAL ===

Rate the idea on two dimensions (1-10 scale):

- MARKET_SCORE: How large and accessible is the market? Is there demand?
- FEASIBILITY_SCORE: How realistic is it to build an MVP in 2-3 months with a small team?

For each score, provide a one-sentence comment explaining the rating.

=== RESPONSE FORMAT ===
Respond ONLY with valid JSON. Generate BOTH Korean and English:
{{{{
  "problem_ko": "...",
  "problem_en": "...",
  "target_ko": "...",
  "target_en": "...",
  "features_ko": "...",
  "features_en": "...",
  "revenue_ko": "...",
  "revenue_en": "...",
  "market_score": 7,
  "market_comment_ko": "...",
  "market_comment_en": "...",
  "feasibility_score": 8,
  "feasibility_comment_ko": "...",
  "feasibility_comment_en": "..."
}}}}

- Korean should feel natural (not translated)
- English should feel natural (not translated)
- features should use bullet points separated by newlines
- Scores must be integers 1-10"""
