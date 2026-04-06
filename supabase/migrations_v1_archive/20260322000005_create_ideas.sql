-- 아이디어 원석: 광맥에서 생성된 10개 아이디어
-- 참조: mind/02-World-Building/Keyword-Taxonomy.md (4군 구조)

create table public.ideas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  vein_id uuid references public.veins(id) on delete cascade not null,
  title text not null,
  summary text not null,
  keyword_combo jsonb not null,
  tier_type text not null check (tier_type in ('stable', 'expansion', 'pivot', 'rare')),
  sort_order integer not null check (sort_order between 1 and 10),
  is_vaulted boolean default false,
  language text default 'ko' check (language in ('ko', 'en')),
  created_at timestamptz default now()
);

-- 인덱스
create index idx_ideas_user on public.ideas (user_id);
create index idx_ideas_vein on public.ideas (vein_id);
create index idx_ideas_vaulted on public.ideas (user_id, is_vaulted) where is_vaulted = true;

-- RLS
alter table public.ideas enable row level security;

create policy "Users can read own ideas"
  on public.ideas for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own ideas"
  on public.ideas for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own ideas"
  on public.ideas for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own ideas"
  on public.ideas for delete
  to authenticated
  using (auth.uid() = user_id);
