def build_concept_prompt(
    title: str,
    summary: str,
    keywords: list[dict],
    idea_line: str = "",
    kernel: dict | None = None,
    family: str | None = None,
) -> tuple[str, str]:
    """Build the concept prompt for the selected idea."""

    kw_by_role: dict[str, str] = {}
    for kw in keywords:
        kw_by_role[kw["category"].upper()] = kw["label"]

    role_desc = {
        "WHO": "end user",
        "TECH": "product form",
        "AI": "embedded technology",
        "DOMAIN": "market or problem space",
        "VALUE": "core value",
    }

    kw_lines = []
    for cat in ["WHO", "TECH", "AI", "DOMAIN", "VALUE"]:
        if cat in kw_by_role:
            kw_lines.append(f"  {cat}: {kw_by_role[cat]} -- {role_desc[cat]}")

    kw_block = "\n".join(kw_lines)

    system_prompt = """You are defining a product concept from keyword combinations.

=== CONCEPT FORMAT ===

- If AI keyword IS present:
  "A [TECH] for [WHO] that uses [AI] to deliver [VALUE] in [DOMAIN]."
- If AI keyword is NOT present:
  "A [TECH] for [WHO] that delivers [VALUE] in [DOMAIN]."

CRITICAL:
- Do NOT invent AI technology if it is not in the keywords.
- Monetization is intentionally out of scope here.
- Do NOT mention pricing, subscriptions, or revenue mechanics in the concept.

=== B2C / B2B CLASSIFICATION ===

- B2C: WHO is a person acting in their personal life.
- B2B: WHO is a person acting in a business role.

=== CORE EXPERIENCE QUALITY ===

Describe the first 30 seconds of use as a concrete user action sequence.

GOOD: "Opens the app, sees 3 food options as swipeable cards, taps one, and starts immediately."
BAD: "Leverages AI to receive personalized recommendations."

=== VERIFICATION ===

Before outputting, verify all 4 tests:
1. CONCEPT FORMAT: Does the concept follow the template and stay monetization-free?
2. AI HONESTY: Did I invent AI technology that was not in the keywords?
3. CORE EXPERIENCE: Is it a concrete action sequence with specific verbs?
4. PRIMARY USER CLARITY: Is primary_user a plain, specific person rather than an abstract segment?
"""

    v2_block = ""
    if kernel or family:
        v2_block = f"""

=== V2 ANCHORS ===

Locked family: {family or "none"}
Locked actor: {kernel.get('primary_actor', '') if kernel else ''}
Locked tension: {kernel.get('primary_tension', '') if kernel else ''}
Locked outcome: {kernel.get('primary_outcome', '') if kernel else ''}
Locked environment: {kernel.get('primary_environment', '') if kernel else ''}

Do not change the actor, tension, outcome, or chosen product family.
"""

    user_prompt = f"""=== INPUT ===

Title: {title}
Summary: {summary}
One-line idea: {idea_line}

Keywords:
{kw_block}
{v2_block}

=== TASK ===

The selected one-line idea is the source of truth.
Title is only a label. Summary is supporting context.
If title, summary, and one-line idea conflict, follow the one-line idea.

Generate a product concept with these 4 outputs. Provide English only.

1. CONCEPT: One sentence in this exact format:
   "A [TECH] for [WHO] that uses [AI] to deliver [VALUE] in [DOMAIN]."

2. PRODUCT TYPE: Classify as B2C or B2B using the rules above.

3. PRIMARY USER: Restate WHO in plain language. This is the only user.

4. CORE EXPERIENCE: In one sentence, what does the user do with this product?
   Be concrete. Describe the first 30 seconds of use.

Return fields:
- concept
- product_type
- primary_user
- core_experience"""

    return system_prompt, user_prompt
