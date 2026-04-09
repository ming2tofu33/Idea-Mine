-- Experience Events: 비로그인 체험 플로우의 최소 계측
-- append-only, 익명 insert 허용, 읽기는 서비스 롤만

create table if not exists public.experience_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  event_name text not null,
  route text not null,
  vein_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_experience_events_created_at
  on public.experience_events (created_at desc);

create index if not exists idx_experience_events_event_name
  on public.experience_events (event_name, created_at desc);

-- RLS: 익명 사용자도 insert 가능, select/update/delete는 차단
alter table public.experience_events enable row level security;

drop policy if exists "experience_events_anon_insert" on public.experience_events;
create policy "experience_events_anon_insert"
  on public.experience_events
  for insert
  to anon, authenticated
  with check (true);

-- select은 명시적으로 service_role만 허용 (기본 deny)
