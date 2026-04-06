---
title: Screen Map
tags:
  - design
  - v2
---

# Screen Map

> v2 전체 화면 목록과 라우팅 구조. Next.js App Router 기준.

---

## 네비게이션 구조

```
Public Layer (로그인 전):
  /              -- 랜딩 페이지
  /auth          -- 로그인/회원가입

App Layer (로그인 후):
  /mine          -- The Mine (광산, 기본 진입점)
  /vault         -- The Vault (금고)
  /lab           -- The Lab (실험실)
  /profile       -- 프로필/설정
```

---

## 화면 목록

### The Mine (광산)

| 화면 | 경로 | 핵심 요소 | Phase |
|------|------|----------|-------|
| 광산 홈 | `/mine` | 오늘의 광맥 3개, 리롤 버튼, 일일 상태 | 1 |
| 채굴 결과 | `/mine/[veinId]` | 아이디어 10개 리스트 (4군), 금고 반입, Lab 이동 | 1 |

### The Lab (실험실)

| 화면 | 경로 | 핵심 요소 | Phase |
|------|------|----------|-------|
| 실험실 홈 | `/lab` | 개요 생성 입구, 감정 목록, 최근 문서 | 1 |
| 개요 생성/보기 | `/lab/overview/[ideaId]` | 6섹션 개요 (한/영) | 1 |
| 감정 결과 | `/lab/appraisal/[overviewId]` | 3~6축 코멘트 카드 | 1 |
| 풀 개요 | `/lab/full/[overviewId]` | Narrative 9섹션 + Technical 6섹션 | 1 |

### The Vault (금고)

| 화면 | 경로 | 핵심 요소 | Phase |
|------|------|----------|-------|
| 금고 목록 | `/vault` | 저장된 아이디어 리스트, 상태 표시 | 1 |
| 아이디어 상세 | `/vault/[ideaId]` | 상세 + Lab으로 보내기 | 1 |

### Profile

| 화면 | 경로 | 핵심 요소 | Phase |
|------|------|----------|-------|
| 프로필 | `/profile` | 닉네임, 레벨, 연속 접속, 티어 | 1 |
| 설정 | `/profile/settings` | 계정, 언어, 로그아웃 | 1 |
| 구독 관리 | `/profile/subscription` | 티어, 업그레이드/다운그레이드 | 2 |

### Public / Auth

| 화면 | 경로 | 핵심 요소 | Phase |
|------|------|----------|-------|
| 랜딩 | `/` | 제품 소개, CTA | 1.5 |
| 로그인 | `/auth` | 이메일 + 소셜 (Supabase Auth) | 0 |

### Phase 3+ (미정)

| 화면 | 핵심 요소 |
|------|----------|
| 쇼케이스 | 공개 전시 |
| 거래소 | 기회/자산 매칭 |
| 전망대 | 트렌드 대시보드 |

---

## 화면 이동 흐름

### 핵심 루프

```
[Mine 홈]
  광맥 선택
    |
    v
[채굴 결과] -- 10개 리스트
  |              |
  | 금고에 반입    | Lab으로 이동
  v              v
[Vault 목록]   [개요 생성]
  |              |
  | 상세 보기      | 감정 / 풀 개요
  v              v
[아이디어 상세]  [감정 결과]
  |
  | Lab으로 보내기
  v
[개요 생성]
```

---

## Next.js App Router 구조

```
src/app/
├── layout.tsx              -- 루트 레이아웃
├── page.tsx                -- 랜딩 (/)
├── auth/
│   └── page.tsx            -- 로그인
├── (app)/                  -- 인증 필요 그룹
│   ├── layout.tsx          -- App Shell (네비게이션)
│   ├── mine/
│   │   ├── page.tsx        -- 광산 홈
│   │   └── [veinId]/
│   │       └── page.tsx    -- 채굴 결과
│   ├── vault/
│   │   ├── page.tsx        -- 금고 목록
│   │   └── [ideaId]/
│   │       └── page.tsx    -- 아이디어 상세
│   ├── lab/
│   │   ├── page.tsx        -- 실험실 홈
│   │   ├── overview/
│   │   │   └── [ideaId]/
│   │   │       └── page.tsx
│   │   ├── appraisal/
│   │   │   └── [overviewId]/
│   │   │       └── page.tsx
│   │   └── full/
│   │       └── [overviewId]/
│   │           └── page.tsx
│   └── profile/
│       ├── page.tsx        -- 프로필
│       ├── settings/
│       │   └── page.tsx
│       └── subscription/
│           └── page.tsx
```

---

## Phase별 화면 추가

| Phase | 추가 화면 |
|-------|----------|
| 0 | Auth, 기본 레이아웃 |
| 1 | Mine 홈/결과, Vault 목록/상세, Lab 홈/개요/감정/풀개요, Profile |
| 1.5 | 랜딩 페이지, 반응형 강화 |
| 2 | 프라이싱, 구독 관리 |
| 3+ | 쇼케이스, 거래소, 전망대 |

---

## Related

- [[Premium-Space-UI-Direction]] — v2 디자인 방향
- [[Color-Theme]] — 컬러 토큰

## See Also

- [[Phase-1-MVP]] -- Phase 1 범위 (09-Implementation)
- [[Onboarding]] -- 온보딩 흐름 (04-Features)
