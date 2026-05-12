# V3 Keyword Family Rework Design

## Context

The current V3 Daily Mine flow works mechanically, but the generated Idea Ores still feel inconsistent. Recent live tests showed that the LLM follows the requested structure, but the keyword combinations are sometimes too narrow, too literal, or awkwardly mixed.

Examples of problematic pulls:

- `tiny note` tends to flatten every idea into a small memo app.
- `printable sheet` pulls outputs toward PDFs and physical artifacts.
- `packing board` makes the idea feel like a checklist or hardware object.
- `three saved items max` over-determines the product as a three-item limiter.
- `small guilt`, `waiting anxiety`, and similar terms can make ideas feel therapy-lite instead of product-worthy.
- Mixing unrelated practical and emotional keywords in one random pool can create vague combinations like downloads + packing + leaving home.

The product direction is still correct:

> Daily Mine should give users lightweight, surprising, projectable Idea Ores without forcing them to choose or type keywords.

The issue is not just prompt wording. The keyword system needs a stronger generative structure.

## Decision

Daily Mine should provide three different kinds of Daily Veins every day:

1. `cozy_personal`
2. `indie_tool`
3. `practical_twist`

These families are internal only. The UI should still show only keyword labels and never expose tags, roles, families, or categories.

Each Daily Vein remains a five-keyword combination, but the five keywords should be sampled from a coherent family-specific pool instead of one shared mixed pool.

Each mined Vein should still return 10 Idea Ores, but the Ore distribution should be weighted around the selected Vein family:

- 6 family-core Ores
- 2 adjacent-family variations
- 1 opposite-family twist
- 1 weird-but-buildable bridge

This preserves variety without making the selected Vein meaningless.

## Goals

- Generate Daily Veins that feel intentionally different from each other.
- Keep user effort low: users receive three prepared Veins and choose one to mine.
- Produce Ores that can become software projects, not vague concepts or physical products.
- Support cute/emotional personal apps, weird indie tools, and practical life apps in the same Daily Mine system.
- Improve keyword quality without exposing internal metadata to users.
- Keep the MVP architecture simple: no multi-stage generation yet.

## Non-Goals

- Do not let users manually choose keywords in the MVP Daily Mine flow.
- Do not expose keyword role, category, subtype, or family in the UI.
- Do not turn Daily Mine into a generic idea generator.
- Do not require a two-stage LLM pipeline yet.
- Do not delete the existing long-form Overview / Blueprint / Roadmap flow.

## Vein Families

### Cozy Personal

This family creates emotional, cute, reflective, or intimate personal software.

Expected feel:

- Soft but specific
- Personal ritual
- Collecting, archiving, reflecting
- Companion-like or character-like when useful
- Small apps that users may return to daily

Good anchor examples:

- cat
- bedtime
- old photo
- dream fragment
- tiny memory
- private ritual
- mood card
- saved voice
- symbolic object
- home corner

Avoid overuse of:

- generic anxiety words
- therapy-heavy framing
- horoscope-like interpretation
- vague cuteness without utility

### Indie Tool

This family creates strange but buildable tools for personal workflows, browsers, desktops, files, tabs, clips, and small automations.

Expected feel:

- Builder-friendly
- Weird but implementable
- Useful in a narrow context
- Can become a small web, browser, or desktop app
- Clear repeatable loop

Good anchor examples:

- browser tab
- download folder
- clipboard
- saved link
- file inbox
- unread pile
- calendar gap
- local shortcut
- command palette
- side panel

Avoid overuse of:

- notes as the default output
- dashboards that do everything
- generic productivity language
- enterprise workflow framing

### Practical Twist

This family creates grounded apps that solve real daily-life problems with a small unusual angle.

Expected feel:

- Practical but not boring
- Connected to real situations
- Useful for travel, safety, preparation, memory, home, routines, social follow-up, or errands
- Works as a simple app or web service
- Clear first MVP

Good anchor examples:

- before leaving home
- travel day
- safety check
- grocery run
- shared home
- appointment prep
- lost item
- receipt clue
- route memory
- awkward follow-up

Avoid overuse of:

- fear-heavy safety framing
- generic checklist apps
- physical boards
- broad life-management systems

## Keyword Editing Rules

The keyword pool should be edited around generative usefulness, not surface charm.

Keep or add keywords that:

- Are concrete enough to imply user actions.
- Are open enough to combine in multiple ways.
- Can lead to a software surface.
- Suggest a repeatable loop.
- Create tension without over-determining the product.

Remove, rename, or lower the weight of keywords that:

- Force one output format too strongly.
- Pull ideas into physical products.
- Make every Ore a note, card, PDF, or checklist.
- Add emotional weight without a product action.
- Are cute but not operational.

Current keywords to review first:

