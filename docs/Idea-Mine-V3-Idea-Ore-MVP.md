# Idea Mine V3: Idea Ore MVP Direction

Updated: 2026-05-11

This document is the product direction source for Idea Mine V3. It resets the MVP around a clearer Idea Ore flow:

`Receive 3 Daily Veins -> Mine 10 Idea Ores -> Save to Vault -> Projectize on Web -> Generate Project Documents`

Idea Mine is not a generic app that immediately generates "good ideas." It is a product that turns attractive keyword combinations into discoverable Idea Ores, then turns selected ores into project-ready documents in Web Lab.

Keyword taxonomy details for the Daily Mine V3 direction are recorded in `docs/Idea-Mine-V3-Daily-Mine-Keyword-Taxonomy.md`.

## 1. V3 Product Thesis

Idea Mine helps users discover project-worthy Idea Ores from attractive keyword combinations, then turn only the saved ores into buildable project documents in Web Lab.

The product rhythm is:

1. The product gives the user 3 pre-made keyword clusters.
2. Each pre-given keyword cluster is a Vein.
3. The user mines one Vein.
4. The system extracts 10 short Idea Ores from that Vein.
5. The user saves promising ores to Vault.
6. The user opens a saved ore in Web Lab.
7. Web Lab projectizes the ore into a Project Seed Brief and Vibe Coding Prompt.

V3 is a focus reset, not a request to add more surface area. The main goal is to make the MVP feel lightweight at discovery time and practical at projectization time.

## 2. Product Split

### Daily Mine

Daily Mine is the lightweight daily discovery experience.

- Users do not need to write long thoughts.
- Users do not need to search for, type, or manually select keywords.
- The product gives users 3 pre-made Veins of attractive keywords.
- The product generates short Idea Ores.
- Users quickly save interesting ores to Vault.
- Daily Mine must not contain long reports, blueprint editing, complex project documents, or heavy planning workflows.

For the V3 MVP, `/mine` may be implemented on web first as a prototype of the future Daily Mine behavior. Even on web, it should feel fast, card-based, and lightweight. The user should be able to mine from one of 3 pre-given Veins without keyword input setup.

### Web Lab

Web Lab is the deep projectization workspace.

- Users open saved Idea Ores from Vault.
- The web app turns selected ores into Project Seed Briefs, Blueprints, and Vibe Coding Prompts.
- Longer documents, implementation planning, export, copy, and blueprint workflows belong here.

The practical split is:

- App / Daily Mine: mine and save Idea Ores.
- Web / Web Lab: turn Idea Ores into buildable project documents.

## 3. MVP Flow

The V3 MVP flow is:

`3 Daily Veins -> 10 Idea Ores -> Vault -> Projectize -> Project Seed Brief`

The older long flow:

`Mine -> Overview -> Appraisal -> Product Design -> Blueprint -> Roadmap`

should not be the primary MVP path. It can remain in the codebase where useful, but it should be hidden from the main V3 user journey and treated as future Web Lab expansion.

## 4. Core Terms

### Keyword

A Keyword is an idea material used to compose a Vein.

In Daily Mine, keywords are pre-given by the product. Users should not need to type keywords, search for keywords, or manually assemble a combination before mining.

Keyword categories may include:

- `who`
- `domain`
- `mood`
- `mechanism`
- `value`
- `form`
- `constraint`
- `ai`
- `tech`

Keyword categories are internal metadata. They must not be shown as visible tags in Daily Mine, Vault, or Web Lab. The user should see the keyword labels only, because visible category tags can narrow interpretation and reduce the range of ideas the Vein suggests.

Example keywords:

- cat
- dream
- emotional archive
- symbol interpretation
- collecting
- cute but not childish
- desktop app
- personal ritual
- AI guide

### Vein

A Vein is a pre-given keyword combination.

A Vein is not an idea. It is a cluster of provided keywords that produces 10 Idea Ores when mined in the MVP.

Example:

`cat + dream + emotional archive + symbol interpretation + collecting`

For the MVP, Vein can remain an internal concept unless the UI needs to explain the provided keyword cluster.

### Idea Ore

An Idea Ore is not a finished product idea. It is a short project-worthy idea direction extracted from a keyword combination.

