# IDEA MINE v2 Gate-Based Roadmap

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement individual Sprint plans.

**Goal:** 웹 우선 프리미엄 탐사 플랫폼의 핵심 루프를 검증하고, Gate를 통과할 때마다 다음 단계로 진행한다.

**Architecture:** 백엔드(FastAPI + Supabase)와 DB(v2 마이그레이션 체인)는 이미 완성. 이 로드맵은 Next.js 웹 프론트엔드 구축과 제품 검증에 집중한다. 각 Phase는 Gate로 마무리되며, Gate를 통과하지 못하면 다음으로 넘어가지 않고 현재를 개선한다.

**Tech Stack:** Next.js + React + TypeScript + Framer Motion + Tailwind CSS + Supabase Auth

---

## 핵심 원칙

### Gate-Based Development

```
[Phase N] → Gate 판단 → 통과? → [Phase N+1]
                          |
                          +→ 실패? → 현재 개선 후 재도전
```

- Gate를 통과하지 못하면 다음 Phase가 아니라 **현재를 개선**
- Phase를 일직선으로 달리지 않는다
- 각 Gate에는 **수치 기준**이 있다

### 이 로드맵이 다루지 않는 것

- 모바일 앱 (웹 검증 후 별도 판단)
- Observatory, Showcase, Exchange (핵심 루프 검증 후)
- 게임 경제, 배지, 퀘스트 (핵심 루프 검증 후)
- 픽셀 아트 에셋 (v2에서는 프리미엄 스페이스 UI)

### 이미 완성된 자산

| 영역 | 상태 | 비고 |
|------|------|------|
| 백엔드 API | 완성 | 5 라우터, 8 서비스, LLM 파이프라인 |
| DB 스키마 | 완성 | v2 마이그레이션 10개, RLS, 인덱스 |
| LLM 프롬프트 | 완성 | mining v3, concept v1.1, overview v4.2, appraisal v2 |
| Rate Limiter | 완성 | L1 인메모리 + L2 DB 2계층 |
| AI 비용 추적 | 완성 | ai_usage_logs 13필드 |
| Supabase Auth | 완성 | JWT 검증, 프로필 자동 생성 |
| 키워드 시드 | 완성 | 6카테고리 118개 |

→ v2 로드맵의 모든 Sprint는 **프론트엔드 구축**이 주 작업이다.

---

## Phase 0 — 웹 기반 (Sprint 0)

### 목표

Next.js 프로젝트 위에 제품의 뼈대를 세운다. 이 Sprint가 끝나면 로그인하고, 빈 공간이라도 Mine/Vault/Lab 사이를 오갈 수 있어야 한다.

### Sprint 0: 디자인 시스템 + Auth + 레이아웃

**디자인 시스템 기초:**

- [ ] 기본 컴포넌트: Button (Primary/Default/Secondary/Tertiary), Card, Panel
- [ ] 타이포그래피: Display (브랜드) / Body (가독성) 분리
- [ ] CTA 계층: Signal Accent 패턴 (`docs/Premium-Space-UI-Style-Guide.md` Section 12)
- [ ] 아이콘 시스템 방향 결정 (Lucide 등 라이브러리 선택)

**Supabase Auth (웹):**

- [ ] Supabase JS 클라이언트 초기화
- [ ] 로그인/회원가입 페이지 (이메일)
- [ ] 세션 상태 관리 (Context 또는 Zustand)
- [ ] 인증 미들웨어 (보호 라우트)

**API 클라이언트:**

- [ ] 백엔드 API 호출 레이어 (fetch wrapper + JWT 자동 주입)
- [ ] 에러 핸들링 패턴 (429, 401, 500)
- [ ] React Query 세팅 (캐싱, 자동 재요청)

**레이아웃:**

- [ ] App Shell: 사이드바 또는 상단 네비게이션 (Mine / Vault / Lab)
- [ ] 반응형 기본 구조 (데스크톱 우선, 태블릿/모바일 대응)
- [ ] 배경 시스템 기초 (깊은 네이비 그라디언트, 미세한 입자 효과)

**Phase 0 완료 기준:** 로그인 → 세 공간 이동 → 프로필 확인이 동작한다.

