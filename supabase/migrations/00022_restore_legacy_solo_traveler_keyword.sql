-- Repair the legacy keyword row that could be overwritten by older
-- non-namespaced Daily Mine seed runs. Current Daily Mine slugs are
-- namespaced with daily-mine-v3-* to prevent this from recurring.

update public.keywords
set
  category = 'who',
  subtype = 'lifestyle',
  label = 'Solo Traveler',
  role = null,
  family = null,
  keyword_set = null,
  is_active = true,
  is_premium = false,
  is_seed = true
where slug = 'solo-traveler'
  and (
    category = 'daily_mine'
    or keyword_set = 'daily_mine_v3'
    or is_active = false
  );
