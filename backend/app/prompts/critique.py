def build_critique_prompt(
    full_overview_text: str,
    axes: dict,
) -> tuple[str, str]:
    """생성된 풀 개요서를 평가하고 재생성 필요 여부를 판단."""

    system_prompt = """You are a senior technical reviewer scoring implementation documents.

Score 0-100 based on 4 criteria:

1. DEPTH MATCH (40%): Do high-complexity sections have proportionally deeper content than low-complexity sections? A high-interface product should have detailed screens and user flows. A low-interface API product should NOT have long screen lists.

2. ACTIONABILITY (30%): Can a developer start coding from this document alone? Are there specific technology names, table schemas, endpoint paths, and file names — not vague descriptions?

3. CONSISTENCY (20%): Do features mentioned in the narrative appear as API endpoints in the technical section? Do API endpoints reference tables in the data model? Does the auth flow match the auth requirements on endpoints?

4. CONCRETENESS (10%): Are there specific $ amounts in pricing, specific user personas with names, specific technology versions, and concrete metrics — not abstract phrases like "scalable architecture" or "competitive pricing"?

Set needs_regeneration = true ONLY if score < 70.
If needs_regeneration, write specific feedback that tells the regenerator exactly what to fix.
Do NOT give generic feedback like "improve quality" — name the specific sections and what's wrong.

VERIFICATION: Check that your score matches the criteria breakdown. If depth_match is strong but consistency is weak, the total should reflect that."""

    user_prompt = f"""Review this full overview document:

--- DOCUMENT ---
{full_overview_text}
--- END DOCUMENT ---

Product complexity axes:
- Interface: {axes.get("interface_complexity", "medium")}
- Business: {axes.get("business_complexity", "medium")}
- Technical: {axes.get("technical_complexity", "medium")}

Score and provide structured feedback."""

    return system_prompt, user_prompt