- `tiny note`
- `printable sheet`
- `packing board`
- `three saved items max`
- `small guilt`
- `waiting anxiety`
- `safety anxiety`
- `weather report`
- `plant leaf`

These are not all necessarily bad. Some may survive as low-frequency keywords or family-specific variants, but they should not dominate Daily Vein generation.

## Vein Composition

Each family should still use the five existing roles:

1. Subject
2. Material
3. Tension
4. Shape
5. Ritual / Constraint

However, each family should have its own role-specific pool.

Example Cozy Personal Vein:

- `cat`
- `dream fragment`
- `fear of forgetting`
- `mood card`
- `one saved moment per night`

Example Indie Tool Vein:

- `browser tab`
- `download folder`
- `context loss`
- `side panel`
- `before closing the laptop`

Example Practical Twist Vein:

- `travel day`
- `receipt clue`
- `last-minute doubt`
- `mobile check-in`
- `under 60 seconds`

The important distinction is that these combinations are coherent before the LLM sees them. The prompt should not have to rescue a bad random mix.

## Ore Distribution

When mining a selected Vein, the prompt should know the selected Vein family as hidden context.

The 10 Ore slots should be distributed as:

1. Family core
2. Family core
3. Family core
4. Family core
5. Family core
6. Family core
7. Adjacent-family variation
8. Adjacent-family variation
9. Opposite-family twist
10. Weird-but-buildable bridge

Examples:

- A Cozy Personal Vein should mostly produce personal ritual / archive / companion Ores, with a few tool or practical variations.
- An Indie Tool Vein should mostly produce browser / desktop / workflow tools, with a few emotional or practical variations.
- A Practical Twist Vein should mostly produce real-life utility apps, with a few cozy or indie tool variations.

This replaces the current equal 3 / 3 / 3 / 1 lane split. The old split improved variety, but it made every Vein behave too similarly.

## Data Model Impact

The existing hidden keyword metadata approach is still right. The likely implementation change is to add internal family metadata to keywords and veins.

Possible fields:

- `keywords.family`
- `veins.family`

These should be internal only.

Public API responses should continue to expose only:

- keyword `id`
- keyword `label`

The UI should not display family, category, role, subtype, or any other internal generation metadata.

## Prompt Impact

`ore_discovery.py` should be adjusted to:

- Include the selected Vein family as hidden context.
- Replace the current equal lane split with the 6 / 2 / 1 / 1 family-weighted distribution.
- Require each Ore to use 3-4 active keywords.
- Keep software-first constraints.
- Keep hidden metadata for validation.
- Avoid generic startup language, long reports, market claims, and physical-product-first outputs.

The prompt should still produce exactly 10 Ores in one structured-output call.

## Validation Impact

The current validation layer should remain, with small additions:

- Confirm exactly 10 Ores.
- Confirm sort orders 1-10.
- Reject duplicate titles.
- Reject duplicate `core_loop_signature`.
- Limit repeated `product_form`.
- Keep public field length guardrails.
- Ensure active keywords are selected from the Vein.
- Ensure public text includes enough evidence for the active keywords.
- Keep hardware-first / physical-product-first rejection.

Potential new validation:

- Ensure the generated metadata contains the expected family slot for each sort order.
- Ensure at least six Ores are marked as family-core for the selected family.

## Test And Evaluation Plan

Before implementation, create a small manual evaluation set:

- 3 Cozy Personal test Veins
- 3 Indie Tool test Veins
- 3 Practical Twist test Veins
- 1 weird bridge stress-test Vein

For each test Vein, judge:

- Are the 10 Ores clearly different?
- Does the family identity show up?
- Are at least 6 Ores faithful to the selected family?
- Are the adjacent and opposite variations useful rather than random?
- Does each Ore feel like software?
- Is there at least one idea worth saving to Vault?

The strongest success metric for this stage:

> A mined Vein should produce at least 2-3 Ores that feel worth opening in Web Lab.

## Implementation Sequence

1. Update the V3 keyword taxonomy document with the three-family decision.
2. Add internal family metadata to the Daily Mine keyword pool.
3. Refactor Daily Vein generation to return one Vein per family.
4. Update the Ore discovery prompt to use the 6 / 2 / 1 / 1 slot distribution.
5. Add or adjust tests for family-specific Vein generation.
6. Add or adjust tests for prompt slot requirements.
7. Run backend tests.
8. Run a live generation sample and compare it against the manual evaluation criteria.

## Open Questions

- Should all three families appear every day, or should the system sometimes rotate two practical and one experimental Vein?
- Should `weird_bridge` become its own occasional Daily Vein family later?
- Should saved user preference eventually influence which family appears first?

For the current MVP, the answer should stay simple:

> Always show one Cozy Personal Vein, one Indie Tool Vein, and one Practical Twist Vein.
