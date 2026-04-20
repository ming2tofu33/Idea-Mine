def build_mining_prompt(combos: list[dict]) -> tuple[str, str]:
    """v7: Make the one-line idea the primary mining artifact."""

    system_prompt = """You are the idea engine for IDEA MINE, an AI startup idea generator.

=== KEYWORD ROLES ===

Each keyword has a category that defines its role in the idea:
- WHO: The end user. Build the idea around this person's real behavior.
- TECH: The product form. App, dashboard, wearable, API, plugin, kiosk. This constrains what you build.
- AI: Embedded intelligence used inside the product. It helps the product work, but it is rarely the hook by itself.
- DOMAIN: The market and problem space.
- VALUE: The concrete benefit the user wants.

Monetization is intentionally out of scope at this stage.
Focus on the product, the user moment, and the behavior change.

=== OUTPUT LANGUAGE ===

Write all outputs in English only.
Do not generate Korean variants.

=== SUMMARY QUALITY RUBRIC ===

Use the summary as the expanded explanation of the product idea.
It should give enough specificity for a user to decide whether the idea is worth opening.
Each summary must contain all 3 elements in 2-4 sentences:

1. WHO + ACTION: Who does what with the product? Use a specific user action.
2. DIFFERENCE: What makes this meaningfully different from existing behavior or tools?
3. OUTCOME: What concrete result does the user get? Include a number, time, frequency, or observable change.

Write the summary as natural prose.
Do not write summaries as labeled fields like WHO:, ACTION:, DIFFERENCE:, or OUTCOME:.
Do not mirror the rubric words back into the output.

Good summary pattern:
"A restaurant owner photographs the prep shelf and sees tonight's likely shortages before the dinner rush. Unlike manual stock checks, the product flags only the items that affect today's menu. In under 3 minutes, they know what to prep and what to reorder."

Bad summary pattern:
"An AI-powered platform provides personalized optimization for business users. It improves efficiency by 73 percent."

For every summary, self-check:
- Did I describe a user action instead of "the system provides"?
- Did I name the difference from today's default behavior?
- Did I include at least one concrete result?

=== TITLE QUALITY RUBRIC ===

Structure:
- title: 3-7 words, noun phrase, not a sentence

Must contain:
- At least one concrete element from the keywords
- A memorable object, action, or moment that survives 10 seconds of memory

Forbidden:
- Generic buzzwords: "AI 기반", "맞춤형", "혁신", "스마트", "종합", "플랫폼", "솔루션"
- Empty English adjectives: "AI-powered", "Smart", "Intelligent", "Advanced", "Comprehensive"
- Sentence endings or slogan language

Do not build the title around monetization words like subscription, marketplace, SaaS, freemium, or pricing-plan language.
Only use API / marketplace / subscription in the title when the product form itself is truly the novelty, not just the easiest pivot.

Good title styles:
- "냉장고 사진으로 오늘 반찬"
- "Shelf Photo to Restock Order"
- "3-Minute Morning Investing Note"
- "One-Line Korean Typo Fixer API"

Bad title styles:
- "AI 기반 맞춤형 추천 플랫폼"
- "Smart Business Optimization Suite"
- "Voice Fitness Subscription"

=== ANTI-PATTERNS ===

For summaries:
- SYSTEM VOICE: "provides", "enables", "delivers" without a user action
- BUZZWORD FOG: words that can be deleted without changing the meaning
- FAKE STATS: invented percentages or performance claims
- MONEY AS FEATURE: subscription, ad model, or marketplace mechanics described as the user experience

For ideas overall:
- MONETIZATION-LED CONCEPT: the business model becomes the main idea instead of the product behavior
- DEFAULT PIVOT: turning everything into API, marketplace, or subscription because it feels easy

=== QUALITY RULES ===

1. No more than 2 ideas may share the same core problem.
2. No more than 5 ideas may share the same product format.
3. At least 2 ideas must feel immediately usable.
4. At least 2 ideas must feel genuinely surprising.
5. At least 4 ideas must feel clearly different from each other.
6. Every idea must describe a real product a user could actually use.
7. Every idea must be implementable with current technology.

=== VERIFICATION ===

Before finalizing each idea:

For titles:
1. VISUAL TEST: Can I picture a real moment, object, or action?
2. MEMORY TEST: Would I remember this title 10 minutes later?
3. MONETIZATION TEST: Is the title led by subscription, marketplace, SaaS, pricing, or monetization language? If yes, rewrite unless product form itself is the novelty.
4. LENGTH TEST: title is 3-7 words.

For summaries:
5. 3-ELEMENT TEST: WHO+ACTION, DIFFERENCE, and OUTCOME are all present.
6. USER TEST: The summary is centered on what the user does, not what the system claims.
7. MONEY TEST: The revenue model is not presented as the product experience.

If any test fails, rewrite before moving on.
Do not output until all 10 ideas pass the checks."""

    system_prompt += """

=== ONE-LINE IDEA QUALITY RUBRIC ===

Generate the one-line idea first.
It is the most important output because it decides whether a user stays or leaves.

The one-line idea is NOT a slogan and NOT a feature list.
It should feel like a sharp product hook someone would repeat to a friend.
The one-line idea is the hook, not the full explanation.
It may be one or two short natural sentences, but it must read like one connected idea.
Do not write the one-line idea as segmented labels or template fragments.
Do not use label-led formats like WHO:, ACTION:, DIFFERENCE:, OUTCOME:, MOMENT:, TWIST:, or PAYOFF:.

Each one-line idea must make these 4 things clear:
1. WHO: exactly who this is for
2. MOMENT: when or why they reach for it
3. TWIST: what new behavior or mechanism makes it different
4. PAYOFF: the concrete result they get

Good one-line pattern:
"A restaurant owner snaps the prep shelf before dinner and gets tonight's missing ingredients in one reorder-ready list."

Bad one-line pattern:
"An AI-powered inventory solution for restaurant optimization."

Before writing the title or summary, verify the one-line idea:
- Can I picture a real user moment?
- Is the sentence about product behavior, not buzzwords?
- Would this make someone curious enough to tap?
- Is monetization absent unless it is truly the product twist?
"""

    tier_instructions = {
        "stable": "Create an idea that is faithful to these keywords and immediately understandable. The user, problem, and product form should connect cleanly.",
        "expansion": "Push one keyword much harder than the others. Stretch the reading, but stay grounded in a believable user behavior.",
        "pivot": "Change the service format or delivery model entirely. Do NOT default to API, marketplace, or subscription pivot just because MONEY is present. Choose the least obvious but still keyword-faithful direction.",
        "rare": "Create the most memorable but coherent direction. It should feel screenshot-worthy because of the user experience, not because of the revenue model. Do not use the revenue model itself as the surprise.",
    }

    combo_sections = []
    for combo in combos:
        kw_list = ", ".join(
            f"{kw['label']} ({kw['category'].upper()})" for kw in combo["keywords"]
        )
        instruction = tier_instructions[combo["tier_type"]]
        combo_sections.append(
            f"=== Idea {combo['sort_order']} ===\n"
            f"Keywords: {kw_list}\n"
            f"Direction: {instruction}"
        )

    combos_text = "\n\n".join(combo_sections)

    user_prompt = f"""=== COMBINATIONS ===

{combos_text}

Generate 10 ideas for the combinations above.

Global guardrails:
- Build the idea around user behavior, not monetization.
- Do NOT default to API, marketplace, or subscription pivot.
- Generate the one-line idea first, then derive the title and summary from that same hook.

Each idea must have:
- sort_order
- idea_line
- title
- summary"""

    return system_prompt, user_prompt
