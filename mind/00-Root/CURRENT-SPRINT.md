---
title: Current Sprint
tags:
  - root
  - v2
---

# Current Sprint

> Gate-Based Development. 전체 로드맵: [[V2-Roadmap]]
> v1 로드맵(아카이브): `mind/90-Archive/Phases-Roadmap.md`

---

## v1 완료 Sprint 요약

| Sprint | 내용 | 상태 |
|--------|------|------|
| Sprint 0 | Mind 구조 + 기술 스택 확정 + Expo 초기화 | DONE |
| Sprint 1 | DB 스키마 + Auth + 디자인 토큰 | DONE |
| Sprint 2 | The Mine 백엔드/프론트 + Pipeline v2 + Admin | DONE |
| Sprint 3 | Vault/Lab 백엔드 (Overview + Appraisal + Full Overview) | 백엔드 DONE, 프론트 미완 |

---

## v2 전환 (2026-04-04)

**앱 우선 → 웹 우선** 전환. Next.js + 프리미엄 스페이스 UI.
백엔드/DB는 그대로 재사용. 웹 프론트엔드를 새로 구축한다.

| 자산 | 상태 |
|------|------|
| 백엔드 (FastAPI 5 라우터, 8 서비스) | 완성, 재사용 |
| DB (v2 마이그레이션 10개, RLS, 인덱스) | 완성, 재사용 |
| LLM 프롬프트 (mining v3, overview v4.2, appraisal v2) | 완성, 재사용 |
| Next.js 프로젝트 (`apps/web/`) | 초기화 완료 |
| 디자인 토큰 (Tailwind v4) | 세팅 완료 |

---

## v2 Phase 0 — 웹 기반 (현재)

### Sprint 0: 디자인 방향 + 시스템 + Auth + 레이아웃

**Phase:** 0 (웹 기반)
**상태:** 진행 중

**활성 대표 Task ID:**

- `S0-DIR-01` — Mine / Vault / Lab / Basecamp 디자인 방향 고정
- `S0-DS-01` — 디자인 시스템 기초
- `S0-AUTH-01` — Supabase Auth 연결
- `S0-API-01` — 백엔드 API 클라이언트 계층
- `S0-SHELL-01` — Mine / Vault / Lab / Basecamp App Shell

**이미 완료된 기반:**

- [x] `apps/web/` Next.js 초기화
- [x] Tailwind v4 기반 v2 디자인 토큰 세팅
- [x] 로컬 `npm run dev` 확인
- [x] v2 Supabase DB 체인 (`00001~00010`) 재생성 검증

**디자인 방향 고정:**

- [ ] Mine / Vault / Lab / Basecamp 공간별 분위기 언어 확정
- [ ] `Premium-Space-UI-Direction` 기준의 시각 위계 정리
- [ ] [[Space-Language]] 기준으로 공간별 차이 명문화
- [ ] 공간별 레퍼런스 화면 또는 블록 구조 정의

### S0-DIR-01 실행 체크리스트

- [ ] 공통 차이축 5개 확정
- [ ] Mine 한 줄 정의 확정
- [ ] Mine 블록 구조 확정
- [ ] Mine do / don't 확정
- [ ] Vault 한 줄 정의 확정
- [ ] Vault 블록 구조 확정
- [ ] Vault do / don't 확정
- [ ] Lab 한 줄 정의 확정
- [ ] Lab 블록 구조 확정
- [ ] Lab do / don't 확정
- [ ] Basecamp 한 줄 정의 확정
- [ ] Basecamp 블록 구조 확정
- [ ] Basecamp do / don't 확정
- [ ] 4개 공간 3초 판별 질문 정리
- [ ] `Space-Language`에 산출물 반영
- [ ] `Premium-Space-UI-Direction` / `Screen-Map`과 용어 충돌 없는지 확인

### 오늘 바로 시작 순서

1. Mine 블록 구조와 첫 인상 문장 고정
2. Vault 블록 구조와 정보 위계 고정
3. Lab 블록 구조와 단계 흐름 고정
4. Basecamp 블록 구조와 허브 역할 고정
5. 4개 공간의 차이축을 다시 비교

**디자인 시스템 기초:**

- [ ] 기본 컴포넌트 (Button, Card, Panel)
- [ ] 타이포그래피 (Display / Body 분리)
- [ ] CTA 계층 (Signal Accent 패턴)
- [ ] 아이콘 시스템

**Supabase Auth (웹):**

- [ ] Supabase JS 클라이언트 초기화
- [ ] 로그인/회원가입 페이지
- [ ] 세션 상태 관리
- [ ] 인증 미들웨어

**API 클라이언트:**

- [ ] 백엔드 API 호출 레이어 (JWT 자동 주입)
- [ ] 에러 핸들링
- [ ] React Query 세팅

**레이아웃:**

- [ ] App Shell (Mine / Vault / Lab 네비게이션)
- [ ] 반응형 기본 구조
- [ ] 배경 시스템 기초

**완료 기준:** 로그인 → 세 공간 이동 → 프로필 확인이 동작하고, 네 공간의 첫 분위기 차이가 읽힌다

---

## Upcoming

| Phase | Sprint | 목표 | 어드민 | Gate |
|-------|--------|------|--------|------|
| Phase 1 | S1 | Mine 핵심 루프 | - | - |
| Phase 1 | S2 | Vault + Lab + **어드민 MVP** | 비용 대시보드, 퍼널 분석, 사용자 목록 | 완주율 60%+, "다시 쓰고 싶다" 3/5+ |
| Phase 1.5 | S3 | 프리미엄 모션 + 배경 | - | - |
| Phase 1.5 | S4 | 리텐션 + 랜딩 + **어드민 확장** | DAU/MAU, 리텐션, 키워드 관리, 공지 | D1 재방문율 > 20% |
| Phase 2 | S5 | 티어 + 결제 | - | - |
| Phase 2 | S6 | Pro 가치 + **어드민 수익 분석** | 전환율 추적, 프롬프트 관리, 남용 모니터링 | Free→Pro 전환율 > 2% |
| Phase 3 | S7+ | Gate 3 후 범위 결정 | 시즌/이벤트, 피드백, 헬스, 감사 로그 | - |

상세: `2026-04-06-v2-gate-based-roadmap`
