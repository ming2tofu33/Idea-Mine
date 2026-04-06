create table public.full_overviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  overview_id uuid not null unique references public.overviews(id) on delete cascade,
  concept text not null default '',
  problem text not null default '',
  target_user text not null default '',
  features_must jsonb not null default '[]'::jsonb check (jsonb_typeof(features_must) = 'array'),
  features_should jsonb not null default '[]'::jsonb check (jsonb_typeof(features_should) = 'array'),
  features_later jsonb not null default '[]'::jsonb check (jsonb_typeof(features_later) = 'array'),
  user_flow jsonb not null default '[]'::jsonb check (jsonb_typeof(user_flow) = 'array'),
  screens jsonb not null default '[]'::jsonb check (jsonb_typeof(screens) = 'array'),
  business_model text not null default '',
  business_rules jsonb not null default '[]'::jsonb check (jsonb_typeof(business_rules) = 'array'),
  mvp_scope text not null default '',
  tech_stack jsonb not null default '{}'::jsonb check (jsonb_typeof(tech_stack) = 'object'),
  data_model_sql text not null default '',
  api_endpoints jsonb not null default '[]'::jsonb check (jsonb_typeof(api_endpoints) = 'array'),
  file_structure text not null default '',
  external_services jsonb not null default '[]'::jsonb check (jsonb_typeof(external_services) = 'array'),
  auth_flow jsonb not null default '[]'::jsonb check (jsonb_typeof(auth_flow) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_full_overviews_updated_at
before update on public.full_overviews
for each row
execute function public.set_updated_at();
