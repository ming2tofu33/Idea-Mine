# S0-AUTH-01: Supabase Auth (Web) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Next.js 웹 앱에서 Supabase Auth로 로그인/회원가입/세션 관리가 동작하게 만든다.

**Architecture:** `@supabase/ssr`로 쿠키 기반 세션을 관리한다. 서버 컴포넌트와 클라이언트 컴포넌트 양쪽에서 Supabase 클라이언트를 사용할 수 있어야 한다. Next.js middleware에서 매 요청마다 세션을 갱신하고, 미인증 사용자는 로그인 페이지로 리다이렉트한다.

**Tech Stack:** Next.js 16 (App Router), @supabase/supabase-js, @supabase/ssr, TypeScript

---

## 기존 자산

- Supabase 프로젝트: 이미 구성됨 (us-east-1)
- OAuth providers: Google + GitHub (v1에서 설정 완료)
- DB: profiles 테이블 + handle_new_user 트리거 (가입 시 자동 프로필 생성)
- 환경변수: 루트 `.env`에 `SUPABASE_URL`, `SUPABASE_ANON_KEY` 등 존재

## 라우트 구조 (이 플랜에서 만드는 것)

```
src/app/
├── layout.tsx              -- 루트 레이아웃 (수정)
├── page.tsx                -- 랜딩 (수정)
├── auth/
│   ├── sign-in/
│   │   └── page.tsx        -- 로그인 페이지
│   └── callback/
│       └── route.ts        -- OAuth 콜백 핸들러
├── (app)/
│   ├── layout.tsx          -- 인증 필요 레이아웃
│   ├── mine/
│   │   └── page.tsx        -- 빈 Mine 페이지 (placeholder)
│   ├── vault/
│   │   └── page.tsx        -- 빈 Vault 페이지 (placeholder)
│   └── lab/
│       └── page.tsx        -- 빈 Lab 페이지 (placeholder)
```

---

### Task 1: 패키지 설치

**Step 1: Supabase 패키지 설치**

Run:
```bash
cd apps/web && npm install @supabase/supabase-js @supabase/ssr
```

**Step 2: 환경변수 파일 생성**

Create: `apps/web/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=<루트 .env에서 복사>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<루트 .env에서 복사>
```

> 루트 `.env` 파일에서 SUPABASE_URL과 SUPABASE_ANON_KEY 값을 복사한다.
> `NEXT_PUBLIC_` 접두사가 있어야 브라우저에서도 접근 가능.

**Step 3: .gitignore 확인**

`.env.local`이 `.gitignore`에 포함되어 있는지 확인한다. create-next-app이 이미 추가했을 것.

Run:
```bash
grep ".env.local" apps/web/.gitignore
```
Expected: `.env*.local` 또는 `.env.local`이 포함됨

**Step 4: Commit**

```bash
git add apps/web/package.json apps/web/package-lock.json
git commit -m "chore: add @supabase/supabase-js and @supabase/ssr"
```

---

### Task 2: Supabase 클라이언트 유틸리티

**Files:**
- Create: `apps/web/src/lib/supabase/client.ts` — 브라우저용
- Create: `apps/web/src/lib/supabase/server.ts` — 서버 컴포넌트/라우트 핸들러용
- Create: `apps/web/src/lib/supabase/middleware.ts` — 미들웨어용

**Step 1: 브라우저 클라이언트 작성**

Create: `apps/web/src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

**Step 2: 서버 클라이언트 작성**

Create: `apps/web/src/lib/supabase/server.ts`

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component에서 호출 시 set은 무시됨 (정상)
          }
        },
      },
    },
  );
}
```

**Step 3: 미들웨어 클라이언트 작성**

Create: `apps/web/src/lib/supabase/middleware.ts`

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 미인증 사용자가 보호 라우트에 접근 시 로그인으로 리다이렉트
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    request.nextUrl.pathname !== "/"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

**Step 4: Commit**

```bash
git add apps/web/src/lib/supabase/
git commit -m "feat: supabase client utilities (browser, server, middleware)"
```

---

### Task 3: Next.js Middleware 연결

**Files:**
- Create: `apps/web/src/middleware.ts`

**Step 1: 미들웨어 작성**

Create: `apps/web/src/middleware.ts`

