def build_overview_prompt(
    title: str,
    summary: str,
    keywords: list[dict],
    market_research: str,
    concept: dict,
    idea_line: str = "",
    kernel: dict | None = None,
    family: str | None = None,
) -> tuple[str, str]:
    """Build the detailed project overview prompt from the selected idea."""

    kw_by_role: dict[str, str] = {}
    for kw in keywords:
        kw_by_role[kw["category"].upper()] = kw["label"]

    kw_lines = []
    for cat in ["WHO", "TECH", "AI", "DOMAIN", "VALUE"]:
        if cat in kw_by_role:
            kw_lines.append(f"  {cat}: {kw_by_role[cat]}")

    kw_block = "\n".join(kw_lines)

    concept_text = concept.get("concept", "")
    product_type = concept.get("product_type", "B2C")
    primary_user = concept.get("primary_user", "")
    core_experience = concept.get("core_experience", "")

    system_prompt = """You are writing a project overview. The concept is already decided and cannot drift.

=== QUALITY RUBRIC ===

Before writing each sentence, ask yourself these 3 tests:

1. SCREEN TEST: Can someone draw a UI screen from this sentence?
   GOOD: "Three workout options appear as cards and the user taps one to start immediately"
   BAD: "Personalized recommendations are provided to the user"

2. SPECIFICITY TEST: Does this sentence contain a concrete noun, verb, and number/detail?
   GOOD: "Pet trainers spend 30 minutes searching YouTube every Monday and still cannot find current drills"
   BAD: "Users face challenges in finding relevant information"

3. HUMAN TEST: Would a real PM say this in a team meeting?
   GOOD: "When the user opens the app, they see three workout cards and start one immediately."
   BAD: "The system leverages defaults to present personalized options."

=== ANTI-PATTERNS ===

- TAUTOLOGY: Feature name repeats in description. Describe the screen and interaction instead.
- SYSTEM VOICE: Describe what the user sees and does, not what the system provides.
- PRICING AS FEATURE: Revenue logic belongs in the business model section, not core features.
- SOLUTION IN PROBLEM: The problem section should only describe the user's current pain and workaround.
- BUZZWORD PADDING: Remove empty adjectives like "AI-powered" when they add no concrete meaning.

=== USING MARKET RESEARCH ===

Extract from the market context and use only where it is directly supported:
- PROBLEM: Pain frequency and current behavior patterns
- TARGET USER: usage timing and current workaround
- DIFFERENTIATOR: broad alternative behavior or existing tool category
- REVENUE: only a lightweight commercial hypothesis if the market context clearly supports it

If a section has no relevant market data, rely on concrete user scenarios. Never invent statistics, named competitors, or specific pricing.

=== VERIFICATION ===

Before outputting, apply only the tests that make sense for each section:

1. PROBLEM: SPECIFICITY + HUMAN
2. TARGET USER: SPECIFICITY + HUMAN
3. CORE FEATURES: SCREEN + SPECIFICITY + HUMAN
4. DIFFERENTIATOR: HUMAN
5. REVENUE: HUMAN + realism
6. MVP SCOPE: HUMAN + cheapest-test realism

Fix any section that fails its relevant tests before outputting.

=== RULES ===

- Write all sections in English only.
- Sound like a product manager talking to a team: concrete, natural, specific.
- features must be 4-5 bullet points separated by \\n.
- Never fabricate statistics. Use market research data only.
- No scores, no ratings, no evaluations.
- Primary user is the only persona. No other user type appears anywhere.
"""

    v2_block = ""
    if kernel or family:
        v2_block = f"""

=== V2 ANCHORS ===

Chosen family: {family or "none"}
Locked actor: {kernel.get('primary_actor', '') if kernel else ''}
Locked tension: {kernel.get('primary_tension', '') if kernel else ''}
Locked outcome: {kernel.get('primary_outcome', '') if kernel else ''}
Locked environment: {kernel.get('primary_environment', '') if kernel else ''}

Do not change these anchors while expanding the overview.
"""

    user_prompt = f"""=== SELECTED IDEA (source of truth) ===

Selected one-line idea: {idea_line}
Title: {title}
Summary: {summary}

The selected one-line idea is the source of truth for what product was chosen.
Do not broaden, rename, or swap the product described by the one-line idea.

=== FIXED CONCEPT (do NOT change this) ===

Concept: {concept_text}
Product type: {product_type}
Primary user: {primary_user}
Core experience: {core_experience}

Every section below must describe a product that matches this concept exactly.
Write all sections in English only.

=== KEYWORDS ===

{kw_block}
{v2_block}

=== MARKET CONTEXT (from web search) ===

{market_research}

=== WRITE 6 SECTIONS ===

1. PROBLEM (3-5 sentences)
   Describe the primary user's specific pain, how often it happens, what they do today, and why it fails.
   Include a concrete behavior, not just a feeling.

2. TARGET USER (3-5 sentences)
   Describe one persona: age or life stage, job or role, daily context, current workaround, and frustration.
   Include the exact moment in the day or week when they would reach for this product.

3. CORE FEATURES (4-5 bullets)
   For each feature, describe:
   - what the user sees on screen
   - what the user does
   - what happens next
   - why it matters

   Use the format:
   "Feature Name: [screen] -> [action] -> [result] -> [value]"

   Ads, subscriptions, payments, and premium upgrades are never core features.

4. DIFFERENTIATOR (3-5 sentences)
   Describe the user's current alternative.
   You may name a product only if the market context explicitly supports it.
   Focus on the switch in user behavior:
   "Today they use [current behavior], but [specific friction]. This is different because [specific mechanism]."

5. REVENUE (2-4 sentences)
   Keep this lightweight.
   Describe only the earliest commercial hypothesis:
   - how this could make money later
   - what would need to be true before charging
   - what must be validated first

   Do not include exact pricing, tier tables, benchmarks, or revenue projections.

6. MVP SCOPE (3-5 sentences)
   - IN: 3-4 specific features from the list above
   - OUT: 2-3 explicitly deferred features
   - ONE thing: "User [verb]s [object] and [outcome]."
   - Cheapest test:
     * Consumer app: 5-10 user interviews plus clickable Figma prototype
     * B2B tool: cold outreach to 20 prospects with a Loom demo
     * Marketplace: recruit supply first
     * Content product: publish 5 pieces on an existing platform
     * Hardware/IoT: Wizard-of-Oz test with a manual backend

For concept, copy Concept exactly as-is.
Do not paraphrase or rewrite the concept field."""

    return system_prompt, user_prompt
