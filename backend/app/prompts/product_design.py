def build_product_design_prompt(
    concept: dict,
    overview: dict,
    market_research: str,
    depth_guide: str = "",
) -> tuple[str, str]:
    """Build the product design prompt."""

    concept_text = concept.get("concept", "")
    product_type = concept.get("product_type", "B2C")
    primary_user = concept.get("primary_user", "")

    system_prompt = """You are a product designer expanding a project overview into a detailed product specification.

=== LANGUAGE ===
Write ALL sections in English. Use clear, professional English.

=== ROLE ===
You are defining the PRODUCT layer: what users see, what they do, and what rules govern the system.
The technology decisions come later in a separate document. Do NOT recommend tech stacks or databases here.

=== ANTI-PATTERNS ===
1. SYSTEM VOICE: Describe what the user does, not what the system provides.
2. VAGUE SCREENS: Every screen must say what the user sees or does there.
3. FEATURE OVERLAP: Must, Should, and Later must be meaningfully different.
4. RULES AS FEATURES: Business rules are constraints, not feature descriptions.

=== VERIFICATION ===
Before outputting, verify:
1. Every Must feature appears in at least one user_flow step
2. Every screen in screens list is referenced in user_flow
3. business_rules are constraints, not feature descriptions
4. mvp_scope has clear IN and OUT lists"""

    overview_block = f"""CONCEPT: {concept_text}
PRODUCT TYPE: {product_type}
PRIMARY USER: {primary_user}

PROBLEM: {overview.get("problem", "")}
TARGET: {overview.get("target", "")}
FEATURES: {overview.get("features", "")}
DIFFERENTIATOR: {overview.get("differentiator", "")}
REVENUE: {overview.get("revenue", "")}
MVP SCOPE: {overview.get("mvp_scope", "")}"""

    user_prompt = f"""=== PROJECT OVERVIEW ===

{overview_block}

=== MARKET CONTEXT ===

{market_research}

=== WRITE 8 SECTIONS ===

1. USER FLOW
   Write the happy path as numbered steps.
   Each step must name the screen and say what the user does there.
   Focus on the main flow only, not error handling.

2. SCREENS
   List every MVP screen in one line each:
   "Screen Name - what the user does here"
   Every screen named in user_flow must appear here.

3. FEATURES MUST
   The core MVP features. If these are missing, the product does not work.
   Format: "Feature Name - [screen] - [user action] - [outcome]"

4. FEATURES SHOULD
   Valuable follow-up features for the next release, but not required for MVP.

5. FEATURES LATER
   Clearly lower-priority ideas for later releases.

6. BUSINESS MODEL
   Explain pricing and revenue structure with concrete dollar amounts.
   Include at least one competitor or benchmark anchor.

7. BUSINESS RULES
   List system constraints, not features.
   Format each rule as a condition or guardrail the product must enforce.

8. MVP SCOPE
   Provide:
   - IN: what ships in MVP
   - OUT: what is deliberately excluded
   - the core hypothesis
   - the cheapest practical validation method

{depth_guide}"""

    return system_prompt, user_prompt
