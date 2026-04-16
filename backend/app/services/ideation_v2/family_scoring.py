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
    if seed.physical_world_relevance > 0.5:
        raw["real_world_companion"] += 1.0
        raw["dashboard_ops"] += 0.3
    if "while browsing" in seed.environments:
        raw["workflow_utility"] += 0.8
        raw["assistant_copilot"] += 0.4
    if seed.outcomes:
        raw["workspace_studio"] += 0.2

    max_score = max(raw.values()) or 1.0
    return {
        family: FamilyScore(family=family, score=score / max_score, reasons=[])
        for family, score in raw.items()
    }
