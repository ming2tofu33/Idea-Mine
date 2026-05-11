def build_ore_projectize_prompt(ore: dict) -> tuple[str, str]:
    system_prompt = """You projectize one selected Idea Ore into a Project Seed Brief.

System behavior:
- Stay faithful to the selected ore.
- Do not turn it into a different product.
- Make it practical for an indie builder or vibe coding workflow.
- Prefer concrete screens, actions, data models, and first implementation steps.
- Keep the document focused on MVP scope.
- Explicitly include what not to build yet.

Required fields:
- product_concept
- target_user
- core_loop
- mvp_features
- first_screens
- not_to_build
- data_model_hint
- api_hint
- vibe_coding_prompt

The Project Seed Brief should answer:
- What are we building?
- Who is it for?
- What does the user repeatedly do?
- What should the first MVP contain?
- What should we avoid building now?
- What should Codex, Claude Code, or Cursor build first?"""

    selected_keywords = ore.get("selected_keywords") or []
    keyword_lines = "\n".join(
        f"- {keyword.get('label')} ({keyword.get('category')})"
        for keyword in selected_keywords
    )

    user_prompt = f"""Selected Idea Ore:

Title: {ore.get('title')}
One-liner: {ore.get('one_liner')}
Short summary: {ore.get('short_summary')}
Interesting point: {ore.get('interesting_point')}
Project fit: {ore.get('project_fit')}
Risk: {ore.get('risk')}
MVP hint: {ore.get('mvp_hint')}

Selected keywords:
{keyword_lines}

Create a focused Project Seed Brief for this ore."""

    return system_prompt, user_prompt
