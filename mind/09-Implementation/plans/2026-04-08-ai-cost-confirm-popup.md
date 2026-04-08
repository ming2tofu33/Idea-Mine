---
title: AI Cost Confirm Popup Implementation Plan
tags:
  - implementation
  - web
  - ux
---

# AI 비용 확인 팝업 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 개요서/풀개요서/감정 생성/재생성 시 티어별 남은 횟수를 보여주고 사용자 확인을 받는 팝업 추가.

**Architecture:** 백엔드에 사용량 조회 API 추가, 프론트에 재사용 가능한 `ConfirmCostDialog` 컴포넌트를 만들어 3개 화면(개요서, 풀개요서, 감정)에 적용.

**Tech Stack:** Python FastAPI (백엔드), React + TanStack Query (프론트), Tailwind CSS v4

---

### Task 1: 백엔드 — 사용량 조회 API

**Files:**
- Modify: `backend/app/routers/lab.py`
- Uses: `backend/app/services/rate_limiter.py` (TIER_LIMITS, check_daily_limit_l2)

**Step 1: lab.py에 GET /lab/usage 엔드포인트 추가**

`backend/app/routers/lab.py` 파일 상단 import 아래, 첫 번째 라우터 핸들러 전에 추가:

```python
@router.get("/usage")
async def get_usage(
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """현재 사용자의 일일 사용량 + 티어별 한도 반환."""
    effective_tier = user.get("tier", "free")
    effective_role = user.get("role", "user")

    state = await check_daily_limit_l2(
        supabase, user["id"], effective_tier, "none", role=effective_role
    )

    limits = TIER_LIMITS.get(effective_tier, TIER_LIMITS["free"])

    return {
        "tier": effective_tier,
        "overviews": {
            "used": state.get("overviews_used", 0),
            "limit": limits["overviews"],
        },
        "generations": {
            "used": state.get("generations_used", 0),
            "limit": limits["generations"],
        },
    }
```

주의: `check_daily_limit_l2`에 `action="none"`을 전달하면 한도 체크 없이 state만 반환됨. 현재 코드에서 `action="none"`은 어떤 if 분기에도 안 걸리므로 state만 반환하는 게 맞음.

**Step 2: 커밋**

```bash
git add backend/app/routers/lab.py
git commit -m "feat: GET /lab/usage — 일일 사용량 조회 API"
```

---

### Task 2: 프론트 — API 클라이언트 + 타입

**Files:**
- Modify: `apps/web/src/lib/api.ts`
- Modify: `apps/web/src/types/api.ts`

**Step 1: 타입 추가**

`apps/web/src/types/api.ts`에 추가:

```typescript
export interface UsageInfo {
  tier: string;
  overviews: { used: number; limit: number };
  generations: { used: number; limit: number };
}
```

**Step 2: api.ts labApi에 getUsage 추가**

```typescript
getUsage: () => apiFetch<UsageInfo>("/lab/usage"),
```

**Step 3: 커밋**

```bash
git add apps/web/src/types/api.ts apps/web/src/lib/api.ts
git commit -m "feat: labApi.getUsage() + UsageInfo 타입"
```

---

### Task 3: 프론트 — ConfirmCostDialog 컴포넌트

**Files:**
- Create: `apps/web/src/components/shared/confirm-cost-dialog.tsx`

**Step 1: 컴포넌트 생성**

인라인 확인 UI (모달이 아닌, 버튼 아래에 펼쳐지는 패턴). 기존 삭제 확인과 비슷한 2단계 패턴.

```tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { labApi } from "@/lib/api";
import type { UsageInfo } from "@/types/api";

interface ConfirmCostDialogProps {
  /** "overview" | "generation" | "full_overview" — 표시할 한도 종류 */
  action: "overview" | "generation";
  /** 확인 후 실행할 콜백 */
  onConfirm: () => void;
  /** 로딩 중 여부 (mutation.isPending) */
  isLoading?: boolean;
  /** 버튼 라벨 (기본: "재생성") */
  label?: string;
  /** 확인 메시지 (기본: 자동 생성) */
  message?: string;
  /** 추가 className */
  className?: string;
}

const TIER_LABELS: Record<string, string> = {
  free: "기본 광부",
  lite: "광산주 Lite",
  pro: "광산주 Pro",
};

export function ConfirmCostDialog({
  action,
  onConfirm,
  isLoading = false,
  label = "재생성",
  message,
  className = "",
}: ConfirmCostDialogProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const usageQuery = useQuery({
    queryKey: ["labUsage"],
    queryFn: () => labApi.getUsage(),
    enabled: showConfirm,
    staleTime: 10_000,
  });

  const usage = usageQuery.data;
  const info = usage ? usage[action === "overview" ? "overviews" : "generations"] : null;

  const tierLabel = usage ? (TIER_LABELS[usage.tier] ?? usage.tier) : "";
  const isUnlimited = info && info.limit >= 50;
  const remaining = info ? info.limit - info.used : null;

  const defaultMessage =
    action === "overview"
      ? "이 작업은 AI 크레딧을 사용합니다."
      : "이 작업은 채굴 크레딧을 사용합니다.";

  if (!showConfirm) {
    return (
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={isLoading}
        className={[
          "inline-flex cursor-pointer items-center gap-2 rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-4 py-2 text-sm font-medium text-cold-cyan transition-all duration-200 hover:bg-cold-cyan/20 hover:shadow-[0_0_20px_rgba(92,205,229,0.1)]",
          isLoading && "cursor-not-allowed opacity-50",
          className,
        ].join(" ")}
      >
        {label}
      </button>
    );
  }

  return (
    <div className={["rounded-lg border border-cold-cyan/20 bg-surface-1/80 p-4 backdrop-blur-sm", className].join(" ")}>
      <p className="text-sm text-text-primary">
        {message ?? defaultMessage}
      </p>

      {usageQuery.isLoading ? (
        <p className="mt-2 text-xs text-text-secondary/50">사용량 확인 중...</p>
      ) : info ? (
        <p className="mt-2 text-xs text-text-secondary">
          {tierLabel} ·{" "}
          {isUnlimited ? (
            <span className="text-cold-cyan">무제한</span>
          ) : (
            <>
              오늘 남은 횟수:{" "}
              <span className={remaining && remaining <= 1 ? "text-red-400" : "text-cold-cyan"}>
                {remaining}/{info.limit}
              </span>
            </>
          )}
        </p>
      ) : null}

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          className="cursor-pointer rounded-md px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
        >
          취소
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            setShowConfirm(false);
          }}
          disabled={isLoading || (remaining !== null && remaining <= 0)}
          className="cursor-pointer rounded-md border border-cold-cyan/30 bg-cold-cyan/10 px-4 py-1.5 text-xs font-medium text-cold-cyan transition-all hover:bg-cold-cyan/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "처리 중..." : "확인"}
        </button>
      </div>
    </div>
  );
}
```

**Step 2: 커밋**

```bash
git add apps/web/src/components/shared/confirm-cost-dialog.tsx
git commit -m "feat: ConfirmCostDialog — AI 비용 확인 컴포넌트"
```

---

### Task 4: 개요서 화면에 팝업 적용

**Files:**
- Modify: `apps/web/src/app/(app)/lab/overview/[ideaId]/page.tsx`

**Step 1: 재생성 버튼 교체**

기존 재생성 버튼(약 451-464줄)을 `ConfirmCostDialog`로 교체:

```tsx
import { ConfirmCostDialog } from "@/components/shared/confirm-cost-dialog";
```

기존:
```tsx
<button type="button" onClick={onRegenerate} ...>
  <RefreshCw ... /> 재생성
</button>
```

교체:
```tsx
<ConfirmCostDialog
  action="overview"
  onConfirm={onRegenerate}
  isLoading={isRegenerating}
  label="재생성"
  message="개요서를 재생성하시겠습니까?"
/>
```

**Step 2: 풀 개요 생성 버튼도 교체**

