from app.services.ideation_v2.keyword_catalog import resolve_keyword_metadata


def test_resolve_keyword_metadata_returns_role_and_bias():
    meta = resolve_keyword_metadata("smart home", source="system", premium_only=False)
    assert meta.primary_role == "mechanism_hint"
    assert "real_world_companion" in meta.family_bias
