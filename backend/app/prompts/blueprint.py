def build_blueprint_prompt(
    concept: dict,
    overview: dict,
    product_design: dict,
    depth_guide: str = "",
) -> tuple[str, str]:
    """Build the technical blueprint prompt."""

    nl = "\n"

    system_prompt = """You are a senior software architect writing a technical blueprint.
This document will be copied into AI coding tools to start building immediately.

=== LANGUAGE ===
Write ALL sections in English. This is a technical document for developers and AI coding tools.

=== CRITICAL RULE ===
The product design is already decided. Your job is to design technology that serves it exactly.
Do NOT change features, add screens, or modify business rules. Design tech to match them.

=== ANTI-PATTERNS ===
1. OVER-ENGINEERING: 3-6 tables max for MVP. No microservices. Standard monolith.
2. MISMATCHED SCHEMAS: Every Must feature needs a corresponding API endpoint. Every endpoint must reference a table.
3. PHANTOM PACKAGES: Only recommend well-known, actively maintained packages.
4. ML FOR API: If the product calls an external AI API, list that API, not an ML framework.

=== VERIFICATION ===
Before outputting, verify:
1. Every Must feature from product design has at least one API endpoint
2. Every API endpoint references a table in data_model_sql
3. file_structure matches the tech_stack framework conventions
4. business_rules from product design are reflected as DB constraints or API logic
5. Every external service has an env var name
6. auth_flow covers signup, login, token/session, and tier check"""

    design_features_must = nl.join(f"- {f}" for f in product_design.get("features_must", []))
    design_features_should = nl.join(f"- {f}" for f in product_design.get("features_should", []))
    design_user_flow = nl.join(product_design.get("user_flow", []))
    design_screens = nl.join(f"- {s}" for s in product_design.get("screens", []))
    design_rules = nl.join(f"- {r}" for r in product_design.get("business_rules", []))

    user_prompt = f"""=== PRODUCT CONTEXT ===

Concept: {concept.get("concept", "")}
Product Type: {concept.get("product_type", "B2C")}
Primary User: {concept.get("primary_user", "")}

=== PRODUCT DESIGN (already decided - design tech to match this) ===

MUST FEATURES:
{design_features_must}

SHOULD FEATURES:
{design_features_should}

USER FLOW:
{design_user_flow}

SCREENS:
{design_screens}

BUSINESS RULES:
{design_rules}

BUSINESS MODEL: {product_design.get("business_model", "")}
MVP SCOPE: {product_design.get("mvp_scope", "")}

=== WRITE 6 TECHNICAL SECTIONS ===

1. TECH STACK
   Cover frontend, backend, database, AI/ML, auth, and hosting.
   Format: "Component: technology - why this choice"

2. DATA MODEL (SQL)
   Write CREATE TABLE statements. Use 3-6 tables for MVP.
   Include UUID primary keys, foreign keys, timestamps, and constraints that reflect business rules.

3. API ENDPOINTS
   Use REST format. Group by resource.
   Every Must feature needs at least one endpoint.

4. FILE STRUCTURE
   Show the project directory tree with actual MVP file names.

5. EXTERNAL SERVICES
   Format: "Service - purpose - free tier available? - env var name"

6. AUTH FLOW
   Step-by-step signup, login, token/session handling, and free vs paid tier checks.

{depth_guide}"""

    return system_prompt, user_prompt
