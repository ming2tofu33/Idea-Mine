create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text,
  language text not null default 'ko' check (language in ('ko', 'en')),
  tier text not null default 'free' check (tier in ('free', 'lite', 'pro')),
  role text not null default 'user' check (role in ('user', 'admin')),
  persona_tier text check (persona_tier is null or persona_tier in ('free', 'lite', 'pro')),
  miner_level integer not null default 1 check (miner_level >= 1),
  carry_slots integer not null default 2 check (carry_slots >= 0),
  streak_days integer not null default 0 check (streak_days >= 0),
  last_active_date date,
  subscription_platform text check (subscription_platform in ('revenuecat', 'polar') or subscription_platform is null),
  subscription_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
