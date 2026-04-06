create table public.user_daily_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null default current_date,
  rerolls_used integer not null default 0 check (rerolls_used >= 0),
  generations_used integer not null default 0 check (generations_used >= 0),
  overviews_used integer not null default 0 check (overviews_used >= 0),
  ad_bonus_used boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create table public.active_seasons (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  start_date date not null,
  end_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (start_date <= end_date)
);

create index idx_active_seasons_active_dates
on public.active_seasons (start_date, end_date)
where is_active = true;
