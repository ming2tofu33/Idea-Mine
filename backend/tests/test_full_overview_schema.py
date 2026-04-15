from app.models.llm_schemas import FullOverviewResponse


def test_full_overview_response_flattens_tech_stack_fields_for_openai_parse():
    schema = FullOverviewResponse.model_json_schema()
    properties = schema["properties"]

    assert "tech_stack" not in properties
    assert "$defs" not in schema

    expected_fields = [
        "tech_stack_ai_ml",
        "tech_stack_auth",
        "tech_stack_backend",
        "tech_stack_database",
        "tech_stack_frontend",
        "tech_stack_hosting",
    ]

    assert sorted(field for field in properties if field.startswith("tech_stack_")) == expected_fields
    assert sorted(field for field in schema["required"] if field.startswith("tech_stack_")) == expected_fields
