---
title: Web Language Toggle Implementation Plan
tags:
  - implementation
  - web
  - i18n
---

# 웹 앱 언어 토글 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 웹 앱에 프로필 기반 언어 토글(KO/EN)을 추가하여 모든 다국어 페이지가 사용자의 `profiles.language` 설정을 따르도록 한다.

**Architecture:** `useProfile` 훅을 신설하여 React Query로 프로필을 캐싱하고 `updateLanguage` 뮤테이션 제공. AppShell 헤더에 KO/EN 토글 버튼 추가. Mine 페이지가 하드코딩된 `"ko"` 대신 `profile.language`를 사용하도록 변경.

**Tech Stack:** React, Next.js, TanStack Query, Supabase Client, Tailwind CSS v4

---

### Task 1: profileApi에 updateLanguage 추가

**Files:**
- Modify: `apps/web/src/lib/api.ts:307-322`

**Step 1: realProfileApi에 메서드 추가**

기존 `realProfileApi` 객체에 `updateLanguage` 메서드를 추가:

```typescript
const realProfileApi = {
  async getProfile(): Promise<UserProfile> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (error) throw error;
    return data as UserProfile;
  },

  async updateLanguage(language: "ko" | "en"): Promise<void> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { error } = await supabase
      .from("profiles")
      .update({ language })
      .eq("id", user.id);
    if (error) throw error;
  },
};
```

**Step 2: 커밋**

```bash
git add apps/web/src/lib/api.ts
git commit -m "feat: profileApi.updateLanguage()"
```

---

### Task 2: useProfile 훅 생성

**Files:**
- Create: `apps/web/src/hooks/use-profile.ts`

**Step 1: 훅 작성**

```typescript
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "@/lib/api";
import type { UserProfile } from "@/types/api";

export function useProfile() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: profileApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5분
  });

  const updateLanguageMutation = useMutation({
    mutationFn: (language: "ko" | "en") => profileApi.updateLanguage(language),
    onSuccess: (_, language) => {
      queryClient.setQueryData<UserProfile | null>(["profile"], (old) =>
        old ? { ...old, language } : old,
      );
    },
  });

  return {
    profile: profileQuery.data ?? null,
    isLoading: profileQuery.isLoading,
    updateLanguage: (language: "ko" | "en") =>
      updateLanguageMutation.mutate(language),
    isUpdatingLanguage: updateLanguageMutation.isPending,
  };
}
```

**Step 2: 커밋**

```bash
git add apps/web/src/hooks/use-profile.ts
git commit -m "feat: useProfile 훅 — 프로필 조회 + 언어 업데이트"
```

---

### Task 3: AppShell 헤더에 언어 토글 추가

**Files:**
- Modify: `apps/web/src/app/(app)/app-shell.tsx`

**Step 1: AppShell 클라이언트 컴포넌트에 토글 추가**

기존 AppShell은 이미 `"use client"`. profile prop을 받고 있지만, 새 useProfile 훅으로 클라이언트 사이드 상태도 관리:

```tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/types/api";
import { PersonaBadge } from "@/components/admin/persona-badge";
import { AdminFab } from "@/components/admin/admin-fab";
import { useProfile } from "@/hooks/use-profile";

const NAV_ITEMS = [
  { href: "/mine", label: "Mine" },
  { href: "/vault", label: "Vault" },
  { href: "/lab", label: "Lab" },
] as const;

export function AppShell({
  user,
  profile: serverProfile,
  children,
}: {
  user: User;
  profile: UserProfile | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile: clientProfile, updateLanguage, isUpdatingLanguage } = useProfile();

  // 클라이언트 프로필이 우선, 없으면 서버에서 받은 초기 프로필
  const profile = clientProfile ?? serverProfile;
  const currentLang = profile?.language ?? "ko";

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function handleToggleLanguage() {
    const next = currentLang === "ko" ? "en" : "ko";
    updateLanguage(next);
  }

  // ... rest of the component, add language toggle to the header right side
```

