-- profiles에 role 컬럼 추가 (admin 계정 관리용)

alter table public.profiles
  add column role text default 'user' check (role in ('user', 'admin'));
