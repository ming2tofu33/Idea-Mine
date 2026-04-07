"""
3축 분류 결과 → 15섹션별 depth instruction 생성.
LLM 호출 없음. 순수 Python 매핑.
"""

INTERFACE_GUIDE = {
    "high": {
        "user_flow": "Write 10-12 detailed steps including edge cases and error states.",
        "screens": "List 10+ screens. For each: name, what user sees, primary action.",
        "features_must": "Describe 4-5 Must features with screen-level detail: [screen] → [action] → [result].",
    },
    "medium": {
        "user_flow": "Write 8 steps covering the main happy path.",
        "screens": "List 6-8 key screens with brief descriptions.",
        "features_must": "Describe 3-4 Must features with action → result format.",
    },
    "low": {
        "user_flow": "Write 3-5 steps focused on API integration flow, not UI navigation.",
        "screens": "This is an API/CLI product. List only admin dashboard screens if any, or state 'No user-facing screens'.",
        "features_must": "Describe 3-4 Must features as API capabilities, not screen interactions.",
    },
}

BUSINESS_GUIDE = {
    "high": {
        "business_rules": "Write 10+ specific rules with concrete numbers. Include: rate limits, tier restrictions, marketplace fees, dispute resolution, content policies.",
        "business_model": "Define 3 pricing tiers with specific $ amounts. Include 2 competitor price benchmarks. Project MRR for 100/1K/10K users.",
        "mvp_scope": "Clearly define IN (5-7 items) and OUT (4-5 items). State 3 validation hypotheses. Describe the cheapest test method specific to this business type.",
    },
    "medium": {
        "business_rules": "Write 5-7 key rules with specific limits.",
        "business_model": "Define pricing with 1-2 tiers and $ amounts. Include 1 competitor benchmark.",
        "mvp_scope": "Define IN/OUT lists. State 1 core hypothesis and test method.",
    },
    "low": {
        "business_rules": "Write 3 essential rules only.",
        "business_model": "Describe the simple revenue model in 1-2 sentences.",
        "mvp_scope": "Brief IN/OUT. State the single most important thing to validate.",
    },
}

TECHNICAL_GUIDE = {
    "high": {
        "tech_stack": "For each of 6 components, explain WHY in 2-3 sentences. Mention alternatives considered.",
        "data_model_sql": "Write 6 tables with full column definitions, foreign keys, indexes, and comments on non-obvious columns.",
        "api_endpoints": "Define 15+ REST endpoints grouped by resource. Include request/response hints, auth requirements, and rate limits.",
        "external_services": "List each service with: purpose, free tier limits, env var name, and fallback strategy.",
    },
    "medium": {
        "tech_stack": "For each component, explain WHY in 1 sentence.",
        "data_model_sql": "Write 4 tables with key columns, foreign keys, and timestamps.",
        "api_endpoints": "Define 10 endpoints with auth requirements noted.",
        "external_services": "List key services with purpose and env var name.",
    },
    "low": {
        "tech_stack": "List standard choices with brief 1-line justification.",
        "data_model_sql": "Write 3 core tables with essential columns.",
        "api_endpoints": "Define 8 basic CRUD endpoints.",
        "external_services": "List only essential services.",
    },
}


def build_depth_guide(
    interface: str,
    business: str,
    technical: str,
) -> str:
    """3축 값 → 프롬프트에 주입할 SECTION DEPTH GUIDE 텍스트 생성."""

    i_guide = INTERFACE_GUIDE.get(interface, INTERFACE_GUIDE["medium"])
    b_guide = BUSINESS_GUIDE.get(business, BUSINESS_GUIDE["medium"])
    t_guide = TECHNICAL_GUIDE.get(technical, TECHNICAL_GUIDE["medium"])

    lines = [
        "## SECTION DEPTH GUIDE",
        "",
        f"Product analysis: Interface={interface}, Business={business}, Technical={technical}",
        "",
        "Follow these depth instructions for each section:",
        "",
        "### Narrative sections:",
        f"- USER FLOW: {i_guide['user_flow']}",
        f"- SCREENS: {i_guide['screens']}",
        f"- FEATURES (Must/Should/Later): {i_guide['features_must']}",
        f"- BUSINESS RULES: {b_guide['business_rules']}",
        f"- BUSINESS MODEL + PRICING: {b_guide['business_model']}",
        f"- MVP SCOPE: {b_guide['mvp_scope']}",
        "",
        "### Technical sections:",
        f"- TECH STACK: {t_guide['tech_stack']}",
        f"- DATA MODEL: {t_guide['data_model_sql']}",
        f"- API ENDPOINTS: {t_guide['api_endpoints']}",
        f"- EXTERNAL SERVICES: {t_guide['external_services']}",
    ]

    return "\n".join(lines)
