---
title: Keyword Taxonomy
tags:
  - world-building
---

# Keyword Taxonomy

> 6개 키워드 카테고리가 하나의 광맥을 구성한다. 이것이 IDEA MINE의 핵심 도메인 모델.
> **AI 카테고리는 유료 전용** — 무료 유저는 5개, 유료 유저는 6개로 조합한다.

---

## 6원석 체계

| 카테고리 | 질문 | 예시 | 접근 |
|----------|------|------|------|
| **AI** | 어떤 AI 기술인가? | LLM 에이전트, 컴퓨터 비전, 음성 AI, 멀티모달 AI, 생성형 AI | **유료 전용** |
| **Who** | 누구를 위한가? | 1인 가구, 시니어, 프리랜서, Z세대 | 무료 |
| **Domain** | 어떤 산업인가? | 헬스케어, 교육, 금융, 커머스 | 무료 |
| **Tech** | 어떤 기술/플랫폼인가? | 앱, 웹, IoT, 웨어러블, 챗봇, API | 무료 |
| **Value** | 어떤 가치를 주는가? | 자동화, 감정 케어, 비용 절감, 접근성 향상 | 무료 |
| **Money** | 어떻게 돈을 버는가? | 구독형 SaaS, Freemium, 광고, B2B SaaS | 무료 |

---

## 사용자 노출 라벨

> 내부 스키마는 `AI / Who / Domain / Tech / Value / Money`를 유지하지만, 사용자에게는 더 자연스러운 라벨로 보여준다.

| 내부 스키마 | 사용자 노출 (KO) | 사용자 노출 (EN) |
|------------|------------------|------------------|
| AI | AI | AI |
| Who | 대상 | Target |
| Domain | 산업 | Industry |
| Tech | 형태 | Platform |
| Value | 가치 | Value |
| Money | 수익모델 | Business Model |

자세한 기준은 [[Naming-Convention]]을 따른다.

---

## AI와 Tech의 차이

| AI (유료) | Tech (무료) |
|-----------|------------|
| 핵심 AI 기술 종류 | AI를 구현하는 플랫폼/형태 |
| LLM 에이전트, 컴퓨터 비전, 음성 AI, 멀티모달 AI | 모바일 앱, 웹 서비스, IoT/센서, 웨어러블, 챗봇 |
| "무엇을 할 수 있는가" | "어디서 동작하는가" |

---

## 조합 방식

### 광맥과 원석의 관계

**광맥** = 5~6개 키워드 세트 (유저에게 보여지는 조합 카드)
**원석** = 광맥의 키워드 중 **3~5개만 선택**해서 AI가 생성한 아이디어

핵심: 원석마다 같은 광맥에서도 다른 키워드를 사용하기 때문에 10개가 자연스럽게 달라진다.

```
광맥 (6개 키워드 세트)
├─ 원석 1: 키워드 A,B,C,D,E 사용 (5개) → 안정형
├─ 원석 2: 키워드 A,C,D,E 사용 (4개)   → 안정형
├─ 원석 3: 키워드 B,C,E,F 사용 (4개)   → 안정형
├─ 원석 4: 키워드 A,B,D 사용 (3개)     → 확장형
├─ ...
└─ 원석 10: 키워드 B,D,F 사용 (3개)    → 희귀형
```

### 4군별 키워드 사용 수 규칙

| 군 | 수량 | 사용 키워드 수 | 느낌 |
|----|------|--------------|------|
| 안정형 | 3개 | 4~5개 (대부분 사용) | 광맥의 의도에 가장 충실 |
| 확장형 | 3개 | 3~4개 (일부 강조/생략) | 같은 광맥인데 다른 해석 |
| 전환형 | 2개 | 3~4개 (다른 조합 선택) | 방향 전환 |
| 희귀형 | 2개 | 3개 (최소 선택) | 핵심만 뽑아서 색다르게 |

이 구조의 장점:
- 키워드 선택 조합 자체가 다양성을 만들어서 4군 구조와 자연스럽게 맞음
- 3개만 쓰면 "색다르지만 이해 가능한" 범위에 머뭄
- "전체 6개를 억지로 다 엮어서 황당해지는" 문제가 안 생김
- 희귀형 가드레일이 키워드 수 제한으로 자동 해결

### AI 키워드 고정 로직 (Lite/Pro)

유료 유저가 돈 내고 해금한 AI 키워드가 "이번엔 안 쓰였어요"라고 나오면 안 됨.

| 티어 | 광맥 키워드 풀 | 원석 생성 시 |
|------|-------------|------------|
| Free | 5개 (AI 없음) | 5개 중 3~5개 자유 선택 |
| Lite/Pro | 6개 (AI 포함) | **AI 키워드 고정 포함** + 나머지 5개 중 2~4개 선택 |

