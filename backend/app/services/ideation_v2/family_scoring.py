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
    surface_texts = [hint.lower() for hint in seed.surface_hints + seed.mechanism_hints]
    premium_texts = [hint.lower() for hint in seed.premium_modifiers]
    environment_texts = [hint.lower() for hint in seed.environments]
    browser_context = surface_texts
    has_browser_context = any("browser" in hint for hint in browser_context)
    has_dashboard_surface = any(
        term in hint
        for hint in surface_texts
        for term in ["dashboard", "data visualization"]
    )
    has_platform_surface = any(
        term in hint
        for hint in surface_texts
        for term in ["marketplace", "community platform", "api service"]
    )
    has_automation_surface = any(
        term in hint
        for hint in surface_texts
        for term in ["automation workflow"]
    )
    has_assistant_surface = any(
        term in hint
        for hint in surface_texts
        for term in ["chatbot", "voice interface", "slack/discord bot", "plugin/widget"]
    )
    has_real_world_surface = any(
        term in hint
        for hint in surface_texts
        for term in ["wearable", "iot/sensor"]
    )
    has_agent_modifier = any(term in hint for hint in premium_texts for term in ["agent", "copilot"])
    has_generation_modifier = any(
        term in hint for hint in premium_texts for term in ["image generation", "generative ai"]
    )
    has_retrieval_modifier = any(
        term in hint
        for hint in premium_texts
        for term in ["rag", "vector search", "knowledge graph", "document understanding"]
    )
    has_prediction_modifier = any(
        term in hint
        for hint in premium_texts
        for term in ["recommendation", "predictive ai", "emotion ai"]
    )
    has_edge_modifier = any(
        term in hint for hint in premium_texts for term in ["on-device", "edge ai"]
    )
    has_ops_environment = any(
        term in hint
        for hint in environment_texts
        for term in ["devops/infra", "martech", "salestech", "hr-tech", "designtech"]
    )
    has_network_environment = any(
        term in hint
        for hint in environment_texts
        for term in ["creator economy", "k-culture", "proptech"]
    )
    has_physical_environment = any(
        term in hint
        for hint in environment_texts
        for term in ["smart home", "healthcare", "pet care", "sleeptech", "climatetech"]
    )

    if seed.physical_world_relevance > 0.5:
        raw["real_world_companion"] += 1.0
        raw["dashboard_ops"] += 0.3
        reasons["real_world_companion"].append("seed signals physical-world relevance")
        reasons["dashboard_ops"].append("physical context supports operational handling")
    if "while browsing" in seed.environments or "while browsing" in seed.surface_hints:
        raw["workflow_utility"] += 0.8
        raw["assistant_copilot"] += 0.4
        reasons["workflow_utility"].append("seed mentions browsing context")
        reasons["assistant_copilot"].append("browsing context favors assisted flow")
    if has_browser_context:
        raw["workflow_utility"] += 0.6
        raw["assistant_copilot"] += 0.3
        reasons["workflow_utility"].append("browser-shaped delivery fits quick utility")
        reasons["assistant_copilot"].append("browser delivery supports sidecar assistance")
    if has_dashboard_surface or has_ops_environment:
        raw["dashboard_ops"] += 0.9
        reasons["dashboard_ops"].append("ops-oriented surface favors dashboard workflows")
    if has_platform_surface or has_network_environment:
        raw["platform_network"] += 0.9
        reasons["platform_network"].append("networked product form favors platform coordination")
    if has_automation_surface:
        raw["agent_automation"] += 0.9
        reasons["agent_automation"].append("automation workflow implies delegated execution")
    if has_assistant_surface:
        raw["assistant_copilot"] += 0.8
        reasons["assistant_copilot"].append("conversational or sidecar interface favors assistance")
    if has_real_world_surface or has_physical_environment:
        raw["real_world_companion"] += 0.8
        reasons["real_world_companion"].append("device-linked or physical domain favors companion products")
    if has_agent_modifier:
        raw["assistant_copilot"] += 0.6
        raw["agent_automation"] += 0.6
        reasons["assistant_copilot"].append("agentic AI expands assisted execution")
        reasons["agent_automation"].append("agentic AI supports delegated workflow steps")
    if has_generation_modifier:
        raw["workspace_studio"] += 0.6
        reasons["workspace_studio"].append("generation-oriented AI fits creative work surfaces")
    if has_retrieval_modifier:
        raw["assistant_copilot"] += 0.4
        raw["workspace_studio"] += 0.4
        raw["platform_network"] += 0.2
        reasons["assistant_copilot"].append("retrieval AI supports contextual guidance")
        reasons["workspace_studio"].append("retrieval AI supports deeper work sessions")
        reasons["platform_network"].append("retrieval AI can strengthen shared knowledge surfaces")
    if has_prediction_modifier:
        raw["dashboard_ops"] += 0.4
        raw["assistant_copilot"] += 0.3
        reasons["dashboard_ops"].append("predictive AI supports monitoring and triage")
        reasons["assistant_copilot"].append("predictive AI can guide the next action")
    if has_edge_modifier:
        raw["real_world_companion"] += 0.5
        reasons["real_world_companion"].append("edge or on-device AI fits real-world companion experiences")
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
