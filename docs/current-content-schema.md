## Current Content Schema

Updated: 2026-04-15

This project now uses a single-language English content contract.

### Ideas

- `idea_line`
- `title`
- `summary`
- `keyword_combo`
- `tier_type` (internal generation metadata)
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

### Notes

- `*_ko` and `*_en` content columns were removed by [00016_single_language_content_columns.sql](C:/Users/amy/Desktop/Idea%20Mine/supabase/migrations/00016_single_language_content_columns.sql).
- remaining bilingual metadata was removed by [00017_remove_bilingual_metadata.sql](C:/Users/amy/Desktop/Idea%20Mine/supabase/migrations/00017_remove_bilingual_metadata.sql).
- `keywords` now expose one public field: `label`.
- `profiles.language` was removed from the schema and public API.
- `ai_usage_logs.language` was removed; English is now implicit runtime behavior.
- `ideation_v2_enabled` is the runtime flag for the new mining/overview path. It is `False` by default.
- when `ideation_v2_enabled=False`, `ideas.tier_type` keeps legacy internal combo labels such as `stable` and `pivot`.
- when `ideation_v2_enabled=True`, `ideas.tier_type` becomes internal branch metadata in `family|subfamily` form, for example `workflow_utility|browser_extension`.
- API clients still receive the same public idea contract: `idea_line`, `title`, `summary`, `keyword_combo`, `sort_order`, `is_vaulted`.
- overview V2 rebuilds or consumes internal `kernel + family` anchors but still writes the same flat overview fields.
- Historical migration files still contain the old bilingual column names by design.
- Older planning documents may mention bilingual fields because they were written before migrations `00016` and `00017`.
