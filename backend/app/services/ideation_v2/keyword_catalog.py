from pydantic import BaseModel


class KeywordMetadata(BaseModel):
    label: str
    primary_role: str | None
    secondary_roles: list[str]
    family_bias: list[str]
    premium_only: bool


def _metadata(
    label: str,
    *,
    primary_role: str | None,
    secondary_roles: list[str] | None = None,
    family_bias: list[str] | None = None,
    premium_only: bool = False,
) -> KeywordMetadata:
    return KeywordMetadata(
        label=label,
        primary_role=primary_role,
        secondary_roles=secondary_roles or [],
        family_bias=family_bias or [],
        premium_only=premium_only,
    )


CATALOG = {
    "smart home": _metadata(
        "smart home",
        primary_role="mechanism_hint",
        secondary_roles=["environment"],
        family_bias=["real_world_companion", "dashboard_ops"],
    ),
    "solo creator": _metadata("solo creator", primary_role="actor"),
    "scattered research": _metadata("scattered research", primary_role="tension"),
    "usable first draft": _metadata("usable first draft", primary_role="outcome"),
    "while browsing": _metadata("while browsing", primary_role="surface_hint"),
    "browser-based": _metadata("browser-based", primary_role="mechanism_hint"),
    "browser extension": _metadata(
        "browser extension",
        primary_role="surface_hint",
        family_bias=["workflow_utility", "assistant_copilot"],
    ),
    "dashboard": _metadata(
        "dashboard",
        primary_role="surface_hint",
        family_bias=["dashboard_ops"],
    ),
    "marketplace": _metadata(
        "marketplace",
        primary_role="surface_hint",
        family_bias=["platform_network"],
    ),
    "community platform": _metadata(
        "community platform",
        primary_role="surface_hint",
        family_bias=["platform_network"],
    ),
    "api service": _metadata(
        "api service",
        primary_role="surface_hint",
        family_bias=["platform_network", "agent_automation"],
    ),
    "automation workflow": _metadata(
        "automation workflow",
        primary_role="surface_hint",
        family_bias=["agent_automation"],
    ),
    "desktop app": _metadata(
        "desktop app",
        primary_role="surface_hint",
        family_bias=["workspace_studio"],
    ),
    "mobile app": _metadata(
        "mobile app",
        primary_role="surface_hint",
        family_bias=["assistant_copilot"],
    ),
    "chatbot": _metadata(
        "chatbot",
        primary_role="surface_hint",
        family_bias=["assistant_copilot"],
    ),
    "voice interface": _metadata(
        "voice interface",
        primary_role="surface_hint",
        family_bias=["assistant_copilot", "real_world_companion"],
    ),
    "plugin/widget": _metadata(
        "plugin/widget",
        primary_role="surface_hint",
        family_bias=["assistant_copilot", "workflow_utility"],
    ),
    "wearable": _metadata(
        "wearable",
        primary_role="surface_hint",
        family_bias=["real_world_companion"],
    ),
    "iot/sensor": _metadata(
        "iot/sensor",
        primary_role="surface_hint",
        family_bias=["real_world_companion", "dashboard_ops"],
    ),
    "creator economy": _metadata(
        "creator economy",
        primary_role="environment",
        family_bias=["platform_network", "workspace_studio"],
    ),
    "voice ai (tts/stt)": _metadata(
        "voice ai (tts/stt)",
        primary_role="premium_modifier",
        family_bias=["assistant_copilot"],
        premium_only=True,
    ),
}


def resolve_keyword_metadata(label: str, source: str, premium_only: bool) -> KeywordMetadata:
    # `source` is intentionally reserved for future source-aware routing.
    _ = source

    normalized_label = label.strip().lower()
    metadata = CATALOG.get(normalized_label)
    if metadata is not None:
        return metadata.model_copy(
            deep=True,
            update={
                "label": label,
                "premium_only": premium_only or metadata.premium_only,
            },
        )

    return KeywordMetadata(
        label=label,
        primary_role=None,
        secondary_roles=[],
        family_bias=[],
        premium_only=premium_only,
    )