즉, Lite/Pro에서는 AI 키워드가 **절대 빠지지 않음**. 원석 10개 모두 AI 키워드를 포함.

### 사용된 키워드 표시

각 아이디어 카드에 사용된 키워드를 태그로 표시:

```
[아이디어 카드]
"AI 감정 일기 앱"
사용된 키워드: 음성 AI · 1인가구 · 멘탈헬스
3줄 요약...
```

- 사용자가 "왜 이 아이디어가 나왔는지" 이해함
- "내가 넣은 6개 중 3개가 쓰였구나" 자연스럽게 인지
- 별도 설명 없이도 구조가 보임

광맥 선택 화면이나 온보딩에서 한 줄 안내:
> "각 아이디어는 광맥의 키워드 중 3~5개를 조합해 만들어집니다."

### 풀 조합 모드 (Pro 전용)

- Pro 유저만 6개 키워드 전부를 사용한 아이디어 생성 가능
- 토글 방식으로 켜고 끔
- 모든 키워드가 엮이므로 가장 구체적이지만 제약이 강한 결과

---

### 무료 유저 — 5원석 광맥

```
Who: 1인 가구
Domain: 헬스케어
Tech: 모바일 앱
Value: 감정 케어
Money: 구독형 SaaS
```
→ 아이디어는 나오지만 AI 기술이 특정되지 않아 범용적

### 유료 유저 — 6원석 광맥

```
AI: 음성 AI
Who: 1인 가구
Domain: 헬스케어
Tech: 모바일 앱
Value: 감정 케어
Money: 구독형 SaaS
```
→ AI 기술이 특정되어 아이디어가 훨씬 구체적이고 실행 가능

---

## 시즌 키워드 시스템

광맥 희귀도를 결정하는 핵심 시스템. 상세 확률표는 [[The-Mine]] 참조.

### 광맥 등급

| 등급 | 이름 | 색상 | 조건 |
|------|------|------|------|
| Common | 일반 광맥 | 회청 | 기본 키워드 풀만으로 구성. 상시 등장 |
| Golden | 금빛 광맥 | 골드+goldGlow | 트렌드 키워드 1개 이상 포함 |
| Legend | 전설 광맥 | 보라/핑크+purpleGlow | 시즌 한정 키워드 포함 |

### 금빛 키워드 (트렌드)

- 업계에서 핫한 넓은 트렌드를 반영하는 키워드 3~5개
- **분기 내내 유지** (약 3개월)
- 모든 카테고리에 걸쳐 추가 가능

예시 (2026 Q2):

| 카테고리 | 금빛 키워드 | 트렌드 근거 |
|----------|-----------|-----------|
| AI | MCP (Model Context Protocol) | 2026 상반기 핫 기술 |
| Domain | 에이전트 마켓플레이스 | 새로운 산업 형성 |
| Tech | 에이전트 플랫폼 | 새로운 제품 형태 |

### 전설 키워드 (시즌 한정)

- 분기에 한 번 열리는 시즌 이벤트의 **테마에 맞춘 구체적 키워드 세트**
- **시즌 이벤트 기간만 유지** (약 1개월)
- 카테고리별 1개씩 5~6개로 구성, 조합하면 시즌 테마에 딱 맞는 아이디어가 나옴
- 시즌 종료 시 완전 제거

예시 (2026 Q2 시즌: "에이전트의 시대"):

| 카테고리 | 전설 키워드 | 시즌 테마와의 관계 |
|----------|-----------|----------------|
| AI | Tool Use AI | 에이전트가 도구를 쓰는 구조 |
| Who | AI 에이전트 빌더 | 에이전트를 만드는 사람 |
| Domain | 워크플로우 자동화 | 에이전트의 핵심 적용 분야 |
| Value | 자율 실행 | 에이전트만의 고유 가치 |
| Money | 사용량 기반 과금 | 에이전트 서비스의 자연스러운 BM |

### 금빛 vs 전설 핵심 차이

| | 금빛 | 전설 |
|--|------|------|
| 키워드 성격 | 넓은 트렌드 (업계 핫 키워드) | 시즌 테마에 맞춘 구체적 세트 |
| 지속 기간 | 분기 내내 (~3개월) | 시즌 이벤트 기간만 (~1개월) |
| 키워드 수 | 3~5개 | 5~6개 (카테고리별 1개씩) |
| 조합 느낌 | "요즘 핫한 키워드가 하나 섞였네" | "시즌 테마로 완전한 조합이 나왔다" |
| 희소성 | 중간 | 높음 (놓치면 다음 시즌까지 없음) |

### 운영 규칙

