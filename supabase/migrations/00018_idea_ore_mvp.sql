create table public.idea_ores (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade,
    vein_id uuid,
    title text not null default '',
    one_liner text not null default '',
    short_summary text not null default '',
    interesting_point text not null default '',
    project_fit text not null default '',
    risk text not null default '',
    mvp_hint text not null default '',
    selected_keywords jsonb not null default '[]'::jsonb,
    sort_order integer not null check (sort_order >= 1 and sort_order <= 10),
    is_vaulted boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (jsonb_typeof(selected_keywords) = 'array')
);

create table public.project_seed_briefs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade,
    ore_id uuid not null references public.idea_ores(id) on delete cascade,
    product_concept text not null default '',
    target_user text not null default '',
    core_loop jsonb not null default '[]'::jsonb,
    mvp_features jsonb not null default '[]'::jsonb,
    first_screens jsonb not null default '[]'::jsonb,
    not_to_build jsonb not null default '[]'::jsonb,
    data_model_hint text not null default '',
    api_hint text not null default '',
    vibe_coding_prompt text not null default '',
    created_at timestamptz not null default now(),
    unique (ore_id),
    check (jsonb_typeof(core_loop) = 'array'),
    check (jsonb_typeof(mvp_features) = 'array'),
    check (jsonb_typeof(first_screens) = 'array'),
    check (jsonb_typeof(not_to_build) = 'array')
);

alter table public.idea_ores enable row level security;
alter table public.project_seed_briefs enable row level security;

create policy idea_ores_read_own
on public.idea_ores
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy idea_ores_delete_own
on public.idea_ores
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy project_seed_briefs_read_own
on public.project_seed_briefs
for select
to authenticated
using ((select auth.uid()) = user_id);

create index idx_idea_ores_user_created
on public.idea_ores (user_id, created_at desc);

create index idx_idea_ores_vaulted_user_created
on public.idea_ores (user_id, created_at desc)
where is_vaulted = true;

create index idx_project_seed_briefs_user_created
on public.project_seed_briefs (user_id, created_at desc);

create index idx_project_seed_briefs_ore
on public.project_seed_briefs (ore_id);

create trigger set_idea_ores_updated_at
before update on public.idea_ores
for each row
execute function public.set_updated_at();

alter table public.ai_usage_logs
drop constraint if exists ai_usage_logs_feature_type_check;

alter table public.ai_usage_logs
add constraint ai_usage_logs_feature_type_check
check (
  feature_type in (
    'mining',
    'overview',
    'appraisal',
    'full_overview',
    'product_design',
    'blueprint',
    'roadmap',
    'ore_discovery',
    'ore_projectize'
  )
);
