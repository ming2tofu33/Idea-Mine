# Overview Backend Design

Updated: 2026-04-15

This document replaces the earlier redesign draft. Git history preserves the old plan. This file now describes the current overview backend design that the runtime uses.

## Goal

Turn one selected idea into a concrete project overview that is consistent, readable, and downstream-safe.

The overview is not a speculative concept document. It is the first structured project brief in the main product chain.

## Current Contract

The overview output is a flat single-language document with these fields:

- `concept`
- `problem`
- `target`
- `features`
- `differentiator`
- `revenue`
- `mvp_scope`

This contract is persisted in `public.overviews` and returned directly to the web client.

## Input Anchors

Overview generation is anchored by the selected idea, not by a freeform market rewrite.

Primary inputs:

- `idea_line`
- `title`
- `summary`
- `keyword_combo`

Priority order:

1. `idea_line` defines the product hook
2. `title` defines the label
3. `summary` provides expanded context
4. keywords provide constraint and framing

## Generation Flow

The current runtime flow is:

1. Read the selected idea
2. Build a focused concept anchor
3. Expand that anchor into the overview sections
4. Persist the overview in the flat single-language shape

The design objective is constraint, not exploration. Once an idea is selected, overview should deepen the same product rather than inventing a new one.

## Section Expectations

### concept

- one clear product statement
- must echo the selected idea

### problem

- real user behavior and current workaround
- no hidden solution pitch

### target

- one concrete user in one believable situation

### features

- screen or action oriented
- should read like product behavior, not investor copy

### differentiator

- should compare against believable alternatives
- must avoid generic claims like "better personalization"

### revenue

- should describe monetization logic clearly
- should not dominate the product definition

### mvp_scope

- clear in-scope and out-of-scope boundaries

## Language Rules

- English only
- no bilingual output
- no translation fallbacks

## Storage Rules

The database is now aligned to the runtime contract.

- old `*_ko` columns are removed
- old `*_en` columns were renamed to unsuffixed field names
- migration milestone: [00016_single_language_content_columns.sql](C:/Users/amy/Desktop/Idea%20Mine/supabase/migrations/00016_single_language_content_columns.sql)
- remaining bilingual metadata was removed in [00017_remove_bilingual_metadata.sql](C:/Users/amy/Desktop/Idea%20Mine/supabase/migrations/00017_remove_bilingual_metadata.sql)
- keyword references use a single public field: `label`
- profile language preference is removed from runtime and API contracts

## Frontend Consumption

The web app consumes the overview directly using the same flat contract.

Pages and components should render these exact fields and should not reconstruct older bilingual shapes.

## Non-Goals

- nested overview document format
- bilingual overview generation
- mobile-specific rendering rules
- using overview as a replacement for product design, blueprint, or roadmap

## Current Risk Areas

1. Prompt quality can still drift if the selected idea is weak.
2. Overview quality is only as good as the mining output it expands.
3. The flat overview shape is practical, but it can become verbose if prompts are not kept disciplined.

## Reference Files

- [backend/app/services/overview_service.py](C:/Users/amy/Desktop/Idea%20Mine/backend/app/services/overview_service.py)
- [backend/app/prompts/concept.py](C:/Users/amy/Desktop/Idea%20Mine/backend/app/prompts/concept.py)
- [backend/app/prompts/overview.py](C:/Users/amy/Desktop/Idea%20Mine/backend/app/prompts/overview.py)
- [backend/app/models/schemas.py](C:/Users/amy/Desktop/Idea%20Mine/backend/app/models/schemas.py)