Each Idea Ore must include:

- `title`
- `one_liner`
- `short_summary`
- `interesting_point`
- `project_fit`
- `risk`
- `mvp_hint`
- `selected_keywords`
- `sort_order`
- `is_vaulted`

An Idea Ore should feel short, specific, and projectable.

Example:

Title: Cat Dream Archive

One-liner: A cozy app where a cat interpreter turns your dreams into symbolic cards you can collect.

Interesting Point: Dream journaling, cat characters, and symbolic collection naturally reinforce each other.

Project Fit: This can become a small MVP with only dream input, interpretation cards, and an archive.

Risk: If it leans too hard into fortune telling, it may become another generic horoscope app.

MVP Hint: Start with dream input -> cat interpretation card -> dream archive.

### Vault

Vault is where saved Idea Ores live.

The user should save only ores that feel worth mining later. Vault should make those saved ores easy to revisit and open in Web Lab.

### Projectize

Projectize is the web-only transformation step. It turns one selected Idea Ore into a project-ready brief.

Projectized output should include:

- `product_concept`
- `target_user`
- `core_loop`
- `mvp_features`
- `first_screens`
- `not_to_build`
- `data_model_hint`
- `api_hint`
- `vibe_coding_prompt`

### Project Seed Brief

Project Seed Brief is the first project-ready document generated from an Idea Ore.

It should be more practical than inspirational. It should answer:

- What are we building?
- Who is it for?
- What does the user repeatedly do?
- What should the first MVP contain?
- What should we avoid building now?
- What should Codex, Claude Code, or Cursor build first?

## 5. MVP Surfaces

### `/mine`

Purpose: lightweight pre-given Vein review and Idea Ore discovery.

Requirements:

- Show 3 pre-given Veins.
- Each Vein should show keyword labels only.
- Let the user choose one Vein to mine.
- Do not require the user to select or type keywords.
- Provide a `Mine Ores` button.
- Show 10 generated Idea Ore cards.
- Keep the UI lightweight and fast.
- Make the screen feel like the future Daily Mine experience, even if implemented on web first.

Each Idea Ore card should show:

- title
- one_liner
- interesting_point
- project_fit
- risk
- mvp_hint
- Save to Vault button

### `/vault`

Purpose: saved Idea Ore library.

Each saved ore should show:

- title
- one_liner
- selected keywords
- Open in Lab button

### `/lab/[oreId]`

Purpose: web-only projectization workspace.

Requirements:

- Show the selected Idea Ore at the top.
- Provide a `Projectize` button.
- Show the generated Project Seed Brief.
- Include copy buttons for:
  - Project Seed Brief
  - Vibe Coding Prompt

This page belongs to the web and deep-work experience.

## 6. Backend Direction

Prefer adding a clean new Ore flow over patching the old mining and overview flow.

Recommended structure:

- `backend/app/routers/ore.py`
- `backend/app/services/ore_service.py`
- `backend/app/prompts/ore_discovery.py`
- `backend/app/prompts/ore_projectize.py`

Reuse existing FastAPI, Supabase, OpenAI structured output, service, and typing patterns where useful.

## 7. API Contract

### `GET /ore/veins/today`

Returns the 3 server-provided Daily Veins for the current user. Keyword categories remain internal and are not returned.

Output:

```json
{
  "veins": [
    {
      "id": "...",
      "slot_index": 1,
      "keywords": [
        { "id": "...", "label": "Cat" },
        { "id": "...", "label": "Dream" }
      ],
      "is_mined": false
    }
  ],
  "generations_used": 0,
  "generations_max": 1
}
```

### `POST /ore/discover`

Mines one server-provided Daily Vein. The client sends only `vein_id`; the backend resolves the keywords from the active daily Vein and does not trust client-provided keyword objects.

If the same Vein was already mined, this endpoint returns the existing 10 Idea Ores instead of generating a new set.

Input:

```json
{
  "vein_id": "..."
}
```

Output:

