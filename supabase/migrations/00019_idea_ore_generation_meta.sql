alter table public.idea_ores
add column if not exists generation_meta jsonb not null default '{}'::jsonb;

alter table public.idea_ores
drop constraint if exists idea_ores_generation_meta_object;

alter table public.idea_ores
add constraint idea_ores_generation_meta_object
check (jsonb_typeof(generation_meta) = 'object');

create unique index if not exists uq_idea_ores_user_vein_sort
on public.idea_ores (user_id, vein_id, sort_order)
where user_id is not null
  and vein_id is not null;
