def build_full_overview_prompt(
    concept: dict,
    light_overview: dict,
    market_research: str,
    depth_guide: str = "",
) -> tuple[str, str]:
    """Build the full overview prompt."""

    concept_text = concept.get("concept", "")
    product_type = concept.get("product_type", "B2C")
    primary_user = concept.get("primary_user", "")
    core_experience = concept.get("core_experience", "")

    system_prompt = """You are a senior full-stack architect writing an implementation-ready document.
This document will be placed in a /docs folder so that AI coding tools can start building immediately.

=== ANTI-PATTERNS ===
1. SYSTEM VOICE: Describe what the user does, not what the system provides.
2. BUZZWORD PADDING: Remove empty adjectives that do not change meaning.
3. OVER-ENGINEERING: 3-6 tables max, standard tech only, no microservices.
4. MISMATCHED SCHEMAS: API endpoints must match the data model.
5. GENERIC FILE STRUCTURE: Name real files, not placeholder folders.

=== CROSS-CHECK ===
Before outputting, verify:
1. Every Must feature has at least one API endpoint
2. Every API endpoint references a table in the data model
3. File structure matches the chosen tech stack
4. Business rules are reflected in the data model or API logic
5. Every external service has an env var name
6. Auth flow covers signup, login, token/session, and tier checks"""

    user_prompt = f"""=== FIXED CONCEPT ===

Concept: {concept_text}
Product type: {product_type}
Primary user: {primary_user}
Core experience: {core_experience}

=== LIGHT OVERVIEW (already validated - use as foundation) ===

Problem: {light_overview.get("problem", "")}
Target: {light_overview.get("target", "")}
Features: {light_overview.get("features", "")}
Revenue: {light_overview.get("revenue", "")}
MVP Scope: {light_overview.get("mvp_scope", "")}

=== MARKET CONTEXT ===

{market_research}

=== WRITE 15 SECTIONS ===

Write in English only. This is a technical document for AI coding tools.
Add [REVIEW], [DRAFT], or [READY] to each section title.

1. ONE-LINE CONCEPT
   Copy the concept exactly as-is: "{concept_text}"

2. PROBLEM DEFINITION
   Expand the problem with frequency, workaround, and why the workaround fails.

3. TARGET USER
   Expand the target with the moment they would reach for the product and their technical comfort level.

4. CORE FEATURES - Must / Should / Later
   Categorize features and write each feature as:
   "Feature Name: [user action] -> [system response] -> [outcome]"

5. USER FLOW
   Write the primary user's journey from first open to core outcome.
   Use 8-12 numbered happy-path steps.

6. SCREEN LIST
   List every MVP screen or page in one line:
   "Screen Name - what the user does here"

7. BUSINESS MODEL + PRICING
   Expand revenue with pricing tiers, competitor anchors, and a simple revenue projection.

8. CORE BUSINESS RULES
   List 5-10 constraints that must be enforced in code.

9. MVP SCOPE + VALIDATION
   Provide IN, OUT, core hypothesis, validation questions, and the cheapest test method.

10. TECH STACK
    Fill these exact top-level fields with short concrete technology choices:
    tech_stack_frontend
    tech_stack_backend
    tech_stack_database
    tech_stack_ai_ml
    tech_stack_auth
    tech_stack_hosting

11. DATA MODEL
    Write SQL CREATE TABLE statements for the MVP, with UUID keys and timestamps.

12. API ENDPOINTS
    List the REST API endpoints needed for MVP features.

13. FILE STRUCTURE
    Show the project directory tree with real file names.

14. EXTERNAL SERVICES & API KEYS
    Format each item as:
    "Service - purpose - free tier? - env var name"

15. AUTH FLOW
    Describe signup, login, token/session handling, and tier checks step by step.

{depth_guide}"""

    return system_prompt, user_prompt


def build_full_overview_prompt_with_feedback(
    concept: dict,
    light_overview: dict,
    market_research: str,
    depth_guide: str,
    previous_output: str,
    critique_feedback: str,
) -> tuple[str, str]:
    """Build the regeneration prompt with critique feedback."""

    system_prompt, base_user = build_full_overview_prompt(
        concept,
        light_overview,
        market_research,
        depth_guide,
    )

    user_prompt = f"""{base_user}

## REVIEWER FEEDBACK (must address these issues)
{critique_feedback}

## PREVIOUS OUTPUT (improve this instead of starting from scratch)
{previous_output}"""

    return system_prompt, user_prompt
