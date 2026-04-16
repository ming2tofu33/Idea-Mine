FAMILY_SUBFAMILIES = {
    "workflow_utility": [
        "browser_extension",
        "overlay_tool",
        "quick_capture_tool",
    ],
    "workspace_studio": [
        "drafting_workspace",
        "planning_canvas",
        "creator_workbench",
    ],
    "dashboard_ops": [
        "operator_console",
        "monitoring_hub",
        "team_dashboard",
    ],
    "assistant_copilot": [
        "side_panel",
        "context_assistant",
        "guided_copilot",
    ],
    "agent_automation": [
        "workflow_agent",
        "delegate_agent",
        "automation_runner",
    ],
    "platform_network": [
        "integration_layer",
        "shared_marketplace",
        "coordination_platform",
    ],
    "real_world_companion": [
        "device_companion_app",
        "field_ops_companion",
        "sensor_console",
    ],
}

ADJACENT_FAMILIES = {
    "workflow_utility": {"assistant_copilot", "workspace_studio"},
    "workspace_studio": {"workflow_utility", "assistant_copilot", "dashboard_ops"},
    "dashboard_ops": {"workspace_studio", "agent_automation", "real_world_companion"},
    "assistant_copilot": {"workflow_utility", "workspace_studio", "agent_automation"},
    "agent_automation": {"assistant_copilot", "dashboard_ops", "platform_network"},
    "platform_network": {"agent_automation"},
    "real_world_companion": {"dashboard_ops"},
}


def get_adjacent_families(family: str) -> set[str]:
    return set(ADJACENT_FAMILIES.get(family, set()))


def get_far_families(family: str) -> set[str]:
    adjacent = get_adjacent_families(family)
    return {
        candidate
        for candidate in FAMILY_SUBFAMILIES
        if candidate != family and candidate not in adjacent
    }


def get_allowed_subfamilies(family: str) -> list[str]:
    return list(FAMILY_SUBFAMILIES.get(family, []))
