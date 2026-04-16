# Keyword Role Mapping

Updated: 2026-04-16

## Decision

We are not replacing the visible keyword system yet.

The current product still shows the existing 6 visible keyword categories:

- `who`
- `domain`
- `tech`
- `value`
- `ai`
- `money`

The next stage is to improve only the internal interpretation layer used by Ideation V2.

That means:

- visible keyword chips stay unchanged
- current DB seed corpus stays unchanged
- internal seed normalization becomes more precise by reading `category + subtype`

## Current Seed Corpus

The current keyword catalog contains 118 curated seeds across 6 categories.

### `who` subtypes

- `demographic`
- `household`
- `life-stage`
- `lifestyle`
- `role`

Internal default:

- all `who.*` -> `actor`

### `domain` subtypes

- `industry`
- `function`
- `ecosystem`

Internal default:

- all `domain.*` -> `environment`

### `tech` subtypes

- `platform`
- `delivery`
- `interface`
- `product-form`

Internal default:

- all `tech.*` -> `surface_hint`

Rationale:

- current V2 quality depends heavily on product shape diversity
- `Dashboard`, `Marketplace`, `Browser Extension`, and `Automation Workflow` are not just mechanisms
- they are the clearest surface-level branch signals

### `value` subtypes

- `efficiency`
- `emotional`
- `engagement`
- `growth`
- `trust`
- `wellbeing`

Internal default:

- all `value.*` -> `outcome`

### `ai` subtypes

- `agent`
- `retrieval`
- `generation`
- `modality`
- `prediction`
- `optimization`

Internal default:

- all `ai.*` -> `premium_modifier`

Rationale:

- AI should stay optional and premium-oriented
- AI changes the product mechanism and flavor, but should not become the whole idea axis

### `money` subtypes

- `recurring`
- `distribution`
- `transactional`
- `enterprise`

Internal default:

- `money.*` is intentionally ignored during seed normalization

Rationale:

- revenue logic should not steer the core product concept at the mining stage
- business model can still be read later from the original keyword combo during overview/appraisal/business model writing

## Family Bias Rules

Subtype-aware mapping is only half of the improvement.
The scoring layer also needs to translate product-shape keywords into family bias.

Current directional rules:

- `Dashboard`, `Data Visualization`, and ops-heavy functional domains -> `dashboard_ops`
- `Marketplace`, `Community Platform`, `API Service`, and networked ecosystems -> `platform_network`
- `Automation Workflow` -> `agent_automation`
- `Chatbot`, `Voice Interface`, `Slack/Discord Bot`, `Plugin/Widget` -> `assistant_copilot`
- `Browser Extension` and browsing contexts -> `workflow_utility` with secondary `assistant_copilot`
- `Wearable`, `IoT/Sensor`, `Smart Home`, and physical/device-linked domains -> `real_world_companion`
- generation-heavy AI -> `workspace_studio`
- agentic AI -> `assistant_copilot` + `agent_automation`
- retrieval-heavy AI -> `assistant_copilot` + `workspace_studio` with light `platform_network`

## Implementation Rule

When a keyword has no explicit per-label override:

1. use explicit label metadata if it exists
2. else infer role from `category + subtype`
3. then let family scoring interpret the resulting surface hints, environments, and premium modifiers

This keeps the system compatible with the current keyword catalog while moving ideation quality toward the V2 branch-family design.

## Next Cleanup

After this mapping layer stabilizes, the next cleanup should be:

1. add broader explicit label overrides for high-impact keywords
2. decide whether selected `keyword_combo` rows should retain hidden internal metadata long-term
3. only then consider a DB-level taxonomy rewrite