- 금빛/전설 키워드도 subtype을 부여하여 기존 내부 스키마와 일관성 유지
- 시즌 종료 시 해당 키워드로 생성된 아이디어는 금고에 유지됨 (키워드만 제거)
- 분기마다 금빛 키워드 교체 + 시즌 이벤트 1회 운영이 기본 리듬

---

## 업셀 포인트

- 무료 유저에게 AI 슬롯을 **잠금 상태**로 보여줌
- AI 키워드가 빠진 아이디어 vs 들어간 아이디어의 퀄리티 차이가 자연스러운 업셀 동기
- "AI 원석을 해금하면 더 정밀한 아이디어를 캘 수 있어요" 같은 연출

---

## 키워드 인벤토리

> 모든 키워드는 한/영 병기로 DB에 저장. `en`은 AI 프롬프트 입력값으로 직접 사용.

### AI (유료 전용) — 18개

| KO | EN |
|-----|------|
| LLM 에이전트 | LLM Agent |
| RAG (검색 증강 생성) | RAG (Retrieval-Augmented Generation) |
| 멀티모달 AI | Multimodal AI |
| 이미지 생성 AI | Image Generation AI |
| 음성 AI (TTS/STT) | Voice AI (TTS/STT) |
| 온디바이스 AI | On-device AI |
| 추천 엔진 | Recommendation Engine |
| 벡터 검색 | Vector Search |
| 지식 그래프 | Knowledge Graph |
| AI 에이전트 워크플로우 | AI Agent Workflow |
| 문서 이해 AI | Document Understanding AI |
| 엣지 AI | Edge AI |
| 컴퓨터 비전 | Computer Vision |
| 실시간 번역 AI | Real-time Translation AI |
| AI 코파일럿 | AI Copilot |
| 감정 인식 AI | Emotion AI |
| 예측 AI | Predictive AI |
| 파인튜닝/커스텀 모델 | Fine-tuning / Custom Model |

### Who (타겟층) — 21개

| KO | EN |
|-----|------|
| 1인 가구 | Single-person Household |
| Z세대 | Gen Z |
| 알파세대 | Gen Alpha |
| 시니어 | Senior |
| N잡러 | Multi-jobber |
| 딩크족 | DINK (Dual Income, No Kids) |
| AI PM/기획자 | AI PM / Product Planner |
| 반려동물 가구 | Pet Owner Household |
| 디지털 노마드 | Digital Nomad |
| 소상공인 (SME) | Small Business Owner |
| 취준생 | Job Seeker |
| 외국인 거주자 | Foreign Resident |
| 1인 크리에이터 | Solo Creator |
| 창업 준비자 | Aspiring Founder |
| 프리랜서 | Freelancer |
| 나홀로 여행객 | Solo Traveler |
| 디지털 네이티브 시니어 | Digital-native Senior |
| 1인 사업자 (솔로프리너) | Solopreneur |
| 신혼부부 | Newlyweds |
| 육아 부모 | Parents with Young Kids |
| 은퇴 준비자 | Pre-retiree |

### Domain (산업) — 23개

| KO | EN |
|-----|------|
| 핀테크 | Fintech |
| 헬스케어 | Healthcare |
| 에듀테크 | Edtech |
| 커머스 | Commerce |
| 로지스틱스 | Logistics |
| 스마트홈 | Smart Home |
| 마테크 | MarTech |
| 프롭테크 | Proptech |
| K-컬처 | K-Culture |
| 뷰티테크 | Beautytech |
| 멘탈헬스 | Mental Health |
| 트래블테크 | Traveltech |
| 리걸테크 | Legaltech |
| HR테크 | HR-tech |
| F&B (외식업) | Food & Beverage |
| 엔터테인먼트 | Entertainment |
| 슬립테크 | Sleeptech |
| 펫케어 | Pet Care |
| 기후테크 | Climatetech |
| 크리에이터 이코노미 | Creator Economy |
| 세일즈테크 | Salestech |
| 디자인테크 | Designtech |
| 데브옵스/인프라 | DevOps/Infra |

### Tech (플랫폼/형태) — 18개

| KO | EN |
|-----|------|
| 모바일 앱 | Mobile App |
| 웹 서비스 | Web Service |
| 챗봇 | Chatbot |
| API 서비스 | API Service |
| 브라우저 확장 | Browser Extension |
| 슬랙/디스코드 봇 | Slack/Discord Bot |
| 음성 인터페이스 | Voice Interface |
| 웨어러블 | Wearable |
| IoT/센서 | IoT/Sensor |
| 마켓플레이스 | Marketplace |
| AR/VR | AR/VR |
| 대시보드 | Dashboard |
| 자동화 워크플로우 | Automation Workflow |
| 데이터 시각화 | Data Visualization |
| 데스크톱 앱 | Desktop App |
| 커뮤니티 플랫폼 | Community Platform |
| 플러그인/위젯 | Plugin/Widget |
| 이메일/뉴스레터 툴 | Email/Newsletter Tool |