```json
{
  "vein": {
    "id": "...",
    "keywords": [
      { "id": "...", "label": "Cat" },
      { "id": "...", "label": "Dream" }
    ]
  },
  "ores": [
    {
      "id": "...",
      "title": "...",
      "one_liner": "...",
      "short_summary": "...",
      "interesting_point": "...",
      "project_fit": "...",
      "risk": "...",
      "mvp_hint": "...",
      "selected_keywords": [
        { "id": "...", "label": "Cat" },
        { "id": "...", "label": "Dream" }
      ],
      "sort_order": 1,
      "is_vaulted": false
    }
  ]
}
```

### `PATCH /ore/{ore_id}/vault`

Marks an Idea Ore as vaulted.

### `GET /ore/vault`

Returns saved Idea Ores.

### `POST /ore/{ore_id}/projectize`

Turns an Idea Ore into a Project Seed Brief.

Output:

```json
{
  "id": "...",
  "ore_id": "...",
  "product_concept": "...",
  "target_user": "...",
  "core_loop": ["..."],
  "mvp_features": ["..."],
  "first_screens": ["..."],
  "not_to_build": ["..."],
  "data_model_hint": "...",
  "api_hint": "...",
  "vibe_coding_prompt": "..."
}
```

## 8. Data Model Direction

Create new tables if needed:

- `idea_ores`
- `project_seed_briefs`

### `idea_ores`

- `id uuid primary key`
- `user_id uuid nullable`
- `vein_id uuid nullable`
- `title text`
- `one_liner text`
- `short_summary text`
- `interesting_point text`
- `project_fit text`
- `risk text`
- `mvp_hint text`
- `selected_keywords jsonb`
- `active_keywords jsonb`
- `generation_meta jsonb`
- `sort_order integer`
- `is_vaulted boolean default false`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

`active_keywords` stores the 3 to 4 Vein keyword objects actually used by each Ore. Public Ore responses map this subset to `selected_keywords` so the UI does not show every Vein keyword on every Ore.

`generation_meta` stores internal-only diversity metadata such as `ore_lane`, `generation_lens`, `primary_anchor_keyword`, `product_form`, `core_loop_signature`, and `novelty_axis`. It must not be returned to the UI.

### `project_seed_briefs`

- `id uuid primary key`
- `user_id uuid nullable`
- `ore_id uuid references idea_ores(id)`
- `product_concept text`
- `target_user text`
- `core_loop jsonb`
- `mvp_features jsonb`
- `first_screens jsonb`
- `not_to_build jsonb`
- `data_model_hint text`
- `api_hint text`
- `vibe_coding_prompt text`
- `created_at timestamptz default now()`

Implementation notes:

- V3 reuses the existing `veins` table for server-provided Daily Veins, separated by `veins.keyword_set='daily_mine_v3'`.
- `POST /ore/discover` persists generated ores immediately with `is_vaulted=false`, so refresh and Lab navigation do not lose the result.
- `POST /ore/{ore_id}/projectize` returns an existing Project Seed Brief if one already exists. Regeneration can be a later feature.
- `(user_id, vein_id, sort_order)` should be unique for persisted Idea Ores.

## 9. Prompt Direction

### `ore_discovery.py`

The model must generate Idea Ores, not finished startup plans.

Daily Mine discovery is a lightweight interaction, so the default generation
configuration should favor response time over deep reasoning. The backend should
default Ore discovery to a fast GPT-5 family model such as `gpt-5-mini` with
`reasoning_effort=minimal`, while still allowing environment overrides if a
higher-quality model is needed later. Web Lab projectization can use a stronger
model separately because it belongs to the deeper work phase.

System behavior:

- Generate exactly 10 Idea Ores from the provided Daily Vein keyword combination.
- Follow the hidden lane distribution: 3 Cozy Personal, 3 Indie Tool, 3 Practical Twist, and 1 Weird Bridge.
- Each Ore must actively use exactly 3 or 4 of the 5 Vein keywords.
- Generate one ore per internal discovery lens:
  - Direct Core
  - Emotional Ritual
  - Archive / Collection
  - Character / Companion
  - Visual Card System
  - Tiny Utility
  - Desktop / Browser Tool
  - Constraint-first MVP
  - Weird but Buildable
  - Builder-friendly Project Seed
