from pydantic import BaseModel


class FamilyScore(BaseModel):
    family: str
    score: float
    reasons: list[str]


FAMILIES = [
    "workflow_utility",
    "workspace_studio",
    "dashboard_ops",
    "assistant_copilot",
    "agent_automation",
    "platform_network",
    "real_world_companion",
]


def score_families(seed, kernel_set) -> dict[str, FamilyScore]:
    raw = {family: 0.0 for family in FAMILIES}
    reasons: dict[str, list[str]] = {family: [] for family in FAMILIES}

    if seed.physical_world_relevance > 0.5:
        raw["real_world_companion"] += 1.0
        raw["dashboard_ops"] += 0.3
        reasons["real_world_companion"].append("seed signals physical-world relevance")
        reasons["dashboard_ops"].append("physical context supports operational handling")
    if "while browsing" in seed.environments:
        raw["workflow_utility"] += 0.8
        raw["assistant_copilot"] += 0.4
        reasons["workflow_utility"].append("seed mentions browsing context")
        reasons["assistant_copilot"].append("browsing context favors assisted flow")
    if seed.outcomes:
        raw["workspace_studio"] += 0.2
        reasons["workspace_studio"].append("seed includes a concrete outcome")

    primary_kernel = kernel_set.primary_kernel
    if primary_kernel.primary_environment:
        raw["real_world_companion"] += 0.1
        reasons["real_world_companion"].append(
            f"kernel anchors the scenario in {primary_kernel.primary_environment}"
        )

    max_score = max(raw.values()) or 1.0
    return {
        family: FamilyScore(
            family=family,
            score=score / max_score,
            reasons=reasons[family],
        )
        for family, score in raw.items()
    }
