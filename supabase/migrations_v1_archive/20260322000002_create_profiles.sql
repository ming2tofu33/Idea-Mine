-- 유저 프로필: Supabase Auth와 연결
-- 참조: mind/06-Business/Tier-Structure.md

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nickname text,
  language text default 'ko' check (language in ('ko', 'en')),
  tier text default 'free' check (tier in ('free', 'lite', 'pro')),
  miner_level integer default 1,
  carry_slots integer default 2,
  streak_days integer default 0,
  last_active_date date,
  subscription_platform text check (subscription_platform in ('revenuecat', 'polar', null)),
  subscription_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Auth 유저 생성 시 자동으로 profiles 행 생성하는 트리거
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
