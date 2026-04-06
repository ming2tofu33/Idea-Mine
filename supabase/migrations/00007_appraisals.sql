create table public.appraisals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  overview_id uuid not null references public.overviews(id) on delete cascade,
  depth text not null check (depth in ('basic_free', 'basic', 'precise_lite', 'precise_pro')),
  market_fit_ko text not null default '',
  market_fit_en text not null default '',
  feasibility_ko text not null default '',
  feasibility_en text not null default '',
  risk_ko text not null default '',
  risk_en text not null default '',
  problem_fit_ko text not null default '',
  problem_fit_en text not null default '',
  differentiation_ko text not null default '',
  differentiation_en text not null default '',
  scalability_ko text not null default '',
  scalability_en text not null default '',
  created_at timestamptz not null default now()
);
