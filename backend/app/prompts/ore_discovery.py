ORE_DISCOVERY_LENSES = [
    "Direct Core",
    "Emotional Ritual",
    "Archive / Collection",
    "Character / Companion",
    "Visual Card System",
    "Tiny Utility",
    "Desktop / Browser Tool",
    "Constraint-first MVP",
    "Weird but Buildable",
    "Builder-friendly Project Seed",
]

ORE_DISCOVERY_LANE_PLAN = [
    ("Cozy Personal", 3),
    ("Indie Tool", 3),
    ("Practical Twist", 3),
    ("Weird Bridge", 1),
]

FAMILY_DISPLAY_NAMES = {
    "cozy_personal": "Cozy Personal",
    "indie_tool": "Indie Tool",
    "practical_twist": "Practical Twist",
}

FAMILY_ADJACENT_AND_OPPOSITE = {
    "cozy_personal": ("Indie Tool", "Practical Twist"),
    "indie_tool": ("Cozy Personal", "Practical Twist"),
    "practical_twist": ("Indie Tool", "Cozy Personal"),
}

ORE_DISCOVERY_LANE_BY_SORT_ORDER = [
    lane
    for lane, count in ORE_DISCOVERY_LANE_PLAN
    for _ in range(count)
]


def _keyword_line(keyword: dict) -> str:
    role = keyword.get("role")
    if role:
        return f"- {keyword['label']} ({role})"
    return f"- {keyword['label']}"


def build_ore_discovery_lane_plan(vein_family: str | None) -> list[str]:
    selected_family = FAMILY_DISPLAY_NAMES.get(vein_family or "")
    if not selected_family:
        return ORE_DISCOVERY_LANE_BY_SORT_ORDER.copy()

    adjacent_family, opposite_family = FAMILY_ADJACENT_AND_OPPOSITE[vein_family]
    return [
        *([selected_family] * 6),
        adjacent_family,
        adjacent_family,
        opposite_family,
        "Weird Bridge",
    ]


def _lane_distribution_lines(lane_plan: list[str]) -> str:
    counts: dict[str, int] = {}
    for lane in lane_plan:
        counts[lane] = counts.get(lane, 0) + 1
    return "\n".join(f"- {count} ores: {lane}" for lane, count in counts.items())


def _lane_sort_order_lines(lane_plan: list[str]) -> str:
    return "\n".join(
        f"- sort_order {index}: ore_lane must be {lane}"
        for index, lane in enumerate(lane_plan, start=1)
    )


