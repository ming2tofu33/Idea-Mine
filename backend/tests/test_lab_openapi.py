from app.main import app


def _response_ref(path: str) -> str:
    operation = app.openapi()["paths"][path]["post"]
    schema = operation["responses"]["200"]["content"]["application/json"]["schema"]
    return schema["$ref"]


def test_lab_routes_expose_response_models():
    assert _response_ref("/lab/overview") == "#/components/schemas/OverviewOut"
    assert _response_ref("/lab/appraisal") == "#/components/schemas/AppraisalOut"
    assert _response_ref("/lab/overview/full") == "#/components/schemas/FullOverviewOut"
    assert _response_ref("/lab/design") == "#/components/schemas/ProductDesignOut"
    assert _response_ref("/lab/blueprint") == "#/components/schemas/BlueprintOut"
    assert _response_ref("/lab/roadmap") == "#/components/schemas/RoadmapOut"
    assert _response_ref("/lab/generate-all") == "#/components/schemas/GenerateAllOut"


def test_lab_usage_route_exposes_response_model():
    operation = app.openapi()["paths"]["/lab/usage"]["get"]
    schema = operation["responses"]["200"]["content"]["application/json"]["schema"]
    assert schema["$ref"] == "#/components/schemas/UsageInfoOut"
