-- V2 keyword catalog: 6 categories, 118 curated seeds.
-- Source: mind/02-World-Building/Keyword-Taxonomy.md

create table public.keywords (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null check (category in ('ai', 'who', 'domain', 'tech', 'value', 'money')),
  subtype text not null,
  ko text not null,
  en text not null,
  aliases text[] not null default '{}',
  weight real not null default 1.0,
  is_premium boolean not null default false,
  is_seed boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_keywords_category_active
on public.keywords (category, is_active)
where is_active = true;

-- AI (18, premium-only)
insert into public.keywords (slug, category, subtype, ko, en, is_premium) values
  ('llm-agent', 'ai', 'agent', 'LLM 에이전트', 'LLM Agent', true),
  ('ai-copilot', 'ai', 'agent', 'AI 코파일럿', 'AI Copilot', true),
  ('rag', 'ai', 'retrieval', 'RAG (검색 증강 생성)', 'RAG (Retrieval-Augmented Generation)', true),
  ('vector-search', 'ai', 'retrieval', '벡터 검색', 'Vector Search', true),
  ('knowledge-graph', 'ai', 'retrieval', '지식 그래프', 'Knowledge Graph', true),
  ('document-understanding-ai', 'ai', 'retrieval', '문서 이해 AI', 'Document Understanding AI', true),
  ('image-generation-ai', 'ai', 'generation', '이미지 생성 AI', 'Image Generation AI', true),
  ('generative-ai', 'ai', 'generation', '생성형 AI', 'Generative AI', true),
  ('multimodal-ai', 'ai', 'modality', '멀티모달 AI', 'Multimodal AI', true),
  ('voice-ai', 'ai', 'modality', '음성 AI (TTS/STT)', 'Voice AI (TTS/STT)', true),
  ('computer-vision', 'ai', 'modality', '컴퓨터 비전', 'Computer Vision', true),
  ('nlp', 'ai', 'modality', '자연어 처리 (NLP)', 'Natural Language Processing', true),
  ('recommendation-engine', 'ai', 'prediction', '추천 엔진', 'Recommendation Engine', true),
  ('emotion-ai', 'ai', 'prediction', '감정 인식 AI', 'Emotion AI', true),
  ('predictive-ai', 'ai', 'prediction', '예측 AI', 'Predictive AI', true),
  ('on-device-ai', 'ai', 'optimization', '온디바이스 AI', 'On-device AI', true),
  ('edge-ai', 'ai', 'optimization', '엣지 AI', 'Edge AI', true),
  ('fine-tuning', 'ai', 'optimization', '파인튜닝/커스텀 모델', 'Fine-tuning / Custom Model', true);

-- Who (21)
insert into public.keywords (slug, category, subtype, ko, en) values
  ('single-person-household', 'who', 'household', '1인 가구', 'Single-person Household'),
  ('gen-z', 'who', 'demographic', 'Z세대', 'Gen Z'),
  ('gen-alpha', 'who', 'demographic', '알파세대', 'Gen Alpha'),
  ('senior', 'who', 'demographic', '시니어', 'Senior'),
  ('multi-jobber', 'who', 'lifestyle', 'N잡러', 'Multi-jobber'),
  ('dink', 'who', 'household', '딩크족', 'DINK (Dual Income, No Kids)'),
  ('ai-pm', 'who', 'role', 'AI PM/기획자', 'AI PM / Product Planner'),
  ('pet-owner-household', 'who', 'household', '반려동물 가구', 'Pet Owner Household'),
  ('digital-nomad', 'who', 'lifestyle', '디지털 노마드', 'Digital Nomad'),
  ('small-business-owner', 'who', 'role', '소상공인 (SME)', 'Small Business Owner'),
  ('job-seeker', 'who', 'life-stage', '취준생', 'Job Seeker'),
  ('foreign-resident', 'who', 'demographic', '외국인 거주자', 'Foreign Resident'),
  ('solo-creator', 'who', 'lifestyle', '1인 크리에이터', 'Solo Creator'),
  ('aspiring-founder', 'who', 'life-stage', '창업 준비자', 'Aspiring Founder'),
  ('freelancer', 'who', 'lifestyle', '프리랜서', 'Freelancer'),
  ('solo-traveler', 'who', 'lifestyle', '나홀로 여행객', 'Solo Traveler'),
  ('digital-native-senior', 'who', 'demographic', '디지털 네이티브 시니어', 'Digital-native Senior'),
  ('solopreneur', 'who', 'role', '1인 사업자 (솔로프리너)', 'Solopreneur'),
  ('newlyweds', 'who', 'life-stage', '신혼부부', 'Newlyweds'),
  ('parents-young-kids', 'who', 'life-stage', '육아 부모', 'Parents with Young Kids'),
  ('pre-retiree', 'who', 'life-stage', '은퇴 준비자', 'Pre-retiree');

-- Domain (23)
insert into public.keywords (slug, category, subtype, ko, en) values
  ('fintech', 'domain', 'industry', '핀테크', 'Fintech'),
  ('healthcare', 'domain', 'industry', '헬스케어', 'Healthcare'),
  ('edtech', 'domain', 'industry', '에듀테크', 'Edtech'),
  ('commerce', 'domain', 'industry', '커머스', 'Commerce'),
  ('logistics', 'domain', 'industry', '로지스틱스', 'Logistics'),
  ('smart-home', 'domain', 'ecosystem', '스마트홈', 'Smart Home'),
  ('martech', 'domain', 'function', '마테크', 'MarTech'),
  ('proptech', 'domain', 'ecosystem', '프롭테크', 'Proptech'),
  ('k-culture', 'domain', 'ecosystem', 'K-컬처', 'K-Culture'),
  ('beautytech', 'domain', 'industry', '뷰티테크', 'Beautytech'),
  ('mental-health', 'domain', 'industry', '멘탈헬스', 'Mental Health'),
  ('traveltech', 'domain', 'industry', '트래블테크', 'Traveltech'),
  ('legaltech', 'domain', 'industry', '리걸테크', 'Legaltech'),
  ('hr-tech', 'domain', 'function', 'HR테크', 'HR-tech'),
  ('food-beverage', 'domain', 'industry', 'F&B (외식업)', 'Food & Beverage'),
  ('entertainment', 'domain', 'industry', '엔터테인먼트', 'Entertainment'),
  ('sleeptech', 'domain', 'industry', '슬립테크', 'Sleeptech'),
  ('pet-care', 'domain', 'industry', '펫케어', 'Pet Care'),
  ('climatetech', 'domain', 'industry', '기후테크', 'Climatetech'),
  ('creator-economy', 'domain', 'ecosystem', '크리에이터 이코노미', 'Creator Economy'),
  ('salestech', 'domain', 'function', '세일즈테크', 'Salestech'),
  ('designtech', 'domain', 'function', '디자인테크', 'Designtech'),
  ('devops-infra', 'domain', 'function', '데브옵스/인프라', 'DevOps/Infra');

-- Tech (18)
insert into public.keywords (slug, category, subtype, ko, en) values
  ('mobile-app', 'tech', 'platform', '모바일 앱', 'Mobile App'),
  ('web-service', 'tech', 'platform', '웹 서비스', 'Web Service'),
  ('chatbot', 'tech', 'interface', '챗봇', 'Chatbot'),
  ('api-service', 'tech', 'product-form', 'API 서비스', 'API Service'),
  ('browser-extension', 'tech', 'delivery', '브라우저 확장', 'Browser Extension'),
  ('slack-discord-bot', 'tech', 'delivery', '슬랙/디스코드 봇', 'Slack/Discord Bot'),
  ('voice-interface', 'tech', 'interface', '음성 인터페이스', 'Voice Interface'),
  ('wearable', 'tech', 'delivery', '웨어러블', 'Wearable'),
  ('iot-sensor', 'tech', 'delivery', 'IoT/센서', 'IoT/Sensor'),
  ('marketplace', 'tech', 'product-form', '마켓플레이스', 'Marketplace'),
  ('ar-vr', 'tech', 'interface', 'AR/VR', 'AR/VR'),
  ('dashboard', 'tech', 'platform', '대시보드', 'Dashboard'),
  ('automation-workflow', 'tech', 'product-form', '자동화 워크플로우', 'Automation Workflow'),
  ('data-visualization', 'tech', 'product-form', '데이터 시각화', 'Data Visualization'),
  ('desktop-app', 'tech', 'platform', '데스크톱 앱', 'Desktop App'),
  ('community-platform', 'tech', 'product-form', '커뮤니티 플랫폼', 'Community Platform'),
  ('plugin-widget', 'tech', 'delivery', '플러그인/위젯', 'Plugin/Widget'),
  ('email-newsletter-tool', 'tech', 'product-form', '이메일/뉴스레터 툴', 'Email/Newsletter Tool');

-- Value (22)
insert into public.keywords (slug, category, subtype, ko, en) values
  ('time-saving', 'value', 'efficiency', '시간 단축', 'Time Saving'),
  ('loneliness-relief', 'value', 'emotional', '외로움 해소', 'Loneliness Relief'),
  ('productivity-boost', 'value', 'efficiency', '생산성 극대화', 'Productivity Boost'),
  ('operational-efficiency', 'value', 'efficiency', '운영 효율', 'Operational Efficiency'),
  ('cost-reduction', 'value', 'efficiency', '비용 절감', 'Cost Reduction'),
  ('emotional-care', 'value', 'emotional', '감정 케어', 'Emotional Care'),
  ('accuracy-trust', 'value', 'trust', '정확도/신뢰도 향상', 'Accuracy & Trust Improvement'),
  ('fun-gamification', 'value', 'engagement', '재미 (게이미피케이션)', 'Fun (Gamification)'),
  ('safety-security', 'value', 'trust', '안전/보안', 'Safety/Security'),
  ('automation', 'value', 'efficiency', '자동화', 'Automation'),
  ('sense-of-belonging', 'value', 'emotional', '소속감', 'Sense of Belonging'),
  ('skill-development', 'value', 'growth', '스킬 향상', 'Skill Development'),
  ('data-privacy', 'value', 'trust', '데이터 프라이버시', 'Data Privacy'),
  ('creative-inspiration', 'value', 'growth', '창의적 영감', 'Creative Inspiration'),
  ('health-tracking', 'value', 'wellbeing', '건강 트래킹', 'Health Tracking'),
  ('effort-visualization', 'value', 'engagement', '노력의 시각화', 'Effort Visualization'),
  ('psychological-safety', 'value', 'emotional', '심리적 안전감', 'Psychological Safety'),
  ('digital-detox', 'value', 'wellbeing', '디지털 디톡스', 'Digital Detox'),
  ('accessibility', 'value', 'wellbeing', '접근성 향상', 'Accessibility Improvement'),
  ('habit-formation', 'value', 'engagement', '습관 형성', 'Habit Formation'),
  ('career-growth', 'value', 'growth', '커리어 성장', 'Career Growth'),
  ('self-actualization', 'value', 'growth', '자아실현', 'Self-actualization');

-- Money (16)
insert into public.keywords (slug, category, subtype, ko, en) values
  ('subscription-saas', 'money', 'recurring', '구독형 (SaaS)', 'Subscription (SaaS)'),
  ('freemium', 'money', 'recurring', '프리미엄 (Freemium)', 'Freemium'),
  ('marketplace-commission', 'money', 'distribution', '중개 수수료', 'Marketplace Commission'),
  ('data-monetization', 'money', 'distribution', '데이터 판매', 'Data Monetization'),
  ('ad-supported', 'money', 'transactional', '광고 기반', 'Ad-supported'),
  ('api-pricing', 'money', 'transactional', 'API 과금', 'API Pricing'),
  ('b2b-saas', 'money', 'enterprise', 'B2B SaaS', 'B2B SaaS'),
  ('white-labeling', 'money', 'distribution', '화이트 라벨링', 'White Labeling'),
  ('pay-per-use', 'money', 'transactional', '건당 결제 (Pay-per-use)', 'Pay-per-use'),
  ('licensing', 'money', 'distribution', '라이선싱', 'Licensing'),
  ('referral-affiliate', 'money', 'distribution', '리퍼럴 (제휴)', 'Referral/Affiliate'),
  ('hardware-bundle', 'money', 'enterprise', '하드웨어 결합형', 'Hardware Bundle'),
  ('membership-community', 'money', 'recurring', '멤버십/커뮤니티', 'Membership/Community'),
  ('success-fee', 'money', 'transactional', '성공 보수형', 'Success Fee'),
  ('tiered-pricing', 'money', 'transactional', '티어드 프라이싱', 'Tiered Pricing'),
  ('enterprise-contract', 'money', 'enterprise', '엔터프라이즈 계약', 'Enterprise Contract');
