-- 일일 상태: 리롤 잔여, 생성 횟수, 날짜별 리셋
-- 참조: mind/06-Business/Tier-Structure.md (티어별 제한)

create table public.user_daily_state (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date default current_date not null,
  rerolls_used integer default 0,
  generations_used integer default 0,
  overviews_used integer default 0,
  ad_bonus_used boolean default false,
  created_at timestamptz default now(),

  unique (user_id, date)
);

-- 인덱스
create index idx_daily_state_user_date on public.user_daily_state (user_id, date);

-- RLS
alter table public.user_daily_state enable row level security;

create policy "Users can read own daily state"
  on public.user_daily_state for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own daily state"
  on public.user_daily_state for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own daily state"
  on public.user_daily_state for update
  to authenticated
  using (auth.uid() = user_id);
