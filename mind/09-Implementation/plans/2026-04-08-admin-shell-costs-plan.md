# 어드민 셸 + 비용 대시보드 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 어드민 전용 레이아웃(사이드바)과 AI 비용 대시보드 페이지를 구축한다.

**Architecture:** Next.js `(admin)` 라우트 그룹으로 앱과 분리. 백엔드 `/admin/costs/summary` 엔드포인트가 `ai_usage_logs`를 집계해서 반환. 프론트에서 Recharts로 시각화.

**Tech Stack:** Next.js App Router, React Query, Recharts, FastAPI, Supabase (service_role)

---

## Task 1: 백엔드 — 비용 요약 API 엔드포인트

**Files:**
- Modify: `backend/app/routers/admin.py`

**Step 1: 엔드포인트 구현**

`backend/app/routers/admin.py` 파일 끝에 추가:

```python
from datetime import date, timedelta

@router.get("/costs/summary")
async def get_costs_summary(
    days: int = 7,
    user: dict = Depends(require_admin),
    supabase: Client = Depends(get_supabase),
):
    """AI 비용 요약 (최근 N일). 어드민 전용."""
    if days < 1 or days > 90:
        raise HTTPException(status_code=400, detail="days must be 1-90")

    since = (date.today() - timedelta(days=days - 1)).isoformat()

    # 기능별 집계
    by_feature_res = supabase.table("ai_usage_logs") \
        .select("feature_type, total_cost_usd, id") \
        .gte("created_at", since) \
        .execute()

    by_feature: dict[str, dict] = {}
    for row in by_feature_res.data:
        ft = row["feature_type"]
        if ft not in by_feature:
            by_feature[ft] = {"feature_type": ft, "cost": 0.0, "calls": 0}
        by_feature[ft]["cost"] += float(row["total_cost_usd"] or 0)
        by_feature[ft]["calls"] += 1

    # 일별 집계
    by_date: dict[str, dict] = {}
    for row in by_feature_res.data:
        d = row.get("created_at", "")[:10]  # YYYY-MM-DD
        if d not in by_date:
            by_date[d] = {"date": d, "cost": 0.0, "calls": 0}
        by_date[d]["cost"] += float(row["total_cost_usd"] or 0)
        by_date[d]["calls"] += 1

    # 일별 + 기능별 집계 (차트용)
    by_date_feature: dict[str, dict] = {}
    for row in by_feature_res.data:
        d = row.get("created_at", "")[:10]
        if d not in by_date_feature:
            by_date_feature[d] = {"date": d}
        ft = row["feature_type"]
        by_date_feature[d][ft] = by_date_feature[d].get(ft, 0.0) + float(row["total_cost_usd"] or 0)

    # 최근 로그 50건
    recent_res = supabase.table("ai_usage_logs") \
        .select("id, feature_type, model, input_tokens, output_tokens, total_cost_usd, status, created_at") \
        .order("created_at", desc=True) \
        .limit(50) \
        .execute()

    total_cost = sum(float(r["total_cost_usd"] or 0) for r in by_feature_res.data)
    total_calls = len(by_feature_res.data)

    return {
        "total_cost_usd": round(total_cost, 6),
        "total_calls": total_calls,
        "avg_cost_per_call": round(total_cost / total_calls, 6) if total_calls > 0 else 0,
        "by_feature": sorted(by_feature.values(), key=lambda x: x["cost"], reverse=True),
        "by_date": sorted(by_date.values(), key=lambda x: x["date"]),
        "by_date_feature": sorted(by_date_feature.values(), key=lambda x: x["date"]),
        "recent_logs": recent_res.data,
    }
```

**Step 2: 백엔드 동작 확인**

Run: `cd backend && python -c "from app.routers.admin import router; print('OK')"`
Expected: OK (import 성공)

**Step 3: 커밋**

```bash
git add backend/app/routers/admin.py
git commit -m "feat: 어드민 비용 요약 API 엔드포인트 추가"
```

---

## Task 2: 프론트엔드 — Recharts 설치 + API 타입/클라이언트

**Files:**
- Modify: `apps/web/package.json` (npm install)
- Modify: `apps/web/src/types/api.ts`
- Modify: `apps/web/src/lib/api.ts`

