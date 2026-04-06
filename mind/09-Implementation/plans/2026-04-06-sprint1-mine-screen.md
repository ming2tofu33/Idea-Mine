# Sprint 1: The Mine Screen Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mine 화면에서 광맥 확인 → 리롤 → 채굴 → 아이디어 10개 확인 → 금고 반입까지 실제 동작하게 만든다.

**Architecture:** API 클라이언트(fetch + JWT)와 React Query를 세팅한 뒤, Mine 페이지를 단계적으로 구축한다. 백엔드 API는 이미 완성되어 있으므로 프론트엔드만 만들면 된다. 타입은 v1 모바일에서 검증된 것을 재사용한다.

**Tech Stack:** Next.js 16 App Router, @tanstack/react-query, @supabase/ssr, TypeScript, Tailwind v4

---

## 기존 자산

- 백엔드 API: `GET /mining/veins/today`, `POST /mining/veins/reroll`, `POST /mining/veins/{id}/mine`, `PATCH /ideas/vault`
- 타입 정의: `apps/mobile/types/api.ts` (검증 완료, 복사 후 사용)
- Supabase Auth: 쿠키 기반 세션 (S0-AUTH-01 완료)
- Mine 배경: Canvas + CSS cinematic background (완료)
- App Shell: 글래스 헤더 + 네비게이션 (완료)

## 환경변수 필요

`apps/web/.env.local`에 백엔드 API URL 추가 필요:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

### Task 1: TypeScript 타입 정의

**Files:**
- Create: `apps/web/src/types/api.ts`

v1 모바일의 `apps/mobile/types/api.ts`를 기반으로, 웹에서 필요한 타입만 가져온다. Sprint 1에서 사용하는 Mining + Vault 타입.

**내용:**

```typescript
// Keyword
export interface Keyword {
  id: string;
  slug: string;
  category: "ai" | "who" | "domain" | "tech" | "value" | "money";
  ko: string;
  en: string;
  is_premium: boolean;
}

// Vein
export type VeinRarity = "common" | "rare" | "golden" | "legend";

export interface Vein {
  id: string;
  slot_index: number;
  keyword_ids: string[];
  keywords: Keyword[];
  rarity: VeinRarity;
  is_selected: boolean;
}

export interface TodayVeinsResponse {
  veins: Vein[];
  rerolls_used: number;
  rerolls_max: number;
  generations_used: number;
  generations_max: number;
}

export interface RerollResponse {
  veins: Vein[];
  rerolls_used: number;
  rerolls_max: number;
}

// Idea
export type IdeaTierType = "stable" | "expansion" | "pivot" | "rare";

export interface Idea {
  id: string;
  title_ko: string;
  title_en: string;
  summary_ko: string;
  summary_en: string;
  keyword_combo: KeywordComboEntry[];
  tier_type: IdeaTierType;
  sort_order: number;
  is_vaulted: boolean;
}

export interface KeywordComboEntry {
  category: string;
  slug: string;
  ko: string;
  en: string;
}

export interface MineResponse {
  ideas: Idea[];
  vein_id: string;
}

// Vault
export interface VaultRequest {
  idea_ids: string[];
  vein_id: string;
}

export interface VaultResponse {
  vaulted_count: number;
  idea_ids: string[];
}

// Error
export interface ApiError {
  error: string;
  message: string;
  retry_after?: number;
}

// Daily State (embedded in TodayVeinsResponse)
export interface DailyState {
  rerolls_used: number;
  rerolls_max: number;
  generations_used: number;
  generations_max: number;
}
```

**Commit:** `feat: api type definitions for mining and vault`

---

### Task 2: API 클라이언트 + React Query 세팅

**Files:**
- Create: `apps/web/src/lib/api.ts` — fetch wrapper + JWT + 에러 클래스
- Create: `apps/web/src/lib/query-provider.tsx` — React Query Provider
- Modify: `apps/web/src/app/(app)/layout.tsx` — QueryProvider 추가
- Run: `npm install @tanstack/react-query`

**api.ts 내용:**

v1의 `apiFetch` 패턴을 재사용하되 mock 제거, Supabase SSR 클라이언트 사용.