---

## Phase 1 — 핵심 루프 (Sprint 1~2)

### 목표

Mine → Vault → Lab 핵심 루프가 웹에서 완전히 동작한다. 이것만으로 "유용하다"를 판단할 수 있어야 한다.

### Sprint 1: The Mine

Mine은 v2의 flagship 공간이다. 가장 cinematic하고 인상적이어야 한다.

**광맥 (Veins):**

- [ ] 오늘의 광맥 3개 표시 (GET `/mining/veins/today`)
- [ ] 광맥 카드 UI (키워드 칩, 레어리티 표시)
- [ ] 키워드 칩 (카테고리별 컬러: AI, Who, Domain, Tech, Value, Money)
- [ ] 레어리티 시각 처리 (common/rare/golden/legend)
- [ ] 리롤 버튼 + 잔여 횟수 (POST `/mining/veins/reroll`)

**채굴 (Mining):**

- [ ] 광맥 선택 → 채굴 시작 (POST `/mining/veins/{id}/mine`)
- [ ] 로딩 상태 (Framer Motion 기반, 프리미엄 느낌)
- [ ] 결과: 아이디어 10개 표시 (카드 리스트)
- [ ] 아이디어 카드: 제목, 요약, tier_type 표시
- [ ] tier_type별 시각 구분 (stable/expansion/pivot/rare)

**금고 반입:**

- [ ] 아이디어 선택 UI (체크박스 또는 스와이프)
- [ ] 선택 → 금고 반입 (PATCH `/ideas/vault`)
- [ ] 반입 슬롯 표시 (miner_level 기반 용량)
- [ ] 반입 성공 피드백

**일일 상태:**

- [ ] 남은 리롤/채굴 횟수 표시
- [ ] 소진 시 안내 UI

### Sprint 2: The Vault + The Lab

**Vault:**

- [ ] 저장된 아이디어 목록 (grid 또는 list)
- [ ] 아이디어 상세 보기 (제목, 요약, 키워드, 날짜)
- [ ] 삭제 기능
- [ ] 정렬/필터 기초 (최신순)
- [ ] 개요(Overview) 있는 아이디어 표시 구분

**Lab — 개요 생성:**

- [ ] 아이디어 선택 → 개요 생성 (POST `/lab/overview`)
- [ ] 로딩 상태 (분석 중 느낌)
- [ ] 개요 결과 표시: 6 섹션 (Problem, Target, Features, Differentiator, Revenue, MVP Scope)
- [ ] 한/영 전환 토글

**Lab — 감정 (Appraisal):**

- [ ] 개요 기반 감정 요청 (POST `/lab/appraisal`)
- [ ] 감정 결과 표시: 3~6축 코멘트 카드
- [ ] depth 레벨 표시 (basic_free/basic/precise_lite/precise_pro)
- [ ] 티어에 따른 depth 접근 제한 UI

**Lab — 풀 개요 (Full Overview):**

- [ ] 풀 개요 생성 요청 (POST `/lab/overview/full`)
- [ ] 결과 표시: Narrative 9섹션 + Technical 6섹션
- [ ] confidence 라벨 표시 (REVIEW/DRAFT/READY)
- [ ] 텍스트 복사/내보내기

### Gate 1: 핵심 루프 동작 검증

**측정 방법:** 5~10명 테스터에게 웹 제품 공유

**통과 기준 (3개 중 2개+):**

1. 테스터가 채굴 → 금고 반입 → 개요 생성까지 **완주**한다 (완주율 > 60%)
2. 테스터 5명 중 3명+ "다시 써보고 싶다"
3. 생성된 개요의 품질에 대해 "유용하다" 평가 (3/5+)

**Gate 1 실패 시 점검:**

1. 채굴 결과(아이디어) 품질이 충분한가? → 프롬프트 튜닝
2. UI 흐름이 직관적인가? → UX 개선
3. 로딩이 너무 긴가? → 로딩 UX 개선
4. 개요 생성의 가치가 체감되는가? → 프롬프트 또는 표시 방식 개선

---