**Step 1: Recharts 설치**

Run: `cd apps/web && npm install recharts`

**Step 2: API 타입 추가**

`apps/web/src/types/api.ts` 파일 끝에 추가:

```typescript
// --- Admin Cost Summary ---

export interface CostByFeature {
  feature_type: string;
  cost: number;
  calls: number;
}

export interface CostByDate {
  date: string;
  cost: number;
  calls: number;
}

export interface CostByDateFeature {
  date: string;
  mining?: number;
  overview?: number;
  appraisal?: number;
  full_overview?: number;
  [key: string]: string | number | undefined;
}

export interface CostLogEntry {
  id: string;
  feature_type: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_cost_usd: number;
  status: string;
  created_at: string;
}

export interface CostSummaryResponse {
  total_cost_usd: number;
  total_calls: number;
  avg_cost_per_call: number;
  by_feature: CostByFeature[];
  by_date: CostByDate[];
  by_date_feature: CostByDateFeature[];
  recent_logs: CostLogEntry[];
}
```

**Step 3: API 클라이언트에 비용 요약 추가**

`apps/web/src/lib/api.ts`의 `adminApi` 객체에 추가:

```typescript
// 기존 adminApi에 추가
getCostsSummary: (days: number = 7) =>
  apiFetch<CostSummaryResponse>(`/admin/costs/summary?days=${days}`),
```

`CostSummaryResponse` import도 상단에 추가.

**Step 4: 커밋**

```bash
git add apps/web/package.json apps/web/package-lock.json apps/web/src/types/api.ts apps/web/src/lib/api.ts
git commit -m "feat: Recharts 설치 + 어드민 비용 API 타입/클라이언트"
```

---

## Task 3: 어드민 레이아웃 — `(admin)` 라우트 그룹 + 사이드바

**Files:**
- Create: `apps/web/src/app/(admin)/layout.tsx`
- Create: `apps/web/src/app/(admin)/admin/layout.tsx`
- Create: `apps/web/src/components/admin/admin-sidebar.tsx`

**Step 1: 어드민 사이드바 컴포넌트**

`apps/web/src/components/admin/admin-sidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, DollarSign, ArrowLeft, Wrench } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "대시보드", icon: BarChart3 },
  { href: "/admin/costs", label: "비용", icon: DollarSign },
] as const;

const FUTURE_ITEMS = [
  { label: "사용자", note: "S2" },
  { label: "퍼널", note: "S2" },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col border-r border-white/[0.06] bg-bg-deep/80 backdrop-blur-xl">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-4 py-4">
        <h1 className="text-sm font-semibold tracking-wide text-amber-400">
          ⛏ IDEA MINE Admin
        </h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3">
        <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-text-secondary/50">
          메뉴
        </div>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150 ${
                isActive
                  ? "bg-amber-400/10 text-amber-400"
                  : "text-text-secondary hover:bg-surface-1/50 hover:text-text-primary"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}

        {/* Future items */}
        <div className="mb-1 mt-4 px-2 text-[10px] font-semibold uppercase tracking-wider text-text-secondary/30">
          예정
        </div>
        {FUTURE_ITEMS.map(({ label, note }) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-text-secondary/30"
          >
            <span>{label}</span>
            <span className="rounded bg-surface-1/30 px-1.5 py-0.5 text-[10px]">{note}</span>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] px-2 py-3">
        <Link
          href="/mine"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary transition-all hover:bg-surface-1/50 hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          앱으로 돌아가기
        </Link>
      </div>
    </aside>
  );
}
```

**Step 2: `(admin)` 루트 레이아웃**

`apps/web/src/app/(admin)/layout.tsx`:

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QueryProvider } from "@/lib/query-provider";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/mine");
  }

  return <QueryProvider>{children}</QueryProvider>;
}
```

**Step 3: 어드민 내부 레이아웃 (사이드바)**

`apps/web/src/app/(admin)/admin/layout.tsx`:

```tsx
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-bg-deep">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
```

**Step 4: 커밋**

```bash
git add apps/web/src/components/admin/admin-sidebar.tsx apps/web/src/app/(admin)/
git commit -m "feat: 어드민 셸 레이아웃 + 사이드바 (role 체크 포함)"
```

---

## Task 4: 어드민 대시보드 + 비용 페이지

**Files:**
- Create: `apps/web/src/app/(admin)/admin/page.tsx`
- Create: `apps/web/src/app/(admin)/admin/costs/page.tsx`

**Step 1: 대시보드 페이지 (비용으로 리다이렉트)**

`apps/web/src/app/(admin)/admin/page.tsx`:

```tsx
import { redirect } from "next/navigation";

