# Mining API Client 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expo 프론트엔드에서 Python 백엔드 Mining API를 호출하는 타입 안전한 클라이언트 레이어 구현

**Architecture:** `lib/api.ts`에 인증된 fetch 래퍼 + 3개 Mining API 함수를 구현한다. Supabase JWT 토큰을 Bearer 헤더에 실어 백엔드에 전달한다. TypeScript 타입은 백엔드 Pydantic 스키마(`backend/app/models/schemas.py`)를 미러링한다.

**Tech Stack:** TypeScript, Expo (React Native), Supabase Auth (JWT)

---

## 현재 상태

- `apps/mobile/lib/supabase.ts` — Supabase 클라이언트 + OAuth (이미 구현)
- `apps/mobile/hooks/useSession.ts` — 세션 컨텍스트 (이미 구현)
- `apps/mobile/.env` — `EXPO_PUBLIC_API_URL=http://localhost:8000` (이미 설정)
- `backend/app/routers/mining.py` — 3개 엔드포인트 (이미 구현)
- `backend/app/models/schemas.py` — Pydantic 응답 스키마 (이미 정의)

## 백엔드 API 엔드포인트 (참고)

| 메서드 | 경로 | 응답 | 설명 |
|--------|------|------|------|
| GET | `/mining/veins/today` | `TodayVeinsResponse` | 오늘의 광맥 3개 조회 (없으면 생성) |
| POST | `/mining/veins/reroll` | `RerollResponse` | 광맥 다시 뽑기 (리롤 횟수 차감) |
| POST | `/mining/veins/{vein_id}/mine` | `MineResponse` | 광맥 선택 → 아이디어 10개 생성 |

## 백엔드 Pydantic 스키마 (미러링 대상)

```python
# backend/app/models/schemas.py
class KeywordOut:      id, slug, category, ko, en, is_premium
class VeinOut:         id, slot_index, keyword_ids, keywords[], rarity, is_selected
class TodayVeinsResponse: veins[], rerolls_used, rerolls_max, generations_used, generations_max
class IdeaOut:         id, title, summary, keyword_combo[], tier_type, sort_order, is_vaulted, language
class MineResponse:    ideas[], vein_id
class RerollResponse:  veins[], rerolls_used, rerolls_max
class ErrorResponse:   error, message, retry_after?
```

---

## Task 1: TypeScript 타입 정의

**파일:**
- Create: `apps/mobile/lib/types.ts`

**설명:** 백엔드 Pydantic 스키마를 TypeScript interface로 미러링. API 응답을 타입 안전하게 다루기 위한 기반.

**코드:**

```typescript
// apps/mobile/lib/types.ts

// --- Mining API 타입 ---

export interface Keyword {
  id: string;
  slug: string;
  category: string;
  ko: string;
  en: string;
  is_premium: boolean;
}

export interface Vein {
  id: string;
  slot_index: number;
  keyword_ids: string[];
  keywords: Keyword[];
  rarity: string;
  is_selected: boolean;
}

export interface TodayVeinsResponse {
  veins: Vein[];
  rerolls_used: number;
  rerolls_max: number;
  generations_used: number;
  generations_max: number;
}

export interface Idea {
  id: string;
  title: string;
  summary: string;
  keyword_combo: Record<string, string>[];
  tier_type: string;
  sort_order: number;
  is_vaulted: boolean;
  language: string;
}

export interface MineResponse {
  ideas: Idea[];
  vein_id: string;
}

export interface RerollResponse {
  veins: Vein[];
  rerolls_used: number;
  rerolls_max: number;
}

export interface ApiError {
  error: string;
  message: string;
  retry_after?: number;
}
```

**커밋:**

```bash
git add apps/mobile/lib/types.ts
git commit -m "feat: add TypeScript types mirroring backend Pydantic schemas"
```

---

## Task 2: 인증된 API 클라이언트 + Mining 함수 구현

**파일:**
- Create: `apps/mobile/lib/api.ts`
- Reference: `apps/mobile/lib/supabase.ts` (JWT 토큰 소스)

**설명:** `supabase.auth.getSession()`에서 JWT access_token을 가져와 Bearer 헤더에 넣는 fetch 래퍼. 3개 Mining API 함수를 export.

**핵심 설계 결정:**

