-- V3 Daily Mine keyword family metadata.
-- family groups Daily Mine keywords and generated veins into themed pools.

alter table public.keywords
add column if not exists family text;

alter table public.keywords
drop constraint if exists keywords_family_check;

alter table public.keywords
add constraint keywords_family_check
check (
    family is null
    or family in ('cozy_personal', 'indie_tool', 'practical_twist')
);

create index if not exists idx_keywords_daily_mine_family_role_active
on public.keywords (keyword_set, family, role, is_active)
where is_active = true;

alter table public.veins
add column if not exists family text;

alter table public.veins
drop constraint if exists veins_family_check;

alter table public.veins
add constraint veins_family_check
check (
    family is null
    or family in ('cozy_personal', 'indie_tool', 'practical_twist')
);

create index if not exists idx_veins_daily_mine_family_active
on public.veins (user_id, date, keyword_set, family, is_active)
where is_active = true;
