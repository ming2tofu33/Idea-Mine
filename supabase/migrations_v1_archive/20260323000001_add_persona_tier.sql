-- persona_tier: admin 전용 페르소나 모드. NULL이면 admin 무제한, 값이 있으면 해당 티어로 동작.
alter table public.profiles
  add column persona_tier text default null
  check (persona_tier is null or persona_tier in ('free', 'lite', 'pro'));

-- protect_role_column 트리거를 확장해 persona_tier도 보호
create or replace function public.protect_role_column()
returns trigger as $$
begin
  if new.role is distinct from old.role then
    new.role := old.role;
  end if;
  if new.persona_tier is distinct from old.persona_tier then
    new.persona_tier := old.persona_tier;
  end if;
  return new;
end;
$$ language plpgsql security definer;
