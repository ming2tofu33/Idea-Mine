create table public.overviews (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null unique references public.ideas(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  concept_ko text not null default '',
  concept_en text not null default '',
  problem_ko text not null default '',
  problem_en text not null default '',
  target_ko text not null default '',
  target_en text not null default '',
  features_ko text not null default '',
  features_en text not null default '',
  differentiator_ko text not null default '',
  differentiator_en text not null default '',
  revenue_ko text not null default '',
  revenue_en text not null default '',
  mvp_scope_ko text not null default '',
  mvp_scope_en text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_overviews_updated_at
before update on public.overviews
for each row
execute function public.set_updated_at();
