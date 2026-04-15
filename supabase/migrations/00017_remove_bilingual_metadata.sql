alter table public.keywords
add column if not exists label text;

update public.keywords
set label = coalesce(label, en);

alter table public.keywords
alter column label set not null;

alter table public.keywords
drop column if exists ko,
drop column if exists en;

alter table public.profiles
drop column if exists language;

revoke update on public.profiles from anon, authenticated;
grant update (nickname) on public.profiles to authenticated;

alter table public.ai_usage_logs
drop constraint if exists ai_usage_logs_feature_type_check,
drop column if exists language;

alter table public.ai_usage_logs
add constraint ai_usage_logs_feature_type_check
check (
  feature_type in (
    'mining',
    'overview',
    'appraisal',
    'full_overview',
    'product_design',
    'blueprint',
    'roadmap'
  )
);