## Phase 1.5 — 경험 품질 + 리텐션 기반 (Sprint 3~4)

### 목표

핵심 루프가 검증된 후, 제품 경험을 프리미엄 수준으로 끌어올리고 재방문 동기를 만든다.

### Sprint 3: 프리미엄 경험

**모션:**

- [ ] Mine 진입 트랜지션 (Framer Motion)
- [ ] 채굴 로딩 — cinematic 연출 (입자, 신호, 깊이감)
- [ ] 카드 등장/퇴장 애니메이션
- [ ] 공간 전환(Mine↔Vault↔Lab) 트랜지션
- [ ] 마이크로 인터랙션 (호버, 클릭, 선택)

**배경 시스템:**

- [ ] Mine: 성운 깊이 레이어 + 미세 입자 (Canvas 또는 CSS)
- [ ] Vault: 동일 우주, 억제된 분위기
- [ ] Lab: 깨끗하고 분석적인 배경

**반응형:**

- [ ] 데스크톱 (1200px+): 풀 레이아웃
- [ ] 태블릿 (768~1199px): 적응형
- [ ] 모바일 웹 (~ 767px): 기본 대응 (나중에 앱이 대체)

**에러/엣지 케이스:**

- [ ] 네트워크 에러 처리
- [ ] Rate limit (429) 안내 UI
- [ ] 빈 상태 (아이디어 0개, 개요 0개)
- [ ] 로딩 스켈레톤

### Sprint 4: 리텐션 + 랜딩

**리텐션:**

- [ ] 데일리 광맥 갱신 안내 (오늘의 광맥이 달라졌다는 인지)
- [ ] 연속 접속 카운터 (streak_days 표시)
- [ ] 간단한 프로필/마이페이지

**랜딩 페이지:**

- [ ] 퍼블릭 랜딩 (로그인 전) — 제품 소개, 핵심 루프 설명
- [ ] CTA: 회원가입 또는 데모 체험
- [ ] 첫 채굴 1회 무료 체험 (로그인 불필요) — 가능하면

**분석:**

- [ ] 기본 이벤트 트래킹 (PostHog 또는 GA4)
- [ ] 핵심 퍼널: 방문 → 가입 → 첫 채굴 → 금고 반입 → 개요 생성

### Gate 2: 리텐션 검증

**측정 방법:** 첫 50명 사용자 행동 데이터

**통과 기준 (3개 중 2개+):**

1. D1 재방문율 > 20%
2. 첫 채굴 → 개요 생성 전환율 > 30%
3. 주간 활성 사용자 중 2회+ 채굴 비율 > 40%

**Gate 2 실패 시 점검:**

1. 첫 경험이 인상적인가? → Mine 연출 강화
2. 결과물의 재방문 가치가 있는가? → Vault 활용 경험 개선
3. 매일 올 이유가 있는가? → 데일리 광맥의 가치 강화
4. 로딩/대기 시간에 이탈하는가? → 퍼포먼스 최적화

---

## Phase 2 — 수익화 검증 (Sprint 5~6)

### 목표

무료/유료 차이를 체감시키고, 전환율을 검증한다.

### Sprint 5: 티어 시스템 + 결제

**티어 UI:**

- [ ] Free/Lite/Pro 차이 표시 (일일 한도, 감정 깊이, AI 키워드)
- [ ] 업그레이드 유도 UI (Free에서 Pro 기능 접근 시)
- [ ] 프라이싱 페이지

**결제 (Polar.sh):**

- [ ] Polar.sh 세팅 (웹)
- [ ] 구독 구매 흐름
- [ ] 구독 상태 → Supabase profiles.tier 동기화
- [ ] 구독 관리 (해지, 변경)

**Pro 체험:**

- [ ] Pro 7일 무료 체험 (카드 등록 불필요)
- [ ] 체험 만료 안내

### Sprint 6: Pro 가치 강화

**Pro 전용 기능 강화:**

- [ ] 풀 개요 접근 (Pro only)
- [ ] 정밀 감정 precise_pro (Pro only)
- [ ] AI 키워드 자유 선택 (Pro)
- [ ] 채굴/리롤 한도 차이 체감 UI

