-- 프로젝트 개요 + 기본 감정
-- 참조: mind/02-World-Building/Keyword-Taxonomy.md (상세 개요서 객체 구조)

create table public.overviews (
  id uuid default gen_random_uuid() primary key,
  idea_id uuid references public.ideas(id) on delete cascade unique not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  problem text,
  target_user text,
  core_features text,
  differentiator text,
  market_context text,
  business_model text,
  competitors text,
  mvp_scope text,
  risks text,
  appraisal_score real,
  appraisal_summary text,
  language text default 'ko' check (language in ('ko', 'en')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 인덱스
create index idx_overviews_user on public.overviews (user_id);

-- RLS
alter table public.overviews enable row level security;

create policy "Users can read own overviews"
  on public.overviews for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own overviews"
  on public.overviews for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own overviews"
  on public.overviews for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own overviews"
  on public.overviews for delete
  to authenticated
  using (auth.uid() = user_id);