```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // 정적 파일과 이미지 경로를 제외한 모든 경로에 적용
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Step 2: 브라우저에서 확인**

Run: `cd apps/web && npm run dev`

`http://localhost:3000` 접속 → 랜딩 페이지 정상 표시 (리다이렉트 안 됨)
`http://localhost:3000/mine` 접속 → `/auth/sign-in`으로 리다이렉트 (아직 404이지만 URL 변경 확인)

**Step 3: Commit**

```bash
git add apps/web/src/middleware.ts
git commit -m "feat: next.js middleware for session refresh and route protection"
```

---

### Task 4: OAuth 콜백 라우트 핸들러

**Files:**
- Create: `apps/web/src/app/auth/callback/route.ts`

**Step 1: 콜백 핸들러 작성**

OAuth 로그인 후 Supabase가 `?code=...`와 함께 이 URL로 리다이렉트한다.
코드를 세션 토큰으로 교환한 뒤 앱으로 보내는 역할.

Create: `apps/web/src/app/auth/callback/route.ts`

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/mine";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 에러 시 로그인 페이지로
  return NextResponse.redirect(`${origin}/auth/sign-in?error=auth_failed`);
}
```

**Step 2: Commit**

```bash
git add apps/web/src/app/auth/callback/route.ts
git commit -m "feat: oauth callback route handler"
```

---

### Task 5: 로그인 페이지

**Files:**
- Create: `apps/web/src/app/auth/sign-in/page.tsx`

**Step 1: 로그인 페이지 작성**

Create: `apps/web/src/app/auth/sign-in/page.tsx`

```tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);

  async function signInWithOAuth(provider: "google" | "github") {
    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Auth error:", error.message);
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          IDEA MINE
        </h1>
        <p className="text-sm text-text-secondary">
          AI-powered idea exploration platform
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <button
          onClick={() => signInWithOAuth("google")}
          disabled={isLoading}
          className="flex h-12 items-center justify-center gap-2 rounded-lg border border-line-steel bg-surface-1 text-sm text-text-primary transition-colors hover:border-signal-pink/40 hover:bg-surface-2 disabled:opacity-50"
        >
          Google로 시작하기
        </button>

        <button
          onClick={() => signInWithOAuth("github")}
          disabled={isLoading}
          className="flex h-12 items-center justify-center gap-2 rounded-lg border border-line-steel bg-surface-1 text-sm text-text-primary transition-colors hover:border-signal-pink/40 hover:bg-surface-2 disabled:opacity-50"
        >
          GitHub로 시작하기
        </button>
      </div>

      {isLoading && (
        <p className="text-xs text-text-secondary">연결하는 중...</p>
      )}
    </div>
  );
}
```

**Step 2: 브라우저에서 확인**

Run: `cd apps/web && npm run dev`

`http://localhost:3000/auth/sign-in` 접속
→ 두 개 버튼(Google, GitHub) 보임
→ 클릭 시 Supabase OAuth 페이지로 이동

**Step 3: Commit**

```bash
git add apps/web/src/app/auth/sign-in/
git commit -m "feat: sign-in page with google and github oauth"
```

---

### Task 6: 인증 필요 레이아웃 + Placeholder 페이지

**Files:**
- Create: `apps/web/src/app/(app)/layout.tsx`
- Create: `apps/web/src/app/(app)/mine/page.tsx`
- Create: `apps/web/src/app/(app)/vault/page.tsx`
- Create: `apps/web/src/app/(app)/lab/page.tsx`

**Step 1: (app) 레이아웃 작성**

서버 컴포넌트에서 세션을 확인하고, 사용자 정보를 표시하는 최소 레이아웃.

Create: `apps/web/src/app/(app)/layout.tsx`

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "./app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return <AppShell user={user}>{children}</AppShell>;
}
```

**Step 2: AppShell 클라이언트 컴포넌트 작성**

Create: `apps/web/src/app/(app)/app-shell.tsx`

```tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV_ITEMS = [
  { href: "/mine", label: "Mine" },
  { href: "/vault", label: "Vault" },
  { href: "/lab", label: "Lab" },
] as const;

export function AppShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* 상단 네비게이션 */}
      <header className="flex items-center justify-between border-b border-line-steel bg-bg-base px-6 py-3">
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-md px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-surface-2 text-signal-pink"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <span className="text-xs text-text-secondary">
            {user.email}
          </span>
          <button
            onClick={handleSignOut}
            className="text-xs text-text-secondary hover:text-text-primary"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
