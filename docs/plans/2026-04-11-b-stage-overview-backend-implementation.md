# Overview Backend Implementation Status

Updated: 2026-04-15

This document replaces the earlier step-by-step rewrite plan. Git history preserves that plan. This file now records what has been implemented and what still remains.

## Implemented

### 1. English-only content contract

Implemented across backend, web, and database.

- removed runtime dependence on bilingual content fields
- standardized on unsuffixed English field names
- aligned API and frontend types to the new shape

### 2. Idea-first overview anchoring

Implemented in the overview pipeline.

- selected idea drives overview generation
- `idea_line` is treated as the strongest anchor
- title and summary provide label and supporting context

### 3. Mixed-language overview bug fix

Implemented in prompts and service wiring.

- Korean and English anchor confusion is no longer relevant in runtime because overview generation is English only
- older bilingual prompt behavior is retired

### 4. Database migration

Implemented through:

- [00016_single_language_content_columns.sql](C:/Users/amy/Desktop/Idea%20Mine/supabase/migrations/00016_single_language_content_columns.sql)
- [00017_remove_bilingual_metadata.sql](C:/Users/amy/Desktop/Idea%20Mine/supabase/migrations/00017_remove_bilingual_metadata.sql)

These migrations:

- dropped Korean content columns from `ideas`, `overviews`, and `appraisals`
- renamed English content columns to unsuffixed field names
- removed the one-liner sync trigger used by the old bilingual schema
- replaced `keywords.ko/en` with `keywords.label`
- removed `profiles.language`
- removed `ai_usage_logs.language`

### 5. Web consumption update

Implemented in web pages and shared types.

- web overview pages read the single-language contract directly
- web appraisal pages read the single-language contract directly
- mine and vault surfaces use single-language idea fields

## Current Runtime Shape

### Ideas

- `idea_line`
- `title`
- `summary`

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

## Runtime References

- [backend/app/services/idea_service.py](C:/Users/amy/Desktop/Idea%20Mine/backend/app/services/idea_service.py)
- [backend/app/services/overview_service.py](C:/Users/amy/Desktop/Idea%20Mine/backend/app/services/overview_service.py)
- [backend/app/services/appraisal_service.py](C:/Users/amy/Desktop/Idea%20Mine/backend/app/services/appraisal_service.py)
- [backend/app/models/schemas.py](C:/Users/amy/Desktop/Idea%20Mine/backend/app/models/schemas.py)
- [apps/web/src/types/api.ts](C:/Users/amy/Desktop/Idea%20Mine/apps/web/src/types/api.ts)

## Explicitly Not Implemented

These items were part of earlier exploration drafts but are not the current runtime:

- nested overview document contract with `content` and `internal_meta`
- bilingual overview generation
- mobile client support
- overview storage rewrite into a document JSON shape

## Remaining Work

1. Keep tightening mining quality so overview starts from stronger ideas.
2. Add more stable overview evaluation coverage if prompt iteration continues.
3. Remove or archive any remaining obsolete plan documents when they stop being useful.

## Validation

The implementation should be treated as valid only when these stay aligned:

- database contract
- backend response model
- web type definitions
- overview rendering pages

The current schema reference lives in [current-content-schema.md](C:/Users/amy/Desktop/Idea%20Mine/docs/current-content-schema.md).
