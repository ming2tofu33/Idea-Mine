def build_critique_prompt(
    full_overview_text: str,
    axes: dict,
) -> tuple[str, str]:
    """생성된 풀 개요서를 평가하고 재생성 필요 여부를 판단."""

    system_prompt = """You are a senior technical reviewer scoring implementation documents.

Score 0-100 based on 4 criteria:

1. DEPTH MATCH (40%): Do high-complexity sections have proportionally deeper content than low-complexity sections? A high-interface product should have detailed screens and user flows. A low-interface API product should NOT have long screen lists.

2. ACTIONABILITY (30%): Can a developer start coding from this document alone? Are there specific technology names, table schemas, endpoint paths, and file names — not vague descriptions?

3. CONSISTENCY (20%): Do features mentioned in the narrative appear as API endpoints in the technical section? Do API endpoints reference tables in the data model? Does the auth flow match the auth requirements on endpoints?

4. CONCRETENESS (10%): Are there specific $ amounts in pricing, specific user personas with names, specific technology versions, and concrete metrics — not abstract phrases like "scalable architecture" or "competitive pricing"?

Set needs_regeneration = true ONLY if score < 70.
If needs_regeneration, write specific feedback that tells the regenerator exactly what to fix.
Do NOT give generic feedback like "improve quality" — name the specific sections and what's wrong.

VERIFICATION: Check that your score matches the criteria breakdown. If depth_match is strong but consistency is weak, the total should reflect that."""

    user_prompt = f"""Review this full overview document:

--- DOCUMENT ---
{full_overview_text}
--- END DOCUMENT ---

Product complexity axes:
- Interface: {axes.get("interface_complexity", "medium")}
- Business: {axes.get("business_complexity", "medium")}
- Technical: {axes.get("technical_complexity", "medium")}

Score and provide structured feedback."""

    return system_prompt, user_prompt


def build_collection_critique_prompt(
    product_design: dict,
    blueprint: dict,
    axes: dict,
) -> tuple[str, str]:
    """제품 설계서와 기술 청사진 간 교차 일관성을 평가."""

    nl = "\n"

    # 제품 설계서 내용 조립
    design_must = nl.join(f"- {f}" for f in product_design.get("features_must", []))
    design_should = nl.join(f"- {f}" for f in product_design.get("features_should", []))
    design_screens = nl.join(f"- {s}" for s in product_design.get("screens", []))
    design_rules = nl.join(f"- {r}" for r in product_design.get("business_rules", []))
    design_flow = nl.join(product_design.get("user_flow", []))

    # 기술 청사진 내용 조립
    bp_endpoints = nl.join(f"- {e}" for e in blueprint.get("api_endpoints", []))
    bp_stack = nl.join(f"- {t}" for t in blueprint.get("tech_stack", []))
    bp_services = nl.join(f"- {s}" for s in blueprint.get("external_services", []))
    bp_auth = nl.join(blueprint.get("auth_flow", []))

    system_prompt = """You are a senior technical reviewer evaluating cross-consistency between a product design document and its technical blueprint.

Score 0-100 based on 4 criteria:

1. FEATURE-API MATCH (40%): Every Must feature in the product design has a corresponding API endpoint in the blueprint. Missing endpoints for Must features is a critical gap. Should features may or may not have endpoints yet.

2. SCREEN-STRUCTURE MATCH (20%): Screens listed in the product design are reflected in the file_structure of the blueprint. Each screen should have a corresponding file or component. Missing screen files indicate incomplete implementation planning.

3. RULES-DB MATCH (20%): Business rules from the product design are reflected as constraints in the data_model_sql. Rate limits, tier restrictions, and validation rules should appear as CHECK constraints, column defaults, or documented API logic. Rules with no technical enforcement are gaps.

4. DEPTH MATCH (20%): The axes classification (interface/business/technical complexity) matches the actual depth of both documents. A high-interface product should have many screens and detailed user flows. A low-technical product should NOT have over-engineered infrastructure.

Set needs_regeneration = true ONLY if score < 70.
If needs_regeneration, write specific feedback naming which features lack endpoints, which screens lack files, which rules lack enforcement.
Do NOT give generic feedback — be specific about the mismatches.

VERIFICATION: Check that your score matches the criteria breakdown. Calculate each criterion's contribution separately."""

    user_prompt = f"""Review the cross-consistency between these two documents:

--- PRODUCT DESIGN ---

MUST FEATURES:
{design_must}

SHOULD FEATURES:
{design_should}

SCREENS:
{design_screens}

USER FLOW:
{design_flow}

BUSINESS RULES:
{design_rules}

BUSINESS MODEL: {product_design.get("business_model", "")}
MVP SCOPE: {product_design.get("mvp_scope", "")}

--- TECHNICAL BLUEPRINT ---

TECH STACK:
{bp_stack}

API ENDPOINTS:
{bp_endpoints}

DATA MODEL SQL:
{blueprint.get("data_model_sql", "")}

FILE STRUCTURE:
{blueprint.get("file_structure", "")}

EXTERNAL SERVICES:
{bp_services}

AUTH FLOW:
{bp_auth}

--- END ---

Product complexity axes:
- Interface: {axes.get("interface_complexity", "medium")}
- Business: {axes.get("business_complexity", "medium")}
- Technical: {axes.get("technical_complexity", "medium")}

Score the cross-consistency and provide structured feedback."""

    return system_prompt, user_prompt