```

**Step 3: Placeholder 페이지 3개 작성**

Create: `apps/web/src/app/(app)/mine/page.tsx`

```tsx
export default function MinePage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary">The Mine</h2>
        <p className="mt-2 text-sm text-text-secondary">
          광맥을 탐사하고 아이디어를 채굴하는 공간
        </p>
      </div>
    </div>
  );
}
```

Create: `apps/web/src/app/(app)/vault/page.tsx`

```tsx
export default function VaultPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary">The Vault</h2>
        <p className="mt-2 text-sm text-text-secondary">
          아이디어 자산을 보관하고 다시 꺼내보는 공간
        </p>
      </div>
    </div>
  );
}
```

Create: `apps/web/src/app/(app)/lab/page.tsx`

```tsx
export default function LabPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary">The Lab</h2>
        <p className="mt-2 text-sm text-text-secondary">
          선택한 아이디어를 정제하고 확장하는 공간
        </p>
      </div>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add apps/web/src/app/(app)/
git commit -m "feat: app shell with nav, protected layout, placeholder pages"
```

---

### Task 7: 랜딩 페이지에 로그인 유도 추가

**Files:**
- Modify: `apps/web/src/app/page.tsx`

**Step 1: 랜딩 페이지에 세션 상태 분기 추가**

Modify: `apps/web/src/app/page.tsx`

```tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-text-primary">
          IDEA MINE
        </h1>
        <p className="max-w-md text-lg text-text-secondary">
          AI-powered idea exploration platform
        </p>
      </div>

      {user ? (
        <Link
          href="/mine"
          className="rounded-lg border border-signal-pink/30 bg-surface-2 px-8 py-3 text-sm text-signal-pink transition-colors hover:border-signal-pink/60"
        >
          광산으로 들어가기
        </Link>
      ) : (
        <Link
          href="/auth/sign-in"
          className="rounded-lg border border-signal-pink/30 bg-surface-2 px-8 py-3 text-sm text-signal-pink transition-colors hover:border-signal-pink/60"
        >
          시작하기
        </Link>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/web/src/app/page.tsx
git commit -m "feat: landing page with auth-aware CTA"
```

---

### Task 8: End-to-End 검증

**Step 1: 빌드 확인**

Run:
```bash
cd apps/web && npm run build
```
Expected: 빌드 성공, 타입 에러 없음

**Step 2: 전체 흐름 수동 테스트**

Run: `cd apps/web && npm run dev`

1. `http://localhost:3000` → 랜딩 페이지, "시작하기" 버튼 보임
2. "시작하기" 클릭 → `/auth/sign-in` 이동
3. "Google로 시작하기" 또는 "GitHub로 시작하기" 클릭 → OAuth 흐름
4. 로그인 성공 → `/mine` 리다이렉트
5. 상단 네비게이션에 이메일 + 로그아웃 버튼 보임
6. Mine / Vault / Lab 탭 전환 동작
7. "로그아웃" 클릭 → `/` 랜딩으로 복귀
8. `/mine` 직접 접근 → `/auth/sign-in` 리다이렉트

> **주의:** OAuth가 동작하려면 Supabase Dashboard에서 Google/GitHub provider가 활성화되어 있어야 한다.
> 로컬에서 OAuth 테스트 시 redirect URL에 `http://localhost:3000/auth/callback`이 등록되어 있어야 한다.

**Step 3: 최종 Commit**

이 시점에서 모든 태스크가 동작하면 최종 정리 커밋은 불필요.
빌드 실패나 린트 에러가 있으면 수정 후 커밋.

---

## 완료 기준

- [ ] `npm run build` 성공
- [ ] 미인증 상태에서 `/mine`, `/vault`, `/lab` 접근 → `/auth/sign-in` 리다이렉트
- [ ] OAuth 로그인 → `/mine` 자동 이동
- [ ] 로그아웃 → `/` 복귀
- [ ] 네비게이션 탭 전환 동작
- [ ] 현재 활성 탭 하이라이트 (Signal Pink)

## 다음 태스크

이 플랜이 끝나면 `S0-API-01` (백엔드 API 클라이언트 + React Query)로 넘어간다.
