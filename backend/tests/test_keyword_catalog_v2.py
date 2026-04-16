from app.services.ideation_v2.keyword_catalog import CATALOG, resolve_keyword_metadata


def test_resolve_keyword_metadata_returns_role_and_bias_copy():
    meta = resolve_keyword_metadata("smart home", source="system", premium_only=False)
    meta.primary_role = "changed"

    fresh_meta = resolve_keyword_metadata("smart home", source="system", premium_only=False)
    assert fresh_meta.primary_role == "mechanism_hint"
    assert "real_world_companion" in fresh_meta.family_bias
    assert CATALOG["smart home"].primary_role == "mechanism_hint"


def test_resolve_keyword_metadata_falls_back_for_unknown_label():
    meta = resolve_keyword_metadata("unknown label", source="system", premium_only=True)
    assert meta.label == "unknown label"
    assert meta.primary_role is None
    assert meta.secondary_roles == []
    assert meta.family_bias == []
    assert meta.premium_only is True
