# Ideation V2 Design

Updated: 2026-04-16

This document captures the approved V2 ideation design for the new `mining + overview` vertical slice.

The goal is to replace direct keyword-to-idea generation with a constrained ideation engine that:

- keeps the user-facing input simple
- preserves product coherence for the selected seed
- produces meaningfully different product forms from the same seed
- supports both software-native and software-enabled products
- treats AI as a premium-only modifier rather than a core pillar

## Product Direction

The product remains keyword-first.

The user should not be forced into a chat-first ideation flow. The system proposes candidate ideas from a chosen seed bundle, then the user selects one idea and deepens it into project documents.

The core difference from generic chat tools is:

- user chooses a seed
- system generates a coherent spread of candidates
- user picks one
- the project evolves into overview, then deeper planning documents

## User-Facing Input Model

### Free

- uses a recommended bundle of exactly 5 keywords
- no custom keywords
- no AI keyword
- optimized for speed and clarity

### Premium

- can choose a variable number of keywords
- can add custom keywords
- can use AI keywords
- should be shown guidance that `3-5 keywords usually produce the strongest spread`

The user-facing interface remains keyword-only. Internal roles and normalization are hidden.

## Internal Role Taxonomy

Visible keywords are mapped into internal roles using soft mapping.

Core roles:

- `actor`
- `tension`
- `outcome`
- `environment`
- `surface_hint`
- `mechanism_hint`
- `premium_modifier`

Soft mapping means:

- each keyword should have one preferred role where possible
- some keywords may carry one secondary role
- high-confidence roles shape the problem kernel
- lower-confidence roles shape branching and flavor

## Surface Families

V2 should branch across 7 core product families, with concrete product forms handled as subfamilies.

Core families:

1. `workflow_utility`
2. `workspace_studio`
3. `dashboard_ops`
4. `assistant_copilot`
5. `agent_automation`
6. `platform_network`
7. `real_world_companion`

Subfamilies provide the concrete shape of the candidate idea, for example:

- `browser_extension`
- `side_panel`
- `overlay_tool`
- `drafting_workspace`
- `operator_console`
- `workflow_agent`
- `integration_layer`
- `device_companion_app`

This keeps the top-level branch space controlled while still allowing varied outputs.

## Software Scope

The engine should generate:

- software-native products
- software-enabled products

It should not drift into:

- pure hardware products
- offline-only service businesses
- ecommerce product concepts where software is not the core leverage

`real_world_companion` exists to capture software-enabled opportunities without expanding into non-software business ideation.

## AI Policy

AI is not a core ideation pillar.

AI is a premium-only modifier.

Rules:

- free users never receive AI-modified candidates
- premium users only receive AI-modified variants when they explicitly include an AI keyword
- AI should enhance a subset of candidates, not define the whole candidate set

Default AI budget:

- free: `0`
- premium without AI keyword: `0`
- premium with AI keyword: `1`
- strong AI relevance: `2`

## V2 Pipeline

The approved V2 flow is:

```text
visible keywords
  -> normalize meaning
  -> build one primary problem kernel
  -> score surface families
  -> create bounded branch plan
  -> generate 10 candidates
  -> user selects one
  -> build overview from kernel + surface + selected idea
```

The engine should not write candidate copy directly from raw keywords.

## Internal Runtime Objects

### `SelectedKeyword`

Represents the exact keyword chosen by the user.

Suggested fields:

- `label`
- `source` (`system` or `custom`)
- `premium_only`
- `catalog_id?`
- `raw_input?`

### `NormalizedSeed`

Represents the seed after internal interpretation.

Suggested fields:

- `actors[]`
- `tensions[]`
- `outcomes[]`
- `environments[]`
- `surface_hints[]`
- `mechanism_hints[]`
- `premium_modifiers[]`
- `ambiguous_keywords[]`
- `unresolved_keywords[]`
- `role_confidence_map`
- `seed_strength_score`
- `seed_strength_label`
- `physical_world_relevance`

### `KernelSet`

V2 should default to a single kernel.

Suggested fields:

- `primary_kernel`
- `alternate_kernel?` only when the seed is genuinely ambiguous

### `FamilyScoreSet`

Suggested fields:

- `family`
- `score`
- `reasons[]`

### `BranchPlan`

Suggested fields:

- `primary_family`
- `secondary_family`
- `contrast_family?`
- `slot_distribution`
- `primary_allowed_subfamilies[]`
- `secondary_allowed_subfamilies[]`
- `contrast_allowed_subfamilies[]`
- `ai_variant_budget`
- `branching_confidence`

## Family Scoring

Family scoring is rule-first.

Score components:

- role signal score
- keyword family bias
- kernel fit adjustment
- physical-world bias

The system should score for plausibility first, then spread for diversity second.

## Family Relationship Graph

The family graph is used to select a coherent secondary family and a meaningful contrast family.

Selection rules:

- `primary`: highest-scoring family
- `secondary`: highest viable adjacent or strong conditional family
- `contrast`: viable far family that still preserves the same actor, tension, and outcome

The graph exists to prevent random spread.

## Branching Strategy

The approved branching strategy is bounded hybrid branching.

The engine should spread candidates enough to feel different, but not so widely that they stop feeling like variations of the same seed.

### Free

Recommended default:

- `5 primary`
- `3 secondary`
- `2 contrast`

Free bundles are curated, so this distribution should usually remain stable.

### Premium

Distribution can adjust based on seed strength:

- thin: `6/3/1` or `7/3/0`
- balanced: `5/3/2`
- dense: `4/4/2`

Contrast is optional and should be skipped when it would cause drift.

## Overview V2

Overview V2 should not be a speculative PM write-up.

It should deepen the selected idea using:

- the selected idea copy
- the chosen kernel
- the chosen family
- the selected subfamily
- the normalized seed

Overview V2 should answer:

1. What is the product?
2. Who is it for?
3. What exact moment or tension does it solve?
4. Why is this product form the right one?
5. What are the core features?
6. What is the MVP?
7. What must be validated next?

It should avoid:

- invented pricing
- invented competitor specifics
- invented detailed personas
- broad drift away from the selected idea

## Migration Strategy

V1 should not be deleted first.

Recommended rollout:

1. build `mining v2`
2. build `overview v2`
3. compare V1 and V2 quality
4. route traffic through V2 once stable
5. migrate downstream stages later
6. remove V1 after V2 is proven

This should be implemented as a sidecar architecture rather than an in-place rewrite.
