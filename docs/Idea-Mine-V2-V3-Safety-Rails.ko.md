# IDEA MINE Safety Rails

Updated: 2026-04-15

This document replaces older v2/v3 transition notes. Git history preserves the old draft state. This file now describes the current operating rules for the project.

## Current Product Shape

- Product surface: web only
- Content language: English only
- Core loop: `Mine -> Overview -> Appraisal -> Product Design -> Blueprint -> Roadmap`
- `Full Overview` remains a parallel deep-document/export path, not the parent of blueprint or roadmap.

## Current Content Contract

### Ideas

- `idea_line`
- `title`
- `summary`
- `keyword_combo`
- `tier_type` for internal generation control only
- `sort_order`
- `is_vaulted`

### Overviews

- `concept`
- `problem`
- `target`
- `features`
- `differentiator`
- `revenue`
- `mvp_scope`

### Appraisals

- `market_fit`
- `problem_fit`
- `feasibility`
- `differentiation`
- `scalability`
- `risk`

## Database Rules

1. Repo migrations are the source of truth.
2. Remote database state must always match the ordered migration chain.
3. Applied migrations are append-only. Do not rewrite old applied migration files.
4. Do not reintroduce bilingual content columns such as `*_ko` or `*_en`.
5. Runtime content tables should stay flat unless there is a strong query or rendering reason to use nested JSON.

## API Rules

1. Public API contracts should expose product meaning, not internal generation mechanics.
2. `tier_type` may exist in storage and internal services, but it should not be required by public clients.
3. Mutating and generation flows go through backend services, not direct client writes.
4. Web types should follow the backend response contract exactly.

## Prompt and Generation Rules

1. The mining stage is anchored on:
   - `idea_line` as the hook
   - `title` as the label
   - `summary` as the expanded explanation
2. Overview must stay faithful to the selected idea and should not invent a different product.
3. Appraisal must review the chosen product, not rewrite it.
4. Internal generation labels such as `stable`, `expansion`, `pivot`, and `rare` are operational metadata, not user-facing product language.

## Product Scope Rules

1. Web is the active product. Mobile is not in active scope.
2. Documentation should assume a browser-first experience.
3. New work should improve output quality, reliability, and clarity before expanding product breadth.

## Migration Milestone

`00016_single_language_content_columns.sql` is the schema milestone that finalized the English-only runtime content contract:

- removed Korean content columns
- renamed English columns to unsuffixed field names
- removed the one-liner sync trigger that supported the old bilingual shape

## What To Avoid

- Reintroducing bilingual content storage
- Reintroducing mobile assumptions into active product docs
- Letting UI or API contracts depend on internal generation tiers
- Writing new planning docs against obsolete columns
- Treating old design notes as current architecture

## Reference

For the current field-level contract, use [current-content-schema.md](C:/Users/amy/Desktop/Idea%20Mine/docs/current-content-schema.md).