### Value (가치) — 22개

| KO | EN |
|-----|------|
| 시간 단축 | Time Saving |
| 외로움 해소 | Loneliness Relief |
| 생산성 극대화 | Productivity Boost |
| 운영 효율 | Operational Efficiency |
| 비용 절감 | Cost Reduction |
| 감정 케어 | Emotional Care |
| 정확도/신뢰도 향상 | Accuracy & Trust Improvement |
| 재미 (게이미피케이션) | Fun (Gamification) |
| 안전/보안 | Safety/Security |
| 자동화 | Automation |
| 소속감 | Sense of Belonging |
| 스킬 향상 | Skill Development |
| 데이터 프라이버시 | Data Privacy |
| 창의적 영감 | Creative Inspiration |
| 건강 트래킹 | Health Tracking |
| 노력의 시각화 | Effort Visualization |
| 심리적 안전감 | Psychological Safety |
| 디지털 디톡스 | Digital Detox |
| 접근성 향상 | Accessibility Improvement |
| 습관 형성 | Habit Formation |
| 커리어 성장 | Career Growth |
| 자아실현 | Self-actualization |

### Money (수익) — 16개

| KO | EN |
|-----|------|
| 구독형 (SaaS) | Subscription (SaaS) |
| 프리미엄 (Freemium) | Freemium |
| 중개 수수료 | Marketplace Commission |
| 데이터 판매 | Data Monetization |
| 광고 기반 | Ad-supported |
| API 과금 | API Pricing |
| B2B SaaS | B2B SaaS |
| 화이트 라벨링 | White Labeling |
| 건당 결제 (Pay-per-use) | Pay-per-use |
| 라이선싱 | Licensing |
| 리퍼럴 (제휴) | Referral/Affiliate |
| 하드웨어 결합형 | Hardware Bundle |
| 멤버십/커뮤니티 | Membership/Community |
| 성공 보수형 | Success Fee |
| 티어드 프라이싱 | Tiered Pricing |
| 엔터프라이즈 계약 | Enterprise Contract |

---

## 내부 subtype 운영

> subtype은 **내부 메타데이터 전용**이다. 사용자에게는 여전히 6개 카테고리와 키워드 라벨만 보여준다.

### 왜 필요한가

- 카테고리를 늘리지 않고도 추천/보정 품질을 높이기 위해
- 커스텀 키워드 입력 시 같은 카테고리 안에서 더 정확한 보정 후보를 찾기 위해
- seed 밸런스를 점검할 때 특정 결이 과하게 몰리는지 보기 위해
- 향후 검색, 개인화, 비슷한 광맥 추천의 내부 신호로 쓰기 위해

### 사용자 노출 원칙

- UI에는 `category`만 노출, `subtype`은 비노출
- 사용자는 한국어에서 `AI / 대상 / 산업 / 형태 / 가치 / 수익모델`, 영어에서 `AI / Target / Industry / Platform / Value / Business Model`을 본다
- 직접 입력 시에도 subtype 용어는 보여주지 않는다
- subtype 불일치는 자동 이동 근거가 아니라 **보정 보조 신호**로만 쓴다

### 카테고리별 subtype

| 카테고리 | 내부 subtype | 의미 |
|----------|--------------|------|
| AI | `agent`, `retrieval`, `generation`, `modality`, `prediction`, `optimization` | AI 기술의 핵심 작동 방식 |
| Who | `demographic`, `life-stage`, `role`, `household`, `lifestyle` | 사용자 집단을 나누는 기준 |
| Domain | `industry`, `function`, `ecosystem` | 산업/업무영역/문화생태계 구분 |
| Tech | `platform`, `interface`, `product-form`, `delivery` | 구현 채널과 제품 형태 |
| Value | `efficiency`, `emotional`, `trust`, `growth`, `engagement`, `wellbeing` | 사용자가 체감하는 가치의 결 |
| Money | `recurring`, `transactional`, `distribution`, `enterprise` | 수익화 구조의 유형 |

### 전체 키워드-subtype 매핑

#### AI — 18개

| KO | EN | subtype |
|----|-----|---------|
| LLM 에이전트 | LLM Agent | `agent` |
| AI 코파일럿 | AI Copilot | `agent` |
| RAG (검색 증강 생성) | RAG (Retrieval-Augmented Generation) | `retrieval` |
| 벡터 검색 | Vector Search | `retrieval` |
| 지식 그래프 | Knowledge Graph | `retrieval` |
| 문서 이해 AI | Document Understanding AI | `retrieval` |
| 이미지 생성 AI | Image Generation AI | `generation` |
| AI 에이전트 워크플로우 | AI Agent Workflow | `agent` |
| 멀티모달 AI | Multimodal AI | `modality` |
| 음성 AI (TTS/STT) | Voice AI (TTS/STT) | `modality` |
| 컴퓨터 비전 | Computer Vision | `modality` |
| 실시간 번역 AI | Real-time Translation AI | `modality` |

