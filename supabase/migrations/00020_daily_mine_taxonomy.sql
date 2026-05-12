-- V3 Daily Mine taxonomy metadata.
-- role and keyword_set are internal generation controls and are not exposed to clients.

alter table public.keywords
add column if not exists role text;

alter table public.keywords
add column if not exists keyword_set text;

alter table public.keywords
drop constraint if exists keywords_category_check;

alter table public.keywords
add constraint keywords_category_check
check (category in ('ai', 'who', 'domain', 'tech', 'value', 'money', 'daily_mine'));

create index if not exists idx_keywords_daily_mine_role_active
on public.keywords (keyword_set, role, is_active)
where is_active = true;

alter table public.veins
add column if not exists keyword_set text not null default 'legacy';

drop index if exists public.uq_veins_active_slot;

create unique index if not exists uq_veins_active_slot_keyword_set
on public.veins (user_id, date, slot_index, keyword_set)
where is_active = true;

alter table public.idea_ores
add column if not exists active_keywords jsonb not null default '[]'::jsonb;

alter table public.idea_ores
drop constraint if exists idea_ores_active_keywords_array;

alter table public.idea_ores
add constraint idea_ores_active_keywords_array
check (jsonb_typeof(active_keywords) = 'array');
