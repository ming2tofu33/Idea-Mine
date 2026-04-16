from app.services.ideation_v2.family_graph import FAMILY_SUBFAMILIES
from app.services.ideation_v2.mining import build_v2_mining_context


def _family_from_tier_type(tier_type: str | None) -> str | None:
    if not tier_type or "|" not in tier_type:
        return None
    family = tier_type.split("|", 1)[0]
    if family in FAMILY_SUBFAMILIES:
        return family
    return None


def build_v2_overview_input(
    selected_idea: dict,
    user_tier: str = "free",
) -> dict:
    kernel = selected_idea.get("v2_kernel")
    family = selected_idea.get("v2_family") or _family_from_tier_type(
        selected_idea.get("tier_type")
    )

    if kernel is None or family is None:
        context = build_v2_mining_context(
            selected_keywords=selected_idea.get("keyword_combo", []),
            user_tier=user_tier,
        )
        if kernel is None:
            kernel = context.kernel_set.primary_kernel.model_dump()
        if family is None:
            family = context.branch_plan.primary_family

    return {
        "title": selected_idea["title"],
        "idea_line": selected_idea["idea_line"],
        "summary": selected_idea["summary"],
        "kernel": kernel,
        "family": family,
    }