| 추천 엔진 | Recommendation Engine | `prediction` |
| 감정 인식 AI | Emotion AI | `prediction` |
| 예측 AI | Predictive AI | `prediction` |
| 온디바이스 AI | On-device AI | `optimization` |
| 엣지 AI | Edge AI | `optimization` |
| 파인튜닝/커스텀 모델 | Fine-tuning / Custom Model | `optimization` |

**분포:** agent 3 / retrieval 4 / generation 1 / modality 4 / prediction 3 / optimization 3

#### Who — 18개

| KO | EN | subtype |
|----|-----|---------|
| Z세대 | Gen Z | `demographic` |
| 알파세대 | Gen Alpha | `demographic` |
| 시니어 | Senior | `demographic` |
| 외국인 거주자 | Foreign Resident | `demographic` |
| 디지털 네이티브 시니어 | Digital-native Senior | `demographic` |
| 취준생 | Job Seeker | `life-stage` |
| 창업 준비자 | Aspiring Founder | `life-stage` |
| AI PM/기획자 | AI PM / Product Planner | `role` |
| 소상공인 (SME) | Small Business Owner | `role` |
| 1인 사업자 (솔로프리너) | Solopreneur | `role` |
| 1인 가구 | Single-person Household | `household` |
| 딩크족 | DINK (Dual Income, No Kids) | `household` |
| 반려동물 가구 | Pet Owner Household | `household` |
| 디지털 노마드 | Digital Nomad | `lifestyle` |
| N잡러 | Multi-jobber | `lifestyle` |
| 프리랜서 | Freelancer | `lifestyle` |
| 1인 크리에이터 | Solo Creator | `lifestyle` |
| 나홀로 여행객 | Solo Traveler | `lifestyle` |
| 신혼부부 | Newlyweds | `life-stage` |
| 육아 부모 | Parents with Young Kids | `life-stage` |
| 은퇴 준비자 | Pre-retiree | `life-stage` |

**분포:** demographic 5 / life-stage **5** / role 3 / household 3 / lifestyle 5

#### Domain — 23개

| KO | EN | subtype |
|----|-----|---------|
| 핀테크 | Fintech | `industry` |
| 헬스케어 | Healthcare | `industry` |
| 에듀테크 | Edtech | `industry` |
| 커머스 | Commerce | `industry` |
| 로지스틱스 | Logistics | `industry` |
| 뷰티테크 | Beautytech | `industry` |
| 멘탈헬스 | Mental Health | `industry` |
| 트래블테크 | Traveltech | `industry` |
| 리걸테크 | Legaltech | `industry` |
| F&B (외식업) | Food & Beverage | `industry` |
| 엔터테인먼트 | Entertainment | `industry` |
| 슬립테크 | Sleeptech | `industry` |
| 펫케어 | Pet Care | `industry` |
| 기후테크 | Climatetech | `industry` |
| HR테크 | HR-tech | `function` |
| 마테크 | MarTech | `function` |
| 스마트홈 | Smart Home | `ecosystem` |
| 프롭테크 | Proptech | `ecosystem` |
| K-컬처 | K-Culture | `ecosystem` |
| 크리에이터 이코노미 | Creator Economy | `ecosystem` |
| 세일즈테크 | Salestech | `function` |
| 디자인테크 | Designtech | `function` |
| 데브옵스/인프라 | DevOps/Infra | `function` |

**분포:** industry 14 / function **5** / ecosystem 4

#### Tech — 18개

| KO | EN | subtype |
|----|-----|---------|
| 모바일 앱 | Mobile App | `platform` |
| 웹 서비스 | Web Service | `platform` |
| 대시보드 | Dashboard | `platform` |
| 데스크톱 앱 | Desktop App | `platform` |
| 챗봇 | Chatbot | `interface` |
| 음성 인터페이스 | Voice Interface | `interface` |
| AR/VR | AR/VR | `interface` |
| API 서비스 | API Service | `product-form` |
| 마켓플레이스 | Marketplace | `product-form` |
| 커뮤니티 플랫폼 | Community Platform | `product-form` |
| 자동화 워크플로우 | Automation Workflow | `product-form` |
| 데이터 시각화 | Data Visualization | `product-form` |
| 이메일/뉴스레터 툴 | Email/Newsletter Tool | `product-form` |
| 브라우저 확장 | Browser Extension | `delivery` |
| 슬랙/디스코드 봇 | Slack/Discord Bot | `delivery` |
| 웨어러블 | Wearable | `delivery` |
| IoT/센서 | IoT/Sensor | `delivery` |
| 플러그인/위젯 | Plugin/Widget | `delivery` |

