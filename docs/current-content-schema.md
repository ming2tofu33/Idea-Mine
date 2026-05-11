## Current Content Schema

Updated: 2026-05-11

This project now uses a single-language English content contract.

V3 adds Idea Ore as the central MVP object. The Daily Mine surface should use 3 pre-given keyword clusters, not manual keyword input. Mining one Vein should return 10 Idea Ores. The older Ideas, Overviews, and Appraisals contract remains historical/current-code context for the old long flow, but new MVP work should prefer the Idea Ore contract.

### Ideas

- `idea_line`
- `title`
- `summary`
- `keyword_combo`
- `tier_type` (internal generation metadata)
- `sort_order`
- `is_vaulted`

### Idea Ores

- `title`
- `one_liner`
- `short_summary`
- `interesting_point`
- `project_fit`
- `risk`
- `mvp_hint`
- `selected_keywords`
- `generation_meta` (internal diversity metadata)
- `sort_order`
- `is_vaulted`

### Project Seed Briefs

- `product_concept`
- `target_user`
- `core_loop`
- `mvp_features`
- `first_screens`
- `not_to_build`
- `data_model_hint`
- `api_hint`
- `vibe_coding_prompt`

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
- public keyword objects expose only `id` and `label`; categories/tags remain internal.
- `profiles.language` was removed from the schema and public API.
- `ai_usage_logs.language` was removed; English is now implicit runtime behavior.
- `ideation_v2_enabled` is the runtime flag for the new mining/overview path. It is `False` by default.
- when `ideation_v2_enabled=False`, `ideas.tier_type` keeps legacy internal combo labels such as `stable` and `pivot`.
- when `ideation_v2_enabled=True`, `ideas.tier_type` becomes internal branch metadata in `family|subfamily` form, for example `workflow_utility|browser_extension`.
- API clients still receive the same public idea contract: `idea_line`, `title`, `summary`, `keyword_combo`, `sort_order`, `is_vaulted`.
- overview V2 rebuilds or consumes internal `kernel + family` anchors but still writes the same flat overview fields.
- V3 stores generated Idea Ores in `idea_ores` and Project Seed Briefs in `project_seed_briefs`.
- V3 stores hidden Ore diversity metadata in `idea_ores.generation_meta`; API clients must not render it.
- Historical migration files still contain the old bilingual column names by design.
- Older planning documents may mention bilingual fields because they were written before migrations `00016` and `00017`.
