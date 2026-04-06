-- 키워드 인벤토리: 6카테고리 118개 키워드 (AI 유료 전용)
-- 참조: mind/02-World-Building/Keyword-Taxonomy.md

create table public.keywords (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  category text not null check (category in ('ai', 'who', 'domain', 'tech', 'value', 'money')),
  subtype text not null,
  ko text not null,
  en text not null,
  aliases text[] default '{}',
  weight real default 1.0,
  is_premium boolean default false,
  is_seed boolean default true,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 인덱스
create index idx_keywords_category on public.keywords (category);
create index idx_keywords_category_active on public.keywords (category, is_active) where is_active = true;

-- RLS
alter table public.keywords enable row level security;

-- 키워드는 모든 인증된 사용자가 읽기 가능, 수정은 불가
create policy "Keywords are readable by authenticated users"
  on public.keywords for select
  to authenticated
  using (true);
