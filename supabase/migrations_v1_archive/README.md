# V1 Migration Archive

These timestamp-based migrations define the original V1 schema and are kept only
for historical reference.

They were moved out of `supabase/migrations/` so the active V2 migration chain
can use deterministic `00001_...` ordering without colliding with legacy V1
objects during `supabase db reset`.

If V1 ever needs to be replayed locally again, restore these files into the
active migrations directory in a dedicated branch or separate Supabase project.