def build_ore_discovery_prompt(
    keywords: list[dict],
    vein_family: str | None = None,
) -> tuple[str, str]:
    lens_lines = "\n".join(
        f"{index}. {lens}" for index, lens in enumerate(ORE_DISCOVERY_LENSES, start=1)
    )
    lane_plan = build_ore_discovery_lane_plan(vein_family)
    lane_lines = _lane_distribution_lines(lane_plan)
    lane_sort_order_lines = _lane_sort_order_lines(lane_plan)
    selected_family = FAMILY_DISPLAY_NAMES.get(vein_family or "", "Fallback Mixed")

    system_prompt = """You are the Idea Ore discovery engine for Idea Mine.

Generate Idea Ores, not finished startup plans.

System behavior:
- Generate exactly 10 Idea Ores from the provided Daily Vein keyword combination.
- Generate one ore for each internal discovery lens, in the exact order listed below.
- The 10 ores must follow the hidden lane distribution below.
- Each ore must be short, specific, and projectable.
- Keep every ore software-first: web app, mobile app, browser extension, desktop app, local utility, or digital workflow.
- Treat physical-sounding keywords such as leaf, card, board, box, or map as digital metaphors or UI surfaces unless explicitly unavoidable.
- Do not propose hardware-first MVPs, physical devices, NFC/BLE/sensors, microcontrollers, 3D printing, or physical kits.
- Avoid generic startup language.
- Avoid buzzwords unless they are part of the selected keywords.
- Do not produce market-size claims.
- Do not generate long reports.
- Do not over-explain.
- The output should feel like "this might be worth building," not "this is a complete business plan."
- Diversity is mandatory: avoid repeated titles, repeated core loops, and repeated product forms.
- Avoid exact generic product_form values such as "mobile app", "web app", "desktop app", "browser app", or "browser extension"; use more specific forms such as "lock-screen widget", "local proof locker", "calendar exporter", "card archive", "desktop OCR utility", or "browser notice triage extension".

Selected hidden Vein family: {selected_family}

Hidden family-weighted lane distribution:
{lane_lines}

Exact sort_order lane mapping:
{lane_sort_order_lines}

Internal discovery lenses:
{lens_lines}

Active keyword rules:
- Each ore must actively use exactly 3 or 4 keywords from the Daily Vein.
- active_keywords must contain exact keyword labels only, copied from the visible keyword labels.
- active_keywords must not contain roles such as Subject, Material, Tension, Shape, or Ritual / Constraint.
- If a public text field uses a visible Vein keyword label exactly, that label must be included in active_keywords for that ore.
- If active_keywords would exceed 4 labels, rewrite the public text to avoid mentioning extra keyword labels.
- Do not mention non-active Vein keyword labels in title, one_liner, short_summary, interesting_point, project_fit, risk, or mvp_hint.
- Do not force all 5 Vein keywords into every ore.
- Across all 10 ores, all 5 Vein keywords should be used multiple times.
- No single keyword label may appear in active_keywords for all 10 ores.
- Tension should appear often because it creates emotional or practical pressure.
- Shape should not appear in every ore because it can over-fix product form.

Required fields for every ore:
- sort_order
- ore_lane
- title
- one_liner
- short_summary
- interesting_point
- project_fit
- risk
- mvp_hint
- active_keywords
- generation_lens
- primary_anchor_keyword
- product_form
- core_loop_signature
- novelty_axis

Hidden metadata behavior:
- ore_lane must exactly match the lane rule for that sort_order.
- active_keywords, ore_lane, generation_lens, primary_anchor_keyword, product_form, core_loop_signature, and novelty_axis are internal only.
- generation_lens must exactly match the internal discovery lens for that sort_order.
- primary_anchor_keyword must be one of the provided keyword labels.
- primary_anchor_keyword may use the same keyword label at most 4 times across the full set.
- product_form is the product shape, such as "card archive", "desktop widget", or "private timeline".
- core_loop_signature is a short snake_case signature for the repeated user loop.
- novelty_axis names why this ore is meaningfully different from the others.
- Do not expose, explain, or mention the hidden metadata in public-facing text fields.

Lane meaning:
- Cozy Personal: emotional, cute, reflective, personal, or ritual-like apps.
- Indie Tool: weird but buildable utilities for indie builders, browsers, desktops, files, or personal systems.
- Practical Twist: real-life practical problems with a slight twist, such as safety, travel, routine, memory, decisions, or reminders.
- Weird Bridge: the oddest but still buildable bridge between the keywords.

Length guardrails:
- one_liner: one sentence.
- short_summary: 2 to 3 sentences.
- interesting_point: 1 to 2 sentences.
- project_fit: 1 to 2 sentences.
- risk: 1 to 2 sentences.
- mvp_hint: 1 sentence or a short sequence.

Product meaning:
- A Keyword is selectable idea material.
- A Vein is the provided keyword combination.
- An Idea Ore is a short project-worthy direction extracted from that Vein.
- An Idea Ore is not a complete business plan, market analysis, or pitch deck.""".format(
        selected_family=selected_family,
        lane_lines=lane_lines,
        lane_sort_order_lines=lane_sort_order_lines,
        lens_lines=lens_lines,
    )

    keyword_lines = "\n".join(_keyword_line(keyword) for keyword in keywords)

    user_prompt = f"""Daily Vein keywords:
{keyword_lines}

Create exactly 10 Idea Ores from this keyword combination. Keep them short, specific, diverse, and projectable."""

    return system_prompt, user_prompt
