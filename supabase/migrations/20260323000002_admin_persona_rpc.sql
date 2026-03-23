-- admin 전용 페르소나 변경 RPC. security definer로 트리거를 우회.
create or replace function public.exec_admin_persona(
  target_user_id uuid,
  target_tier text default null
)
returns void as $$
begin
  -- 호출자가 admin인지 확인
  if not exists (
    select 1 from profiles where id = target_user_id and role = 'admin'
  ) then
    raise exception 'Not an admin user';
  end if;

  -- 트리거를 일시 비활성화하고 persona_tier 변경
  alter table profiles disable trigger on_profile_update_protect_role;

  update profiles
  set persona_tier = target_tier
  where id = target_user_id;

  alter table profiles enable trigger on_profile_update_protect_role;
end;
$$ language plpgsql security definer;