1. **왜 fetch 래퍼인가?** — axios 등 추가 의존성 없이 React Native 내장 fetch 사용. MVP에서 충분.
2. **왜 supabase에서 토큰을 가져오는가?** — 백엔드가 Supabase JWT를 검증하는 구조(`backend/app/dependencies.py`의 `get_current_user`). 프론트는 Supabase Auth 세션의 access_token을 그대로 전달.
3. **에러 처리 방식:** 백엔드 `ErrorResponse`를 파싱해서 `ApiError`로 throw. 429(Rate Limit)는 `retry_after` 포함.

**코드:**

```typescript
// apps/mobile/lib/api.ts

import { supabase } from "./supabase";
import type {
  TodayVeinsResponse,
  RerollResponse,
  MineResponse,
  ApiError,
} from "./types";

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

// --- Base fetch ---

async function getAccessToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not authenticated");
  return token;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body: ApiError = await res.json().catch(() => ({
      error: "unknown",
      message: res.statusText,
    }));
    throw body;
  }

  return res.json();
}

// --- Mining API ---

/** 오늘의 광맥 3개 조회 (없으면 생성) */
export function getTodayVeins(): Promise<TodayVeinsResponse> {
  return apiFetch<TodayVeinsResponse>("/mining/veins/today");
}

/** 광맥 다시 뽑기 (리롤 횟수 차감) */
export function rerollVeins(): Promise<RerollResponse> {
  return apiFetch<RerollResponse>("/mining/veins/reroll", {
    method: "POST",
  });
}

/** 광맥 선택 → 아이디어 10개 생성 */
export function mineVein(veinId: string): Promise<MineResponse> {
  return apiFetch<MineResponse>(`/mining/veins/${veinId}/mine`, {
    method: "POST",
  });
}
```

**커밋:**

```bash
git add apps/mobile/lib/api.ts
git commit -m "feat: add mining API client with auth fetch wrapper"
```

---

## Task 3: 수동 동작 확인

**파일:**
- Modify: `apps/mobile/app/(tabs)/index.tsx` (임시 테스트용 — 나중에 본격 구현 시 교체)

**설명:** API가 실제로 동작하는지 확인하기 위해 Mine 화면에서 `getTodayVeins()`를 호출해보고 콘솔 로그로 확인.

**사전 조건:**
- 백엔드가 `http://localhost:8000`에 실행 중이어야 함
- Supabase Auth로 로그인된 세션이 있어야 함

**코드:**

```typescript
// apps/mobile/app/(tabs)/index.tsx — 임시 동작 확인용
import { View, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { midnight } from "../../constants/theme";
import { PixelText } from "../../components/PixelText";
import { getTodayVeins } from "../../lib/api";
import type { TodayVeinsResponse } from "../../lib/types";

export default function MineScreen() {
  const [data, setData] = useState<TodayVeinsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTodayVeins()
      .then(setData)
      .catch((e) => setError(e.message ?? JSON.stringify(e)));
  }, []);

  return (
    <View style={styles.container}>
      <PixelText variant="title">The Mine</PixelText>
      {error && (
        <PixelText variant="body" style={{ color: "red", marginTop: 8 }}>
          {error}
        </PixelText>
      )}
      {data && (
        <>
          <PixelText variant="body" style={{ marginTop: 8 }}>
            광맥 {data.veins.length}개 로드됨
          </PixelText>
          <PixelText variant="body" style={{ marginTop: 4 }}>
            리롤 {data.rerolls_used}/{data.rerolls_max}
          </PixelText>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: midnight.bg.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
```

**확인 방법:**

```bash
# 터미널 1: 백엔드 실행
cd backend && source venv/Scripts/activate && uvicorn app:app --reload

# 터미널 2: Expo 실행
cd apps/mobile && npx expo start
```

1. 앱에서 로그인
2. The Mine 탭으로 이동
3. "광맥 3개 로드됨" + "리롤 0/2" 표시 확인
4. 에러가 뜨면 콘솔 로그 확인

**커밋:**

```bash
git add apps/mobile/app/\(tabs\)/index.tsx
git commit -m "feat: wire up getTodayVeins to Mine screen (WIP)"
```

---

## 요약

| Task | 파일 | 내용 |
|------|------|------|
| 1 | `lib/types.ts` | TypeScript 타입 (Pydantic 미러) |
| 2 | `lib/api.ts` | 인증 fetch 래퍼 + Mining 함수 3개 |
| 3 | `app/(tabs)/index.tsx` | 수동 동작 확인 (임시) |
