alter table public.profiles enable row level security;
alter table public.keywords enable row level security;
alter table public.user_daily_state enable row level security;
alter table public.active_seasons enable row level security;
alter table public.veins enable row level security;
alter table public.ideas enable row level security;
alter table public.overviews enable row level security;
alter table public.appraisals enable row level security;
alter table public.full_overviews enable row level security;
alter table public.ai_usage_logs enable row level security;


create policy profiles_read_own
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

revoke update on public.profiles from anon, authenticated;
grant update (nickname, language) on public.profiles to authenticated;


create policy keywords_read_authenticated
on public.keywords
for select
to authenticated
using (true);

create policy active_seasons_read_authenticated
on public.active_seasons
for select
to authenticated
using (is_active = true);

create policy daily_state_read_own
on public.user_daily_state
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy veins_read_own
on public.veins
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy ideas_read_own
on public.ideas
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy ideas_delete_own
on public.ideas
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy overviews_read_own
on public.overviews
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy appraisals_read_own
on public.appraisals
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy full_overviews_read_own
on public.full_overviews
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy ai_usage_logs_read_own
on public.ai_usage_logs
for select
to authenticated
using ((select auth.uid()) = user_id);


create index idx_ideas_user_created
on public.ideas (user_id, created_at desc);

create index idx_ideas_vaulted_user_created
on public.ideas (user_id, created_at desc)
where is_vaulted = true;

create index idx_overviews_user_created
on public.overviews (user_id, created_at desc);

create index idx_appraisals_user_overview_created
on public.appraisals (user_id, overview_id, created_at desc);

create index idx_ai_usage_logs_user_created
on public.ai_usage_logs (user_id, created_at desc);
