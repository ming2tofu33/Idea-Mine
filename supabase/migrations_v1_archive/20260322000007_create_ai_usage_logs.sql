-- AI 비용 로깅: 모든 OpenAI 호출 기록
-- 참조: mind/09-Implementation/plans/2026-03-22-abuse-prevention-design.md

create table public.ai_usage_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  tier text not null,
  session_id uuid,
  feature_type text not null check (feature_type in (
    'mining', 'overview', 'appraisal', 'precision_appraisal',
    'deep_report', 'execution_design', 'mvp_blueprint', 'keyword_correction'
  )),
  model text not null,
  prompt_version text default 'v1',
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  total_cost_usd real not null default 0,
  response_time_ms integer,
  status text default 'success' check (status in ('success', 'error', 'filtered')),
  language text default 'ko' check (language in ('ko', 'en')),
  source text default 'app' check (source in ('app', 'web', 'mcp')),
  created_at timestamptz default now()
);

-- 인덱스: 비용 분석용
create index idx_ai_logs_user on public.ai_usage_logs (user_id, created_at);
create index idx_ai_logs_daily_cost on public.ai_usage_logs (user_id, created_at, total_cost_usd);
create index idx_ai_logs_feature on public.ai_usage_logs (feature_type, created_at);

-- RLS: 유저는 자기 로그만 읽기. 쓰기는 service_role만 (백엔드).
alter table public.ai_usage_logs enable row level security;

create policy "Users can read own usage logs"
  on public.ai_usage_logs for select
  to authenticated
  using (auth.uid() = user_id);
