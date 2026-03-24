-- 희귀도 4등급 체계로 전환
-- 기존: common, shiny, rare (DB) / common, uncommon, rare (백엔드)
-- 새:   common, rare, golden, legend

-- 1. 기존 constraint 먼저 삭제 (임시값 허용 위해)
alter table public.veins drop constraint if exists veins_rarity_check;

-- 2. 기존 데이터 변환 (순서 중요: rare → golden 먼저, shiny → rare 나중)
update public.veins set rarity = 'golden' where rarity = 'rare';
update public.veins set rarity = 'rare' where rarity in ('shiny', 'uncommon');

-- 3. 새 constraint 추가
alter table public.veins add constraint veins_rarity_check
  check (rarity in ('common', 'rare', 'golden', 'legend'));
