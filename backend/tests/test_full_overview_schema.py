from app.models.llm_schemas import FullOverviewResponse


def test_full_overview_response_uses_explicit_tech_stack_object():
    schema = FullOverviewResponse.model_json_schema()
    tech_stack = schema["properties"]["tech_stack"]

    assert tech_stack["$ref"] == "#/$defs/FullOverviewTechStackResponse"

    tech_stack_def = schema["$defs"]["FullOverviewTechStackResponse"]
    assert sorted(tech_stack_def["properties"].keys()) == [
        "ai_ml",
        "auth",
        "backend",
        "database",
        "frontend",
        "hosting",
    ]
    assert sorted(tech_stack_def["required"]) == [
        "ai_ml",
        "auth",
        "backend",
        "database",
        "frontend",
        "hosting",
    ]
