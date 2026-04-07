-- Pipeline v2: tech_stack이 dict(object)에서 list(array)로 변경됨
-- 기존 constraint: jsonb_typeof(tech_stack) = 'object'
-- 변경: object 또는 array 모두 허용

alter table full_overviews
  drop constraint if exists full_overviews_tech_stack_check;

alter table full_overviews
  add constraint full_overviews_tech_stack_check
  check (jsonb_typeof(tech_stack) in ('object', 'array'));

-- 기본값도 빈 배열로 변경
alter table full_overviews
  alter column tech_stack set default '[]'::jsonb;