```typescript
import { createClient } from "@/lib/supabase/client";
import type { ApiError } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export class ApiClientError extends Error {
  status: number;
  body: ApiError;

  constructor(status: number, body: ApiError) {
    super(body.message);
    this.name = "ApiClientError";
    this.status = status;
    this.body = body;
  }

  get isRateLimited() { return this.status === 429; }
  get retryAfter() { return this.body.retry_after; }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body: ApiError = await res.json().catch(() => ({
      error: "unknown",
      message: res.statusText,
    }));
    throw new ApiClientError(res.status, body);
  }

  return res.json();
}

// --- Mining API ---

export const miningApi = {
  getTodayVeins: () => apiFetch<TodayVeinsResponse>("/mining/veins/today"),
  reroll: () => apiFetch<RerollResponse>("/mining/veins/reroll", { method: "POST" }),
  mine: (veinId: string) => apiFetch<MineResponse>(`/mining/veins/${veinId}/mine`, { method: "POST" }),
};

// --- Ideas API ---

export const ideasApi = {
  vault: (ideaIds: string[], veinId: string) =>
    apiFetch<VaultResponse>("/ideas/vault", {
      method: "PATCH",
      body: JSON.stringify({ idea_ids: ideaIds, vein_id: veinId }),
    }),
};
```

> import는 `@/types/api`에서 타입을 가져와야 함.

**query-provider.tsx 내용:**

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5분
        retry: 1,
      },
    },
  }));

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

**(app)/layout.tsx 수정:** QueryProvider로 children 감싸기.

**Commit:** `feat: api client, react query setup`

---

### Task 3: 광맥 카드 + 키워드 칩 컴포넌트

**Files:**
- Create: `apps/web/src/components/mine/keyword-chip.tsx`
- Create: `apps/web/src/components/mine/vein-card.tsx`

**keyword-chip.tsx:**

카테고리별 색상 매핑 — v1의 `constants/mining.ts`에서 가져옴.

```
ai     → signal-pink
who    → cold-cyan
domain → amber/gold
tech   → emerald
value  → violet
money  → rose
```

칩은 작은 라운드 뱃지: `border + 카테고리색 텍스트 + 반투명 배경`.

**vein-card.tsx:**

광맥 1개를 표시하는 카드. 구성:
- 상단: 레어리티 표시 (common/rare/golden/legend)
- 중앙: 키워드 칩 5~6개
- 하단: "채굴하기" 버튼 (Primary CTA — Signal Accent 패턴)

레어리티별 보더 색상:
- common: `line-steel`
- rare: violet 계열
- golden: amber 계열
- legend: 무지개/홀로그램 느낌

카드 스타일: `bg-surface-1/80 backdrop-blur border rounded-xl`

**Commit:** `feat: keyword chip and vein card components`

---

### Task 4: Mine 페이지 — 광맥 표시 + 리롤

**Files:**
- Modify: `apps/web/src/app/(app)/mine/page.tsx` — 실제 데이터 연결

**기능:**
- `useQuery("todayVeins", miningApi.getTodayVeins)` 로 광맥 3개 로드
- 광맥 카드 3개를 가로로 나열 (grid 또는 flex)
- 상단에 일일 상태 표시 (리롤 잔여 / 채굴 잔여)
- 리롤 버튼: `useMutation` → 성공 시 쿼리 무효화
- 리롤 소진 시 버튼 비활성
- 로딩 상태: 스켈레톤 카드
- 에러 상태: 재시도 버튼

**레이아웃:**

```
┌─────────────────────────────────┐
│  리롤 N/M              채굴 N/M │  ← 일일 상태
├─────────────────────────────────┤
│                                 │
│  ┌────────┐ ┌────────┐ ┌────────┐
│  │ Vein 1 │ │ Vein 2 │ │ Vein 3 │  ← 광맥 카드 3개
│  │ chips  │ │ chips  │ │ chips  │
│  │ [채굴] │ │ [채굴] │ │ [채굴] │
│  └────────┘ └────────┘ └────────┘
│                                 │
│         [ 다시 파기 🔄 ]         │  ← 리롤 버튼
└─────────────────────────────────┘
```

