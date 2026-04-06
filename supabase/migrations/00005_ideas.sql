create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  vein_id uuid not null references public.veins(id) on delete cascade,
  title_ko text not null,
  title_en text not null,
  summary_ko text not null,
  summary_en text not null,
  keyword_combo jsonb not null check (
    jsonb_typeof(keyword_combo) = 'array'
    and jsonb_array_length(keyword_combo) >= 1
  ),
  tier_type text not null check (tier_type in ('stable', 'expansion', 'pivot', 'rare')),
  sort_order integer not null check (sort_order between 1 and 10),
  is_vaulted boolean not null default false,
  created_at timestamptz not null default now()
);