**분포:** platform 4 / interface 3 / product-form 6 / delivery 5

#### Value — 19개

| KO | EN | subtype |
|----|-----|---------|
| 시간 단축 | Time Saving | `efficiency` |
| 생산성 극대화 | Productivity Boost | `efficiency` |
| 운영 효율 | Operational Efficiency | `efficiency` |
| 비용 절감 | Cost Reduction | `efficiency` |
| 자동화 | Automation | `efficiency` |
| 외로움 해소 | Loneliness Relief | `emotional` |
| 감정 케어 | Emotional Care | `emotional` |
| 소속감 | Sense of Belonging | `emotional` |
| 심리적 안전감 | Psychological Safety | `emotional` |
| 정확도/신뢰도 향상 | Accuracy & Trust Improvement | `trust` |
| 안전/보안 | Safety/Security | `trust` |
| 데이터 프라이버시 | Data Privacy | `trust` |
| 스킬 향상 | Skill Development | `growth` |
| 창의적 영감 | Creative Inspiration | `growth` |
| 재미 (게이미피케이션) | Fun (Gamification) | `engagement` |
| 노력의 시각화 | Effort Visualization | `engagement` |
| 건강 트래킹 | Health Tracking | `wellbeing` |
| 디지털 디톡스 | Digital Detox | `wellbeing` |
| 접근성 향상 | Accessibility Improvement | `wellbeing` |
| 습관 형성 | Habit Formation | `engagement` |
| 커리어 성장 | Career Growth | `growth` |
| 자아실현 | Self-actualization | `growth` |

**분포:** efficiency 5 / emotional 4 / trust 3 / growth **4** / engagement **3** / wellbeing 3

#### Money — 16개

| KO | EN | subtype |
|----|-----|---------|
| 구독형 (SaaS) | Subscription (SaaS) | `recurring` |
| 프리미엄 (Freemium) | Freemium | `recurring` |
| 멤버십/커뮤니티 | Membership/Community | `recurring` |
| 건당 결제 (Pay-per-use) | Pay-per-use | `transactional` |
| 광고 기반 | Ad-supported | `transactional` |
| API 과금 | API Pricing | `transactional` |
| 성공 보수형 | Success Fee | `transactional` |
| 티어드 프라이싱 | Tiered Pricing | `transactional` |
| 중개 수수료 | Marketplace Commission | `distribution` |
| 데이터 판매 | Data Monetization | `distribution` |
| 리퍼럴 (제휴) | Referral/Affiliate | `distribution` |
| 화이트 라벨링 | White Labeling | `distribution` |
| 라이선싱 | Licensing | `distribution` |
| B2B SaaS | B2B SaaS | `enterprise` |
| 하드웨어 결합형 | Hardware Bundle | `enterprise` |
| 엔터프라이즈 계약 | Enterprise Contract | `enterprise` |

**분포:** recurring 3 / transactional 5 / distribution 5 / enterprise 3

### subtype 분포 분석 + 보완 제안

#### 분포 요약 (보완 완료)

| 카테고리 | 총 | subtype별 분포 | 밸런스 |
|----------|-----|----------------|--------|
| AI (18) | 6종 | agent 2 / retrieval 4 / generation 2 / modality 4 / prediction 3 / optimization 3 | 양호 |
| Who (21) | 5종 | demographic 5 / life-stage 5 / role 3 / household 3 / lifestyle 5 | 양호 |
| Domain (23) | 3종 | industry 14 / function 5 / ecosystem 4 | 양호 |
| Tech (18) | 4종 | platform 4 / interface 3 / product-form 6 / delivery 5 | 양호 |
| Value (22) | 6종 | efficiency 5 / emotional 4 / trust 3 / growth 4 / engagement 3 / wellbeing 3 | 양호 |
| Money (16) | 4종 | recurring 3 / transactional 5 / distribution 5 / enterprise 3 | 양호 |

**총 키워드: 118개** (보완 전 109개 → +9개)

#### 향후 키워드 업데이트 기준

1. 카테고리당 25개를 크게 넘지 않도록 관리
2. subtype당 최소 2개 유지
3. 테스터 피드백에서 "이런 키워드가 없어요" 나오면 우선 추가
4. 트렌드 변화 시 비활성(is_active=false) 처리 후 신규 추가

---

### 내부 데이터 권장 필드

