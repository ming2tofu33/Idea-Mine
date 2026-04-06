create table public.ai_usage_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete set null,
    tier text not null,
    session_id uuid,
    feature_type text not null check (feature_type in ('mining', 'overview', 'appraisal', 'full_overview')),
    feature_variant text,
    model text not null,
    prompt_version text not null default 'v1',
    input_tokens integer not null default 0 check (input_tokens >= 0),
    output_tokens integer not null default 0 check (output_tokens >= 0),
    total_cost_usd numeric(12, 6) not null default 0 check (total_cost_usd >= 0),
    response_time_ms integer check (response_time_ms is null or response_time_ms >= 0),
    status text not null default 'success' check (status in ('success', 'error', 'filtered')),
    language text not null default 'ko' check (language in ('ko', 'en')),
    source text not null default 'app' check (source in ('app', 'web', 'mcp')),
    created_at timestamptz not null default now()
);


create or replace function public.exec_admin_persona(target_user_id uuid, target_tier text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if not exists (
        select 1
        from public.profiles
        where id = (select auth.uid()) and role = 'admin'
    ) then
        raise exception 'Admin access required';
    end if;

    if target_tier is not null and target_tier not in ('free', 'lite', 'pro') then
        raise exception 'Invalid persona tier';
    end if;

    update public.profiles
    set persona_tier = target_tier
    where id = target_user_id;

    if not found then
        raise exception 'Target user not found';
    end if;
end;
$$;