**Commit:** `feat: mine page with veins display and reroll`

---

### Task 5: 채굴 결과 화면

**Files:**
- Create: `apps/web/src/app/(app)/mine/[veinId]/page.tsx` — 채굴 결과
- Create: `apps/web/src/components/mine/idea-card.tsx` — 아이디어 카드

**흐름:**
1. 광맥 카드에서 "채굴하기" 클릭
2. `/mine/[veinId]` 페이지로 이동 (클라이언트 라우팅)
3. 페이지 진입 시 `useMutation(miningApi.mine)` 자동 실행
4. 로딩 중: cinematic 로딩 연출 (Framer Motion으로 간단하게)
5. 결과: 아이디어 10개를 카드 리스트로 표시

**idea-card.tsx:**

```
┌─────────────────────────────┐
│ [tier badge]     □ 선택     │
│ 아이디어 제목 (한국어)        │
│ 요약 2~3줄 (한국어)          │
│ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │chip │ │chip │ │chip │    │  ← keyword_combo
│ └─────┘ └─────┘ └─────┘   │
└─────────────────────────────┘
```

- tier_type별 뱃지: stable(기본) / expansion(확장) / pivot(전환) / rare(희귀)
- 선택 체크박스: 금고 반입할 아이디어를 고르는 용도
- 카드 스타일: Mine 공간이므로 Signal Accent 허용

**Commit:** `feat: mining result page with idea cards`

---

### Task 6: 금고 반입

**Files:**
- Modify: `apps/web/src/app/(app)/mine/[veinId]/page.tsx` — 금고 반입 기능 추가

**기능:**
- 아이디어 카드에서 체크박스로 선택
- 하단 플로팅 바: "금고에 반입 (N개 선택됨)" 버튼
- `useMutation(ideasApi.vault)` → 성공 시 완료 피드백
- 반입 가능 개수: miner_level 기반 (서버에서 검증)
- 성공 후: 선택된 카드에 "반입 완료" 표시
- 선택 0개일 때 버튼 비활성

**Commit:** `feat: vault ideas from mining result`

---

### Task 7: 빈 상태 + 에러 처리

**Files:**
- Create: `apps/web/src/components/shared/error-state.tsx`
- Create: `apps/web/src/components/shared/loading-skeleton.tsx`
- Modify: Mine 관련 페이지에 적용

**error-state.tsx:**
- 에러 메시지 + 재시도 버튼
- 429 (Rate Limited): "잠시 후 다시 시도해주세요" + retry_after 표시
- 401: "세션이 만료되었습니다" + 로그인 링크

**loading-skeleton.tsx:**
- 광맥 카드 스켈레톤 (shimmer 효과)
- 아이디어 카드 스켈레톤

**Commit:** `feat: error and loading states for mine`

---

### Task 8: 빌드 + E2E 검증

**검증 항목:**

1. `npm run build` 성공
2. 로그인 → Mine 진입 → 광맥 3개 로드
3. 리롤 클릭 → 새 광맥 로드 → 잔여 횟수 감소
4. 리롤 소진 → 버튼 비활성
5. 광맥 선택 → 채굴 → 아이디어 10개 표시
6. 아이디어 선택 → 금고 반입 → 완료 피드백
7. 채굴 소진 → 채굴 버튼 비활성
8. 에러 상태 (백엔드 중지 후 접근 → 에러 화면)

> **주의:** 백엔드(`uvicorn`)가 로컬에서 실행 중이어야 함.
> `cd backend && python -m uvicorn app.main:app --reload`

---

## 완료 기준

- [ ] 광맥 3개가 실제 API에서 로드됨
- [ ] 리롤이 동작하고 잔여 횟수가 업데이트됨
- [ ] 채굴 시 아이디어 10개가 표시됨
- [ ] 금고 반입이 동작함
- [ ] 로딩/에러 상태가 적절히 표시됨
- [ ] `npm run build` 성공

## 다음 태스크

Sprint 2 (Vault + Lab) — 저장된 아이디어 보기 + 개요 생성 + 감정