export default function AdminDashboardPage() {
  redirect("/admin/costs");
}
```

**Step 2: 비용 페이지**

`apps/web/src/app/(admin)/admin/costs/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { CostSummaryResponse } from "@/types/api";

// --- Feature 색상 매핑 ---
const FEATURE_COLORS: Record<string, string> = {
  mining: "#5ccde5",      // cold-cyan
  overview: "#ff3b93",    // signal-pink
  appraisal: "#f59e0b",   // amber
  full_overview: "#a855f7", // purple
};

const FEATURE_LABELS: Record<string, string> = {
  mining: "채굴",
  overview: "개요서",
  appraisal: "감정서",
  full_overview: "풀 개요서",
};

// --- 기간 선택 ---
const PERIOD_OPTIONS = [
  { days: 7, label: "7일" },
  { days: 14, label: "14일" },
  { days: 30, label: "30일" },
] as const;

export default function AdminCostsPage() {
  const [days, setDays] = useState(7);

  const { data, isLoading, error } = useQuery<CostSummaryResponse>({
    queryKey: ["admin", "costs", days],
    queryFn: () => adminApi.getCostsSummary(days),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-text-secondary">
        로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center text-red-400">
        비용 데이터를 불러올 수 없습니다
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-text-primary">AI 비용</h1>
        <div className="flex gap-1">
          {PERIOD_OPTIONS.map(({ days: d, label }) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-md px-3 py-1 text-xs transition-all ${
                days === d
                  ? "bg-amber-400/15 text-amber-400 border border-amber-400/30"
                  : "text-text-secondary hover:text-text-primary border border-transparent"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard
          label="총 비용"
          value={`$${data.total_cost_usd.toFixed(4)}`}
          sub={`최근 ${days}일`}
        />
        <SummaryCard
          label="총 호출"
          value={data.total_calls.toLocaleString()}
          sub="API 요청 수"
        />
        <SummaryCard
          label="평균 비용/호출"
          value={`$${data.avg_cost_per_call.toFixed(5)}`}
          sub="호출당 평균"
        />
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-white/[0.06] bg-surface-1/30 p-4 backdrop-blur-sm">
        <h2 className="mb-4 text-sm font-medium text-text-secondary">일별 비용 추이</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.by_date_feature}>
            <XAxis
              dataKey="date"
              tickFormatter={(v) => v.slice(5)} // MM-DD
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `$${v}`}
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(10,12,20,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelFormatter={(v) => `${v}`}
              formatter={(value: number, name: string) => [
                `$${value.toFixed(5)}`,
                FEATURE_LABELS[name] || name,
              ]}
            />
            <Legend
              formatter={(value: string) => FEATURE_LABELS[value] || value}
              wrapperStyle={{ fontSize: "11px" }}
            />
            {Object.keys(FEATURE_COLORS).map((key) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="cost"
                fill={FEATURE_COLORS[key]}
                radius={key === "full_overview" ? [2, 2, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Feature Breakdown */}
      <div className="rounded-xl border border-white/[0.06] bg-surface-1/30 p-4 backdrop-blur-sm">
        <h2 className="mb-3 text-sm font-medium text-text-secondary">기능별 비용</h2>
        <div className="space-y-2">
          {data.by_feature.map((f) => (
            <div key={f.feature_type} className="flex items-center justify-between rounded-lg bg-surface-1/20 px-3 py-2">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: FEATURE_COLORS[f.feature_type] || "#888" }}
                />
                <span className="text-sm text-text-primary">
                  {FEATURE_LABELS[f.feature_type] || f.feature_type}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-text-secondary">{f.calls}회</span>
                <span className="text-sm font-medium text-text-primary">${f.cost.toFixed(5)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Logs Table */}
      <div className="rounded-xl border border-white/[0.06] bg-surface-1/30 p-4 backdrop-blur-sm">
        <h2 className="mb-3 text-sm font-medium text-text-secondary">최근 호출 로그</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-text-secondary/50">
                <th className="pb-2 pr-4">시간</th>
                <th className="pb-2 pr-4">기능</th>
                <th className="pb-2 pr-4">모델</th>
                <th className="pb-2 pr-4 text-right">입력</th>
                <th className="pb-2 pr-4 text-right">출력</th>
                <th className="pb-2 pr-4 text-right">비용</th>
                <th className="pb-2">상태</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_logs.map((log) => (
                <tr key={log.id} className="border-b border-white/[0.04] text-text-secondary">
                  <td className="py-2 pr-4 text-xs">
                    {new Date(log.created_at).toLocaleString("ko-KR", {
                      month: "numeric", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="py-2 pr-4">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: FEATURE_COLORS[log.feature_type] || "#888" }}
                      />
                      {FEATURE_LABELS[log.feature_type] || log.feature_type}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-xs font-mono">{log.model}</td>
                  <td className="py-2 pr-4 text-right text-xs font-mono">{log.input_tokens.toLocaleString()}</td>
                  <td className="py-2 pr-4 text-right text-xs font-mono">{log.output_tokens.toLocaleString()}</td>
                  <td className="py-2 pr-4 text-right text-xs font-mono">${log.total_cost_usd.toFixed(5)}</td>
                  <td className="py-2">
                    <StatusBadge status={log.status} />
                  </td>
                </tr>
              ))}
              {data.recent_logs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-secondary/50">
                    아직 로그가 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function SummaryCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-surface-1/30 p-4 backdrop-blur-sm">
      <div className="text-[11px] font-medium uppercase tracking-wider text-text-secondary/50">{label}</div>
      <div className="mt-1 text-xl font-semibold text-text-primary">{value}</div>
      <div className="mt-0.5 text-[11px] text-text-secondary/40">{sub}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    success: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    error: "bg-red-400/10 text-red-400 border-red-400/20",
    filtered: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  };
  const s = styles[status as keyof typeof styles] || styles.success;
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] ${s}`}>
      {status}
    </span>
  );
}
```

**Step 3: 커밋**

```bash
git add apps/web/src/app/(admin)/
git commit -m "feat: 어드민 대시보드 + 비용 페이지 (Recharts 차트 + 로그 테이블)"
```

---

## Task 5: 앱 셸에서 어드민 링크 추가

**Files:**
- Modify: `apps/web/src/app/(app)/app-shell.tsx`

**Step 1: 어드민 링크 추가**

헤더의 로그아웃 버튼 왼쪽에 어드민 링크 추가 (admin role일 때만):

```tsx
// profile?.role === "admin" 일 때 로그아웃 버튼 왼쪽에
<Link
  href="/admin"
  className="rounded-md border border-amber-400/20 px-3 py-1 text-xs text-amber-400 transition-all hover:border-amber-400/40 hover:bg-amber-400/5"
>
  Admin
</Link>
```

**Step 2: 커밋**

```bash
git add apps/web/src/app/(app)/app-shell.tsx
git commit -m "feat: 앱 헤더에 어드민 링크 추가 (admin role only)"
```

---

## Task 6: 동작 확인

**Step 1: 백엔드 서버 실행 확인**

Run: `cd backend && uvicorn app.main:app --reload`
확인: `GET /admin/costs/summary?days=7`에 200 응답

**Step 2: 프론트엔드 빌드 확인**

Run: `cd apps/web && npm run build`
Expected: 빌드 성공 (에러 없음)

**Step 3: 브라우저 확인**

- `/admin` 접속 → `/admin/costs`로 리다이렉트
- 비용 요약 카드 3개 표시
- 일별 차트 표시 (데이터 없으면 빈 차트)
- 로그 테이블 표시
- 비-admin 유저 → `/mine`으로 리다이렉트

**Step 4: 최종 커밋 (필요 시)**

빌드 중 발견된 이슈 수정 후 커밋.
