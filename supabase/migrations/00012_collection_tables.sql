-- 프로젝트 컬렉션: 풀 개요서 15섹션 → 3개 독립 문서로 분리
-- product_designs (제품 설계서), blueprints (기술 청사진), roadmaps (실행 로드맵)

-- 1. 제품 설계서
create table public.product_designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  overview_id uuid not null references public.overviews(id) on delete cascade,
  user_flow jsonb not null default '[]'::jsonb,
  screens jsonb not null default '[]'::jsonb,
  features_must jsonb not null default '[]'::jsonb,
  features_should jsonb not null default '[]'::jsonb,
  features_later jsonb not null default '[]'::jsonb,
  business_model text not null default '',
  business_rules jsonb not null default '[]'::jsonb,
  mvp_scope text not null default '',
  axes jsonb,
  created_at timestamptz not null default now()
);

-- 2. 기술 청사진
create table public.blueprints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  design_id uuid not null references public.product_designs(id) on delete cascade,
  tech_stack jsonb not null default '[]'::jsonb,
  data_model_sql text not null default '',
  api_endpoints jsonb not null default '[]'::jsonb,
  file_structure text not null default '',
  external_services jsonb not null default '[]'::jsonb,
  auth_flow jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- 3. 실행 로드맵
create table public.roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  blueprint_id uuid not null references public.blueprints(id) on delete cascade,
  phase_0 jsonb not null default '[]'::jsonb,
  phase_1 jsonb not null default '[]'::jsonb,
  phase_2 jsonb not null default '[]'::jsonb,
  validation_checkpoints jsonb not null default '[]'::jsonb,
  estimated_complexity text not null default '',
  first_sprint_tasks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- 4. RLS
alter table public.product_designs enable row level security;
alter table public.blueprints enable row level security;
alter table public.roadmaps enable row level security;

create policy "Users can read own product_designs"
  on public.product_designs for select using ((select auth.uid()) = user_id);
create policy "Users can delete own product_designs"
  on public.product_designs for delete using ((select auth.uid()) = user_id);

create policy "Users can read own blueprints"
  on public.blueprints for select using ((select auth.uid()) = user_id);
create policy "Users can delete own blueprints"
  on public.blueprints for delete using ((select auth.uid()) = user_id);

create policy "Users can read own roadmaps"
  on public.roadmaps for select using ((select auth.uid()) = user_id);
create policy "Users can delete own roadmaps"
  on public.roadmaps for delete using ((select auth.uid()) = user_id);

-- 5. 인덱스
create index idx_product_designs_user_created on public.product_designs (user_id, created_at desc);
create index idx_product_designs_overview on public.product_designs (overview_id);
create index idx_blueprints_user_created on public.blueprints (user_id, created_at desc);
create index idx_blueprints_design on public.blueprints (design_id);
create index idx_roadmaps_user_created on public.roadmaps (user_id, created_at desc);
create index idx_roadmaps_blueprint on public.roadmaps (blueprint_id);