- `category`: 사용자 노출 6카테고리
- `subtype`: 내부 전용 세부 분류
- `slug`: 시스템 고유 키
- `ko`, `en`: 표시명 / 프롬프트 입력값
- `aliases`: 커스텀 입력 보정용 동의어
- `weight`: 추천/샘플링 기본 가중치
- `is_premium`: AI 카테고리 여부
- `is_seed`: 공식 seed 여부
- `is_active`: 운영 중 여부

### 운영 규칙

1. subtype 추가는 자유지만 **새 사용자 카테고리 추가 이유로 쓰지 않는다**
2. 하나의 키워드는 1개의 대표 subtype만 가진다
3. 애매한 경우는 사용자 의미가 더 강한 쪽이 아니라 **추천/보정에 더 유용한 쪽**으로 분류한다
4. subtype은 추천 품질 개선용이며, 사용자에게 학습 부담을 주면 안 된다

---

## 키워드 운영 원칙

- 카테고리당 15~20개 키워드로 시작 (현재 충족)
- 키워드는 트렌드에 따라 주기적으로 업데이트
- 사용자에게는 표/매트릭스가 아니라 **칩/원석/슬롯 UI**로 보여준다
- 모든 키워드는 한/영 병기로 DB에 저장 (AI 프롬프트 입력값으로 직접 사용)
- subtype은 내부 메타데이터로만 관리하고 UI에는 노출하지 않는다

### 커스텀 키워드 입력

- Lite부터 카테고리 슬롯 내에서 키워드 직접 입력 가능
- Lite: 비AI 5카테고리에서 10개까지 저장
- Pro: 전체 6카테고리(AI 포함)에서 무제한
- AI 보정 시스템으로 품질 관리 (임베딩 유사도 우선, GPT-4o-mini 폴백)
- 상세 티어별 차이는 `Tier-Structure` 참조

---

## 아이디어 생성 구조: 10개 4군

하나의 광맥에서 아이디어 원석 **10개**를 생성하되, 내부적으로 4개 군으로 나눠 다양성을 구조적으로 강제한다. 군 라벨은 사용자에게 노출하지 않는다.

### 키워드 사용 규칙

**기본 모드 (Free/Lite/Pro 공통):**
- 광맥의 5~6개 키워드 중 **3~5개를 선택**해서 각 아이디어 생성
- 어떤 키워드를 쓰고 빼느냐에 따라 10개가 자연스럽게 달라짐
- Lite/Pro 유저의 **AI 키워드는 고정 포함** (유료 해금한 키워드가 빠지면 안 됨)
  - Free: 5개 중 3~5개 자유 선택
  - Lite/Pro: AI 키워드 고정 + 나머지 5개 중 2~4개 선택

**풀 조합 모드 (Pro 전용 옵션):**
- 사용자가 "모든 키워드 사용" 토글을 켜면, 10개 모두 6개 키워드를 전부 반영
- 더 구체적이고 정밀한 대신, 발상 폭은 좁아짐
- 기본 모드에서 마음에 드는 방향을 찾고 -> 풀 조합으로 정밀하게 파는 2단계 채굴 흐름

**사용자에게 보여주는 방식:**
- 각 아이디어 카드에 **사용된 키워드를 태그로 표시** (어떤 조합으로 나왔는지 투명하게)
- 광맥 선택 또는 온보딩에서 안내: "각 아이디어는 광맥의 키워드 중 3~5개를 조합해 만들어집니다"

### 4군 구조

| 군 | 수량 | 키워드 사용 수 | 성격 | 배치 순서 |
|----|------|-------------|------|----------|
| 안정형 | 3개 | 4~5개 (대부분 사용) | 광맥의 의도에 가장 충실, 바로 이해 가능 | 앞쪽 (1~3번) |
| 확장형 | 3개 | 3~4개 (일부 강조/생략) | 같은 광맥인데 다른 해석 | 중간 (4~6번) |
| 전환형 | 2개 | 3~4개 (다른 조합 선택) | 서비스 형태/BM/맥락 자체를 전환 | 후반 (7~8번) |
| 희귀형 | 2개 | 3개 (최소 선택) | 핵심만 뽑아서 색다르게. 기억에 남는 방향 | 마지막 (9~10번) |

### 각 군의 역할

**안정형 (3개, 키워드 4~5개):** "아 이런 서비스가 되겠구나"를 빠르게 이해시킴. 키워드 대부분을 사용해서 광맥의 의도에 충실.

**확장형 (3개, 키워드 3~4개):** 같은 광맥인데 "이런 식으로도 풀리네"를 만듦. 일부 키워드를 생략하거나 강하게 밀어서 발상 폭을 넓힘.

**전환형 (2개, 키워드 3~4개):** 서비스 형태나 BM, 사용 맥락을 바꿈. 안정형과 다른 키워드 조합을 선택해서 "이건 생각 못 했는데?"를 만드는 역할.

