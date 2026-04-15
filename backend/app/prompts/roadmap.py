def build_roadmap_prompt(
    concept: dict,
    product_design: dict,
    blueprint: dict,
) -> tuple[str, str]:
    """Build the roadmap prompt."""

    nl = "\n"

    system_prompt = """You are a technical PM creating a sprint-based execution plan.
The product and technology are already decided. Your job is to plan the build sequence.

=== LANGUAGE ===
Write ALL sections in English.

=== ROLE ===
You are sequencing the build. Phase 0 is foundation work, Phase 1 is MVP, and Phase 2 is launch work.

=== ANTI-PATTERNS ===
1. VAGUE TASKS: Every task must be specific enough to hand to a coding agent.
2. WRONG ORDER: Respect dependency order. Database before API, auth before gated user features.
3. MISSING VALIDATION: Each phase needs a concrete validation checkpoint.

=== VERIFICATION ===
Before outputting, verify:
1. Every Must feature appears in Phase 0 or Phase 1
2. Phase 0 has no product features, only foundation work
3. Phase 1 tasks are ordered by dependency
4. first_sprint_tasks are concrete enough to start implementation immediately"""

    design_must = nl.join(f"- {f}" for f in product_design.get("features_must", []))
    design_should = nl.join(f"- {f}" for f in product_design.get("features_should", []))
    design_later = nl.join(f"- {f}" for f in product_design.get("features_later", []))
    design_rules = nl.join(f"- {r}" for r in product_design.get("business_rules", []))
    bp_stack = nl.join(f"- {t}" for t in blueprint.get("tech_stack", []))
    bp_endpoints_count = len(blueprint.get("api_endpoints", []))
    table_count = max(
        len(blueprint.get("data_model_sql", "").split("CREATE TABLE")) - 1,
        0,
    )

    user_prompt = f"""=== PROJECT ===

Concept: {concept.get("concept", "")}
Product Type: {concept.get("product_type", "B2C")}

=== PRODUCT DESIGN (what to build) ===

MUST FEATURES:
{design_must}

SHOULD FEATURES:
{design_should}

LATER FEATURES:
{design_later}

BUSINESS RULES:
{design_rules}

MVP SCOPE: {product_design.get("mvp_scope", "")}

=== TECHNICAL BLUEPRINT (how to build) ===

TECH STACK:
{bp_stack}

DATA MODEL: {table_count} tables
API ENDPOINTS: {bp_endpoints_count} endpoints defined

=== WRITE 6 SECTIONS ===

1. PHASE 0 (Foundation)
   Project setup, database foundation, auth, and baseline layout.
   No product features here.
   Format: "- task description (estimated time)"

2. PHASE 1 (MVP)
   Sequence the Must features by dependency.
   Format: "- task description (estimated time)"

3. PHASE 2 (Launch)
   Should features, deployment, testing, and launch preparation.
   Format: "- task description (estimated time)"

4. VALIDATION CHECKPOINTS
   Define what must be true at the end of each phase.
   Format: "Phase 0 complete when..."

5. ESTIMATED COMPLEXITY
   Summarize the overall project size and why in 1-2 sentences.

6. FIRST SPRINT TASKS
   Break the first sprint into 5-7 concrete implementation tasks that can be handed directly to a coding tool."""

    return system_prompt, user_prompt
