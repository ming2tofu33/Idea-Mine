from app.main import app


def _response_schema(path: str, method: str) -> dict:
    operation = app.openapi()["paths"][path][method]
    return operation["responses"]["200"]["content"]["application/json"]["schema"]


def test_ore_routes_expose_v3_response_models():
    assert (
        _response_schema("/ore/veins/today", "get")["$ref"]
        == "#/components/schemas/OreTodayVeinsResponse"
    )
    assert (
        _response_schema("/ore/veins/reroll", "post")["$ref"]
        == "#/components/schemas/OreTodayVeinsResponse"
    )
    assert (
        _response_schema("/ore/discover", "post")["$ref"]
        == "#/components/schemas/OreDiscoverResponse"
    )
    assert (
        _response_schema("/ore/{ore_id}/vault", "patch")["$ref"]
        == "#/components/schemas/OreVaultResponse"
    )
    assert (
        _response_schema("/ore/{ore_id}", "get")["$ref"]
        == "#/components/schemas/IdeaOreOut"
    )
    assert (
        _response_schema("/ore/{ore_id}/projectize", "post")["$ref"]
        == "#/components/schemas/ProjectSeedBriefOut"
    )


def test_ore_vault_route_returns_list_of_idea_ores():
    schema = _response_schema("/ore/vault", "get")

    assert schema["type"] == "array"
    assert schema["items"]["$ref"] == "#/components/schemas/IdeaOreOut"


def test_ore_discover_request_uses_vein_id_only():
    request_schema = app.openapi()["components"]["schemas"]["OreDiscoverRequest"]

    assert set(request_schema["properties"]) == {"vein_id"}
    assert request_schema["required"] == ["vein_id"]


def test_ore_public_keyword_schema_hides_internal_category():
    components = app.openapi()["components"]["schemas"]
    keyword_schema = components["OreVisibleKeyword"]

    assert set(keyword_schema["properties"]) == {"id", "label"}

    ore_schema = components["IdeaOreOut"]
    selected_keywords = ore_schema["properties"]["selected_keywords"]
    assert selected_keywords["items"]["$ref"] == "#/components/schemas/OreVisibleKeyword"


def test_ore_today_veins_response_includes_reroll_usage():
    schema = app.openapi()["components"]["schemas"]["OreTodayVeinsResponse"]

    assert set(schema["properties"]) >= {
        "veins",
        "rerolls_used",
        "rerolls_max",
        "generations_used",
        "generations_max",
    }