- Each ore must be short, specific, and projectable.
- Avoid repeated titles, repeated core loops, and overused product forms.
- Avoid generic startup language.
- Avoid buzzwords unless they are part of the selected keywords.
- Do not produce market-size claims.
- Do not generate long reports.
- Do not over-explain.
- The output should feel like "this might be worth building," not "this is a complete business plan."

Required fields:

- `title`
- `one_liner`
- `short_summary`
- `interesting_point`
- `project_fit`
- `risk`
- `mvp_hint`
- `sort_order`
- `generation_lens`
- `primary_anchor_keyword`
- `product_form`
- `core_loop_signature`
- `novelty_axis`

The last five fields are hidden metadata for backend diversity validation and should not appear in the UI.

Suggested length guardrails:

- `one_liner`: one sentence.
- `short_summary`: 2 to 3 sentences.
- `interesting_point`: 1 to 2 sentences.
- `project_fit`: 1 to 2 sentences.
- `risk`: 1 to 2 sentences.
- `mvp_hint`: 1 sentence or a short sequence.

### `ore_projectize.py`

The model must turn one selected Idea Ore into a project-ready brief.

System behavior:

- Stay faithful to the selected ore.
- Do not turn it into a different product.
- Make it practical for an indie builder or vibe coding workflow.
- Prefer concrete screens, actions, data models, and first implementation steps.
- Keep the document focused on MVP scope.
- Explicitly include what not to build yet.

Required fields:

- `product_concept`
- `target_user`
- `core_loop`
- `mvp_features`
- `first_screens`
- `not_to_build`
- `data_model_hint`
- `api_hint`
- `vibe_coding_prompt`

## 10. UX Principles

- Daily Mine is for receiving a pre-given Vein, mining, and saving.
- Web Lab is for reading, projectizing, blueprinting, and vibe coding.
- The first output should be a short Idea Ore, not a long report.
- Do not force users to write detailed ideas manually.
- Do not force users to manually choose or enter keywords in the Daily Mine MVP.
- Do not position the product as a "good idea generator."
- Use "idea ore discovery" positioning.
- Keep the mobile or Daily Mine experience lightweight.
- Keep project documents inside Web Lab.

## 11. Non-Goals

V3 MVP should not:

- Build a generic AI startup idea generator.
- Make the first output a long report.
- Require detailed manual idea writing.
- Require manual keyword selection or keyword entry before mining.
- Put blueprint editing inside Daily Mine.
- Put roadmap generation into the main discovery path.
- Expand the old Overview, Appraisal, Product Design, Blueprint, and Roadmap flow as the primary MVP path.
- Add new heavy workflow layers before the Ore, Vault, and Projectize loop works.

## 12. Acceptance Criteria

1. User can see 3 pre-given Daily Veins.
2. User can mine one Vein into exactly 10 short Idea Ores.
3. Generated ores are not long reports.
4. Each ore includes `title`, `one_liner`, `interesting_point`, `project_fit`, `risk`, and `mvp_hint`.
5. User can save an ore to Vault.
6. User can open a saved ore in Lab.
7. User can Projectize an ore into a Project Seed Brief.
8. Project Seed Brief includes product concept, target user, core loop, MVP features, first screens, not-to-build list, data model hint, API hint, and vibe coding prompt.
9. The old Overview, Product Design, Blueprint, and Roadmap flow is not the main MVP path.
10. The product clearly feels like:
    - App / Daily Mine: mine and save Idea Ores.
    - Web Lab: turn ores into buildable project documents.

## 13. Implementation Principles

- Reuse existing Next.js, FastAPI, Supabase, and OpenAI structured output infrastructure where useful.
- Do not do a destructive rewrite unless necessary.
- Prefer adding a clean new Ore flow over patching the old mining and overview flow.
- Keep API contracts typed on both backend and frontend.
- Keep prompts isolated in dedicated prompt files.
- Keep the MVP simple and testable.

## 14. Documentation Notes

This document supersedes V2 product direction for future MVP planning.

Older V2 documents remain useful as historical context for web-first design, visual tone, and previous Mine-Vault-Lab thinking. They should not override the V3 Idea Ore flow.

The V3 source of truth is:

`3 Daily Veins -> 10 Idea Ores -> Vault -> Projectize -> Project Seed Brief`
