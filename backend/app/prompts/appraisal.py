from typing import Literal


def build_appraisal_prompt(
    overview: dict,
    keywords: list[dict],
    market_research: str,
    depth: Literal["basic", "basic_free", "precise_lite", "precise_pro"] = "basic",
) -> tuple[str, str]:
    kw_list = ", ".join(f"{kw['label']} ({kw['category'].upper()})" for kw in keywords)

    overview_context = f"""Problem: {overview.get('problem', '')}
Target User: {overview.get('target', '')}
Core Features: {overview.get('features', '')}
Differentiator: {overview.get('differentiator', '')}
Business Model: {overview.get('revenue', '')}
MVP Scope: {overview.get('mvp_scope', '')}"""

    depth_config = _get_depth_config(depth)

    system_prompt = """You are a sharp, honest startup critic. Be specific and actionable. Generic praise is useless.

=== QUALITY TESTS ===

Before writing each comment, apply these tests:

1. ACTIONABLE TEST: Could the founder do something based on this comment?
2. EVIDENCE TEST: Does the comment cite a specific fact, number, or comparison?
3. POSITION TEST: Does the comment take a clear stance such as strong, weak, or conditional?

=== ANTI-PATTERNS ===

- GENERIC PRAISE: Do not say an idea is promising without saying why.
- HEDGE: Do not hide behind vague language like "could potentially".
- REPEAT OVERVIEW: Add analysis, not a summary of the overview.
- SCORE/NUMBER: Do not give scores, grades, or ratings.

=== RULES ===

- Write in English only.
- No scores. No ratings. No grades.
- Never fabricate market data. If research is thin, say so plainly and still make a judgment.
- Be a critic, not a cheerleader. "This fails because..." is better than "This could work if..."
- Every sentence should signal a stance: strong, weak, or uncertain.
"""

    user_prompt = f"""=== PROJECT OVERVIEW ===

{overview_context}

Keywords: {kw_list}

=== MARKET RESEARCH ===

{market_research}

=== APPRAISAL TASK ===

{depth_config['instruction']}

=== DIMENSIONS ===

{depth_config['dimensions']}"""

    return system_prompt, user_prompt


def _get_depth_config(depth: str) -> dict:
    all_dimensions = """1. MARKET FIT
   How real is the demand? Is the market growing, shrinking, or saturated?

2. PROBLEM FIT
   Is this solving a real pain or a nice-to-have? How urgent is the problem?

3. FEASIBILITY
   Can a solo founder or small team build the MVP? What is the hardest technical challenge?

4. DIFFERENTIATION
   Is the differentiator real and defensible, or mostly cosmetic?

5. SCALABILITY
   Can this grow beyond the initial niche? Are there network effects or switching costs?

6. RISK
   What is the number one reason this could fail? Which wrong assumption kills the idea?"""

    free_dimensions = """1. MARKET FIT
   How real is the demand? Is the market moving in the right direction?

2. FEASIBILITY
   Can a solo founder build the MVP? What is the hardest challenge?

3. RISK
   What is the main reason this could fail?"""

    if depth == "basic_free":
        return {
            "instruction": """Write 1-2 sentences per dimension. Use only 3 dimensions.
Hit the core insight fast. Total reading time should be under 30 seconds.""",
            "dimensions": free_dimensions,
        }

    if depth == "basic":
        return {
            "instruction": """Write 1-2 sentences per dimension across all 6 dimensions.
Hit the core insight per dimension. Total reading time should be under 1 minute.""",
            "dimensions": all_dimensions,
        }

    if depth == "precise_lite":
        return {
            "instruction": """Write 2-3 sentences per dimension across all 6 dimensions.
Include one concrete reason or evidence point per dimension.
Keep it tight enough to read in 1-2 minutes.""",
            "dimensions": all_dimensions,
        }

    return {
        "instruction": """Write 3-5 sentences per dimension across all 6 dimensions.
Use specific market data, competitor names, and concrete reasoning when available.
End each dimension with a clear verdict: strong, weak, or conditional.
Total reading time should be 3-4 minutes.""",
        "dimensions": all_dimensions,
    }
