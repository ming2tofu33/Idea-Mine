-- 광맥: 오늘의 키워드 조합 세트 (유저별 날짜별)
-- 참조: mind/03-Spaces/The-Mine.md

create table public.veins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date default current_date not null,
  slot_index integer not null check (slot_index between 1 and 3),
  keyword_ids uuid[] not null,
  rarity text default 'common' check (rarity in ('common', 'shiny', 'rare')),
  is_selected boolean default false,
  created_at timestamptz default now(),

  unique (user_id, date, slot_index)
);

-- 인덱스
create index idx_veins_user_date on public.veins (user_id, date);

-- RLS
alter table public.veins enable row level security;

create policy "Users can read own veins"
  on public.veins for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own veins"
  on public.veins for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own veins"
  on public.veins for update
  to authenticated
  using (auth.uid() = user_id);