기존 풀 개요 생성 버튼(약 474-488줄):
```tsx
<button type="button" onClick={() => fullOverviewMutation.mutate()} ...>
  풀 개요 생성
</button>
```

교체:
```tsx
<ConfirmCostDialog
  action="overview"
  onConfirm={() => fullOverviewMutation.mutate()}
  isLoading={fullOverviewMutation.isPending}
  label="풀 개요 생성"
  message="풀 개요서를 생성하시겠습니까?"
/>
```

**Step 3: 커밋**

```bash
git add apps/web/src/app/(app)/lab/overview/[ideaId]/page.tsx
git commit -m "feat: 개요서 화면 — 재생성/풀개요 생성 확인 팝업"
```

---

### Task 5: 풀 개요서 화면에 팝업 적용

**Files:**
- Modify: `apps/web/src/app/(app)/lab/full/[overviewId]/page.tsx`

**Step 1: 재생성 버튼 교체**

기존 재생성 버튼(약 751-759줄)을 `ConfirmCostDialog`로 교체:

```tsx
import { ConfirmCostDialog } from "@/components/shared/confirm-cost-dialog";
```

기존:
```tsx
<button type="button" onClick={() => createMutation.mutate()} ...>
  <RefreshCw ... /> 재생성
</button>
```

교체:
```tsx
<ConfirmCostDialog
  action="overview"
  onConfirm={() => createMutation.mutate()}
  isLoading={createMutation.isPending}
  label="재생성"
  message="풀 개요서를 재생성하시겠습니까?"
/>
```

**Step 2: 첫 생성 버튼도 교체**

기존 첫 생성 버튼(약 811-813줄):
```tsx
<button type="button" onClick={() => createMutation.mutate()} ...>
  풀 개요 생성
</button>
```

교체:
```tsx
<ConfirmCostDialog
  action="overview"
  onConfirm={() => createMutation.mutate()}
  isLoading={createMutation.isPending}
  label="풀 개요 생성"
  message="풀 개요서를 생성하시겠습니까?"
/>
```

**Step 3: 커밋**

```bash
git add apps/web/src/app/(app)/lab/full/[overviewId]/page.tsx
git commit -m "feat: 풀 개요서 화면 — 생성/재생성 확인 팝업"
```

---

### Task 6: 감정 화면에 팝업 적용

**Files:**
- Modify: `apps/web/src/app/(app)/lab/appraisal/[overviewId]/page.tsx`

**Step 1: 감정 생성/재생성 버튼 교체**

감정 화면에는 createMutation.mutate() 호출이 3곳(275, 295, 310줄):
- 에러 후 "다시 시도" 버튼
- 기존 감정 있을 때 "재생성" 버튼
- 첫 생성 버튼

모두 `ConfirmCostDialog`로 교체:

```tsx
import { ConfirmCostDialog } from "@/components/shared/confirm-cost-dialog";
```

각 버튼을:
```tsx
<ConfirmCostDialog
  action="overview"
  onConfirm={() => createMutation.mutate()}
  isLoading={createMutation.isPending}
  label="감정 요청"
  message="감정을 요청하시겠습니까?"
/>
```

**Step 2: 커밋**

```bash
git add apps/web/src/app/(app)/lab/appraisal/[overviewId]/page.tsx
git commit -m "feat: 감정 화면 — 생성/재생성 확인 팝업"
```

---

## 구현 순서 요약

| Task | 내용 | 파일 수 |
|------|------|---------|
| 1 | 백엔드 사용량 API | 1 |
| 2 | 프론트 타입 + API 클라이언트 | 2 |
| 3 | ConfirmCostDialog 컴포넌트 | 1 (신규) |
| 4 | 개요서 화면 적용 | 1 |
| 5 | 풀 개요서 화면 적용 | 1 |
| 6 | 감정 화면 적용 | 1 |

## 건드리지 않는 것

- 모바일 앱 (apps/mobile) — 웹만 대상
- 백엔드 rate_limiter 로직 변경 — 기존 그대로 사용
- 티어 업그레이드 유도 UI — 나중에 별도 구현
