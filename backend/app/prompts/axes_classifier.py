def build_axes_prompt(
    concept: dict,
    keywords: list[dict],
    product_type: str,
) -> tuple[str, str]:
    """아이디어의 Interface/Business/Technical 복잡도를 분류."""

    system_prompt = """You classify product ideas by 3 complexity axes.

AXES:
- interface_complexity: How many user-facing screens and flows?
  high = 10+ screens, multi-step flows, onboarding, complex navigation
  medium = 5-9 screens, dashboard-style, moderate interaction
  low = API-only, CLI, no UI or minimal admin panel

- business_complexity: How complex are pricing, rules, multi-sided dynamics?
  high = tiered pricing, marketplace dynamics, escrow, role-based access, compliance
  medium = simple subscription or usage-based pricing, basic rules
  low = free tool, single pricing, no complex rules

- technical_complexity: How technically challenging to build?
  high = AI/ML pipeline, real-time processing, hardware integration, complex algorithms, multi-service orchestration
  medium = standard API integrations, moderate data processing, common auth patterns
  low = standard CRUD, well-known patterns, no special infrastructure

Provide brief reasoning (1-2 sentences) explaining your classification.
Each axis is independent — a product can be high on one and low on another.

VERIFICATION: Before outputting, verify each axis classification matches the definitions above."""

    kw_text = ", ".join(f"{k.get('category', '')}: {k.get('en', '')}" for k in keywords)

    user_prompt = f"""Classify this product idea:

Concept: {concept.get("concept_en", "")}
Product Type: {product_type}
Keywords: {kw_text}
Primary User: {concept.get("primary_user_en", "")}
Core Experience: {concept.get("core_experience_en", "")}"""

    return system_prompt, user_prompt
