create table public.veins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null default current_date,
  slot_index integer not null check (slot_index between 1 and 3),
  keyword_ids uuid[] not null check (cardinality(keyword_ids) >= 1),
  rarity text not null default 'common' check (rarity in ('common', 'rare', 'golden', 'legend')),
  is_active boolean not null default true,
  is_selected boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index uq_veins_active_slot
on public.veins (user_id, date, slot_index)
where is_active = true;