**Step 2: 헤더 우측에 토글 버튼 추가**

기존 `<div className="flex items-center gap-3">` 안의 PersonaBadge 옆에 추가:

```tsx
<div className="flex items-center gap-3">
  {profile && <PersonaBadge profile={profile} />}

  <button
    type="button"
    onClick={handleToggleLanguage}
    disabled={isUpdatingLanguage}
    className="rounded-md border border-line-steel/40 bg-surface-1/50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-text-secondary transition-all hover:border-cold-cyan/30 hover:text-cold-cyan disabled:cursor-not-allowed disabled:opacity-50"
    title={currentLang === "ko" ? "Switch to English" : "한국어로 전환"}
  >
    {currentLang === "ko" ? "KO / EN" : "KO / EN"}
    <span className="ml-1.5 text-cold-cyan">
      {currentLang === "ko" ? "한" : "EN"}
    </span>
  </button>

  <span className="text-xs text-text-secondary/70">
    {user.email}
  </span>
  {/* ... 기존 로그아웃 버튼 */}
</div>
```

**Step 3: 커밋**

```bash
git add apps/web/src/app/(app)/app-shell.tsx
git commit -m "feat: AppShell 헤더에 KO/EN 언어 토글 버튼"
```

---

### Task 4: Mine 페이지를 profile.language에 연동

**Files:**
- Modify: `apps/web/src/app/(app)/mine/page.tsx`

**Step 1: 하드코딩 제거 + useProfile 사용**

기존:
```tsx
const lang: MineLanguage = "ko";
```

변경:
```tsx
import { useProfile } from "@/hooks/use-profile";

export default function MinePage() {
  const { profile } = useProfile();
  const lang: MineLanguage = (profile?.language ?? "ko") as MineLanguage;
  // ... 기존 코드
}
```

상단의 `const lang` 라인 제거하고, 컴포넌트 내부로 이동.

**Step 2: 커밋**

```bash
git add apps/web/src/app/(app)/mine/page.tsx
git commit -m "feat: Mine 페이지가 profile.language를 따르도록 연동"
```

---

### Task 5: Playwright 검증

**Step 1: 페이지 새로고침 후 토글 클릭 테스트**

```
1. http://localhost:3000/mine 접속
2. 헤더에서 "KO / EN 한" 버튼 확인
3. 버튼 클릭 → "KO / EN EN"으로 변경
4. Mine 페이지의 모든 라벨이 영어로 변경:
   - "광맥 스캔" → "sector scan shell"
   - "채굴하기" → "MINE TARGET"
   - "스캔 메모" → "scan note"
5. 페이지 새로고침 → 영어 유지 (DB 저장됨)
6. 다시 토글 클릭 → 한국어로 복귀
```

**Step 2: 다른 페이지에서도 토글 작동 확인**

Vault, Lab 페이지에서도 헤더 토글이 보이고 클릭 가능한지 확인.
(다국어 적용은 Mine만이지만, 토글 자체는 모든 페이지에서 노출됨)

---

## 구현 순서 요약

| Task | 내용 | 파일 수 |
|------|------|---------|
| 1 | profileApi.updateLanguage() 추가 | 1 |
| 2 | useProfile 훅 신설 | 1 (신규) |
| 3 | AppShell 헤더에 KO/EN 토글 버튼 | 1 |
| 4 | Mine 페이지 profile.language 연동 | 1 |
| 5 | Playwright 검증 | 0 |

## 건드리지 않는 것

- Vault, Lab, Camp 페이지의 다국어화 (Mine만 우선)
- 백엔드 (Supabase RLS로 직접 관리)
- 모바일 앱
- 언어 토글 UI를 캠프 화면 같은 별도 설정 패널로 옮기기 (헤더에 두는 게 빠르고 발견성 높음)

## 향후 확장

- Vault, Lab 페이지에도 동일 패턴(`mine-labels.ts` 같은 라벨 파일)으로 다국어 적용
- 토글 위치를 캠프 화면 설정 시트로 이동 (헤더가 복잡해지면)
