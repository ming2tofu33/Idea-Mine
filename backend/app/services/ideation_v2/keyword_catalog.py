from pydantic import BaseModel


class KeywordMetadata(BaseModel):
    label: str
    primary_role: str | None
    secondary_roles: list[str]
    family_bias: list[str]
    premium_only: bool


CATALOG = {
    "smart home": KeywordMetadata(
        label="smart home",
        primary_role="mechanism_hint",
        secondary_roles=["environment"],
        family_bias=["real_world_companion", "dashboard_ops"],
        premium_only=False,
    ),
}


def resolve_keyword_metadata(label: str, source: str, premium_only: bool) -> KeywordMetadata:
    return CATALOG.get(
        label,
        KeywordMetadata(
            label=label,
            primary_role=None,
            secondary_roles=[],
            family_bias=[],
            premium_only=premium_only,
        ),
    )