**희귀형 (2개, 키워드 3개):** 최소 키워드만 뽑아서 실험적이지만 기억에 남는 방향. 3개만 쓰기 때문에 자연히 황당해지지 않고 "색다르지만 이해 가능한" 범위에 머묾. 희귀도 시스템 연결은 Phase 2에서 설계.

### 운영 규칙 (프롬프트에 삽입)

1. 같은 문제 정의가 3개 이상 반복 금지
2. 같은 제품 형태가 과반(5개) 넘지 않기
3. 최소 2개는 의외성 있는 방향
4. 최소 2개는 실행 가능성 높은 방향
5. 10개 중 최소 4개는 확실히 결이 다르게 느껴질 것
6. 모든 아이디어는 실제 사용자가 존재할 수 있는 범위일 것
7. 풀 조합 모드에서는 6개 키워드를 단순 나열하지 말고 하나의 coherent한 서비스 개념으로 통합할 것

### 당연한 조합 회피 규칙

세렌디피티 엔진(= 핵심 차별점)이 무력화되지 않도록, 광맥 생성 및 아이디어 생성 시 "너무 뻔한 조합"을 회피:

1. Who와 Domain이 의미적으로 겹치면 광맥에서 재생성 (반려동물 가구 + 펫케어 = 겹침)
2. Value와 Domain이 직접 연결되면 1개까지만 허용 (멘탈헬스 + 감정 케어 = 직접 연결)
3. subtype이 같은 키워드가 3개 이상 겹치지 않도록

### 사용자 경험

- 군 라벨 노출 안 함 (내부 프롬프트 전용)
- 순서만 안정 -> 희귀 흐름으로 자연스럽게 배치
- 스크롤할수록 "점점 색다르네" 느낌
- 각 카드에 사용된 키워드 태그 표시 -> "왜 이 아이디어가 나왔는지" 자연스럽게 이해

---

## 아이디어 생성 파이프라인 (v2)

> v1에서는 LLM이 키워드 선택과 아이디어 생성을 동시에 했으나, slug 매칭 실패 + 다양성 부족 문제로 v2에서 분리.
> 상세: `plans/2026-03-23-idea-generation-pipeline-v2`

### 파이프라인 흐름

```
광맥 5개 키워드 (DB)
    ↓
Python: combo_builder (키워드 조합 10세트 생성)
    ├ 안정형 3세트: 4~5개 랜덤
    ├ 확장형 3세트: 3~4개 랜덤
    ├ 전환형 2세트: 3~4개 랜덤
    └ 희귀형 2세트: 정확히 3개
    ↓
Python: prompt_builder (영어 프롬프트에 조합 삽입)
    ↓
OpenAI API 1회 호출 (JSON mode)
    → 아이디어 10개, 각각 한/영 동시 생성
    ↓
DB 저장: title_ko/en, summary_ko/en, keyword_combo
    → keyword_combo = Python이 뽑은 조합 그대로 (LLM 추측 아님)
    → 유저가 언어 전환 시 재생성 비용 0
```

### 핵심 원칙

- **키워드 선택 = Python** (확정적, slug 매칭 실패 불가)
- **아이디어 생성 = LLM** (창의적 작업에 집중)
- **프롬프트 = 영어** (LLM 성능 최적화)
- **출력 = 한/영 동시** (1회 호출로 양쪽 커버)
- **AI 키워드 고정:** Lite/Pro 유저의 AI 키워드는 모든 조합에 고정 포함

---

## 아이디어 객체 구조

하나의 아이디어(원석)는 아래 정보를 가진다:

- 아이디어 제목 (한/영: `title_ko`, `title_en`)
- 아이디어 요약 (한/영: `summary_ko`, `summary_en`)
- 광맥 키워드 전체 (5~6개)
- **실제 사용된 키워드** (3~5개, 사용자에게 태그로 표시)
- 내부 군 분류 (안정/확장/전환/희귀 — 사용자 비노출)
- 생성 모드 (기본/풀 조합)
- 생성 시각
- 생성 방식 (랜덤/커스텀)
- 저장 여부
- 공개 여부
- 상세 개요서 여부

---

## 상세 개요서 객체 구조

- 문제 정의
- 타겟 유저
- 핵심 기능
- 차별점
- 시장 배경
- BM 구조
- 경쟁/대체재
- 초기 MVP 범위
- 리스크 및 가설

---

## Related

- [[Worldview-&-Metaphor]] — 세계관 메타포 전체 체계
- [[Naming-Convention]] — 제품 용어 네이밍 원칙

## See Also

- [[The-Mine]] — 키워드 조합이 실제로 동작하는 공간 (03-Spaces)
