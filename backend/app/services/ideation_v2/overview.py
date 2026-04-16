from app.services.ideation_v2.mining import build_v2_mining_context


def build_v2_overview_input(
    selected_idea: dict,
    user_tier: str = "free",
) -> dict:
    kernel = selected_idea.get("v2_kernel")
    family = selected_idea.get("v2_family")

    if kernel is None or family is None:
        context = build_v2_mining_context(
            selected_keywords=selected_idea.get("keyword_combo", []),
            user_tier=user_tier,
        )
        kernel = context.kernel_set.primary_kernel.model_dump()
        family = context.branch_plan.primary_family

    return {
        "title": selected_idea["title"],
        "idea_line": selected_idea["idea_line"],
        "summary": selected_idea["summary"],
        "kernel": kernel,
        "family": family,
    }
