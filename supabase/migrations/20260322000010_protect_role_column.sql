-- role 컬럼 보호: 유저가 직접 role을 변경하지 못하게 트리거로 방어
-- RLS update 정책은 자기 행 수정을 허용하지만, role은 service_role만 변경 가능해야 함

create or replace function public.protect_role_column()
returns trigger as $$
begin
  -- role이 변경되려 하면 원래 값으로 되돌림
  if new.role is distinct from old.role then
    new.role := old.role;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_update_protect_role
  before update on public.profiles
  for each row execute procedure public.protect_role_column();
