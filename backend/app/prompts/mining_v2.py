from app.services.ideation_v2.mining import MiningV2Context


FAMILY_GUIDANCE = {
    "workflow_utility": "fast task completion, low-friction entry, immediate payoff",
    "workspace_studio": "deeper working surface, drafting, organizing, planning",
    "dashboard_ops": "monitoring, triage, operational oversight, team visibility",
    "assistant_copilot": "embedded guidance, side-by-side help, contextual assistance",
    "agent_automation": "delegated execution, background action, multi-step follow-through",
    "platform_network": "shared workflows, integrations, multi-party coordination",
    "real_world_companion": "software that supports a physical-world routine or device-linked moment",
}


def _build_slot_plan(selected_keywords: list[dict], context: MiningV2Context) -> list[dict]:
    slots: list[dict] = []
    sort_order = 1
    branch_sources = [
        (
            "primary",
            context.branch_plan.primary_family,
            context.branch_plan.primary_allowed_subfamilies,
        ),
        (
            "secondary",
            context.branch_plan.secondary_family,
            context.branch_plan.secondary_allowed_subfamilies,
        ),
    ]
    if context.branch_plan.contrast_family:
        branch_sources.append(
            (
                "contrast",
                context.branch_plan.contrast_family,
                context.branch_plan.contrast_allowed_subfamilies,
            )
        )

    for branch_label, family, subfamilies in branch_sources:
        count = context.branch_plan.slot_distribution.get(branch_label, 0)
        if count <= 0:
            continue
        if not subfamilies:
            subfamilies = [family]

        for index in range(count):
            slots.append(
                {
                    "sort_order": sort_order,
                    "branch_label": branch_label,
                    "family": family,
                    "subfamily": subfamilies[index % len(subfamilies)],
                    "keywords": selected_keywords,
                }
            )
            sort_order += 1

    return slots


def build_mining_prompt_v2(
    selected_keywords: list[dict],
    context: MiningV2Context,
) -> tuple[str, str, list[dict]]:
    kernel = context.kernel_set.primary_kernel
    slots = _build_slot_plan(selected_keywords, context)
    keyword_block = ", ".join(
        f"{item['label']} ({str(item.get('category', 'seed')).upper()})"
        for item in selected_keywords
    )
    slot_block = "\n".join(
        [
            (
                f"=== Idea {slot['sort_order']} ===\n"
                f"Family: {slot['family']}\n"
                f"Subfamily: {slot['subfamily']}\n"
                f"Branch role: {slot['branch_label']}\n"
                f"Family guidance: {FAMILY_GUIDANCE.get(slot['family'], slot['family'])}"
            )
            for slot in slots
        ]
    )

    system_prompt = """You are the V2 idea engine for IDEA MINE.

Generate 10 product ideas from one locked seed and a bounded branch plan.

Hard rules:
- Write everything in English only.
- Preserve the same core actor, tension, and outcome across all 10 ideas.
- Change the product surface, interaction model, and delivery shape according to the assigned family and subfamily.
- Do not fall back to generic platform/API/marketplace ideas unless the assigned family truly requires it.
- The one-line idea is the primary hook. It should feel specific enough to earn a click.
- Summary should expand the same hook in natural prose with user action, difference, and concrete outcome.

One-line idea quality:
- Show a real user moment.
- Make the mechanism legible.
- Make the payoff concrete.
- Avoid slogans, buzzwords, and labeled templates.

Title quality:
- 3-7 words.
- Noun phrase, not a sentence.
- Memorable object, action, or moment.

Summary quality:
- 2-4 sentences.
- Show the user action.
- Explain what changes versus the default behavior.
- Include a concrete result without fake stats.

Do not output family names, branch labels, or subfamilies in the final text."""

    user_prompt = f"""=== SELECTED KEYWORDS ===

{keyword_block}

=== LOCKED SEED ===

Actor: {kernel.primary_actor}
Tension: {kernel.primary_tension}
Outcome: {kernel.primary_outcome}
Environment: {kernel.primary_environment or "none"}
Kernel: {kernel.text}

=== BRANCH PLAN ===

Primary family: {context.branch_plan.primary_family}
Secondary family: {context.branch_plan.secondary_family}
Contrast family: {context.branch_plan.contrast_family or "none"}
Slot distribution: {context.branch_plan.slot_distribution}

Generate exactly one idea for each slot below.
Each idea must match its assigned family and subfamily while preserving the locked seed.

{slot_block}

Return 10 ideas with these fields only:
- sort_order
- idea_line
- title
- summary"""

    return system_prompt, user_prompt, slots