**비교 경험:**

- [ ] Free vs Pro 결과 품질 차이가 보이는 UI
- [ ] 감정 basic_free (3축) vs precise_pro (6축) 비교 체험

### Gate 3: 수익화 검증

**측정 방법:** 100명+ 사용자 기반 전환 데이터

**통과 기준 (2개 중 1개+):**

1. Free → Pro 전환율 > 2%
2. Pro 체험 후 유지율 > 15%

**Gate 3 실패 시 점검:**

1. Pro의 가치가 체감되는가? → 풀 개요/정밀 감정의 품질 개선
2. 가격이 높은가? → 프라이싱 재검토
3. 업그레이드 시점이 자연스러운가? → 유도 UX 개선
4. Free가 너무 충분한가? → Free 제한 조정

---

## Phase 3 — 확장 (Sprint 7+, Gate 3 통과 후)

### 목표

검증된 제품 위에 확장 기능을 쌓는다. Phase 3의 범위는 Gate 3 시점의 데이터를 보고 결정.

### 확장 후보 (우선순위는 Gate 3 후 판단)

**제품 깊이:**

- [ ] Vault 폴더/태그 정리
- [ ] 아이디어 비교/분기
- [ ] 개요 버전 관리
- [ ] 감정 rubric 다양화
- [ ] 아이디어 DNA 리포트

**성장:**

- [ ] SEO 최적화 (Programmatic SEO — 상위 조합 페이지)
- [ ] 소셜 공유 (아이디어 카드 이미지)
- [ ] 뉴스레터 자동 발행 ("오늘의 아이디어")
- [ ] 랜딩 페이지 고도화

**플랫폼 확장:**

- [ ] 모바일 앱 (Expo, 기존 코드 기반 + 웹 검증된 UX 반영)
- [ ] MCP 서버 복원 (개발자 획득 채널)
- [ ] 웹 푸시 알림

**새로운 공간:**

- [ ] The Observatory — 트렌드/패턴 대시보드
- [ ] The Showcase — 공개 전시
- [ ] The Exchange — 아이디어/투자자 매칭

---

## Sprint 실행 규칙

### 각 Sprint를 시작할 때

1. 해당 Sprint의 **구현 플랜**을 `mind/09-Implementation/plans/YYYY-MM-DD-sprint-N-<topic>.md`에 작성
2. 구현 플랜은 파일 단위 태스크 + 테스트 + 커밋 단위로 세분화
3. 구현 플랜 완성 후 실행 (subagent-driven 또는 직접)

### 각 Sprint가 끝날 때

1. 동작 확인 (브라우저에서 직접 테스트)
2. 커밋 정리
3. 다음 Sprint 시작 전 현재 상태 점검

### Gate 판단 시

1. 데이터 수집 (분석 도구 또는 수동 피드백)
2. 통과 기준 대비 결과 정리
3. 통과 → 다음 Phase. 실패 → 실패 원인 분석 → 개선 Sprint 추가
4. 의사결정은 `mind/10-Journal/QUICK-DECISIONS.md`에 기록

---

## 이 로드맵의 근거 문서

- `docs/Project-Overview-v2.md` — 제품 방향, 전략, 원칙, MVP 범위
- `docs/Premium-Space-UI-Style-Guide.md` — 디자인 시스템, 컬러, CTA, 모션 규칙
- `docs/Idea-Mine-V2-V3-Safety-Rails.ko.md` — DB/API/확장 안전장치
- `mind/90-Archive/Phases-Roadmap.md` — v1 로드맵 (Gate-Based Development 원본)

---

## 이 로드맵의 핵심

v2는 **"미래를 다 구현한 로드맵"이 아니라 "Gate를 통과할 때마다 다음이 열리는 로드맵"**이다.

Phase 0~1은 확정. Phase 1.5~2는 Gate 1 결과에 따라 조정 가능. Phase 3는 Gate 3 후에 범위를 정한다.

지금 가장 중요한 것은 **Phase 0 → Phase 1 → Gate 1**이다. 핵심 루프가 웹에서 동작하고, 사람들이 "다시 쓰고 싶다"고 말하는지 확인하는 것.
