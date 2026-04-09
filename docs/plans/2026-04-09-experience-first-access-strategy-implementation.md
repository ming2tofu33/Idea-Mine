# Experience-First Access Strategy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 비로그인 사용자도 IDEA MINE의 핵심 가치를 즉시 체험할 수 있도록 공개 체험면, 제한된 demo flow, soft gate, 로그인 복귀 흐름을 구현한다.

**Architecture:** 기존 보호된 `/(app)` 제품 영역은 유지하고, 새로운 공개 체험면을 별도 퍼블릭 라우트로 추가한다. 비로그인 사용자는 curated demo veins와 demo ideas를 통해 핵심 경험을 먼저 체험하고, 저장/전체 결과/outline/반복 reroll 같은 가치가 큰 액션에서 로그인 또는 유료 전환으로 handoff한다. 실시간 사용자별 Mine 로직은 계속 인증 사용자 전용으로 유지해 비용과 남용 리스크를 제어한다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Supabase Auth, existing `apps/web` observatory component system, Supabase SQL migrations for lightweight instrumentation

---

## Ground Rules

- 이번 작업의 핵심은 `auth-first`를 바로 뜯는 것이 아니라, 기존 보호된 앱을 보존하면서 공개 체험면을 추가하는 것이다.
- 보호된 실제 제품 경로는 그대로 유지한다.
  - `/mine`, `/mine/[veinId]`, `/vault`, `/lab` 는 인증 사용자 흐름으로 남긴다.
- 새로운 공개 체험면은 별도 퍼블릭 경로에 둔다.
  - 기본 추천 경로는 `/experience` 와 `/experience/[veinId]`
- 비로그인 체험 데이터는 실시간 사용자 데이터가 아니라 curated demo data를 사용한다.
- soft gate는 로그인 전환 포인트를 명확히 보여주되, 제품 카피와 디자인 톤은 현재 observatory 시스템을 유지한다.
- `apps/web`에는 현재 자동 테스트 하네스가 없으므로, 이번 계획의 기본 검증은 `npm run lint`, `npm run build`, 그리고 브라우저 smoke QA다.
- 최소 측정은 반드시 포함한다. 공개 체험이 실제로 activation을 올리는지 보지 못하면 전략 전환의 성공 여부를 판단할 수 없다.

## Acceptance Criteria

- 비로그인 사용자도 랜딩에서 공개 체험면으로 진입할 수 있다.
- 공개 체험면에서 광맥 3개를 보고, 하나를 선택하고, 샘플 아이디어 3개를 볼 수 있다.
- 비로그인 사용자는 저장, 전체 결과, outline, 반복 reroll 같은 고가치 액션에서 soft gate를 본다.
- soft gate CTA는 로그인 이후 적절한 복귀 경로를 유지한다.
- 로그인 이후에는 기존 보호된 real Mine 흐름으로 자연스럽게 이어진다.
- 기존 인증 사용자용 `/mine`, `/vault`, `/lab` 동작은 깨지지 않는다.
- 최소 계측으로 아래 이벤트를 기록할 수 있다.
  - 공개 체험 진입
  - 공개 광맥 선택
  - 공개 결과 도달
  - soft gate 노출
  - soft gate CTA 클릭

## Recommended Route Structure

- Public:
  - `apps/web/src/app/experience/page.tsx`
  - `apps/web/src/app/experience/[veinId]/page.tsx`
- Authenticated:
  - `apps/web/src/app/(app)/mine/page.tsx`
  - `apps/web/src/app/(app)/mine/[veinId]/page.tsx`
  - existing vault/lab routes unchanged

이 구조를 쓰는 이유:

- 현재 `apps/web/src/app/(app)/layout.tsx` 가 인증 사용자를 전제로 한다.
- `apps/web/src/proxy.ts` 와 `apps/web/src/lib/supabase/middleware.ts` 도 `/` 이외 경로를 비로그인 시 sign-in으로 리다이렉트한다.
- 따라서 `/mine` 자체를 당장 퍼블릭으로 풀기보다, 별도 퍼블릭 체험 경로를 두는 편이 구현 리스크가 낮다.

## Task 1: Add Public Experience Data Layer

**Files:**
- Create: `apps/web/src/lib/experience-data.ts`
- Create: `apps/web/src/types/experience.ts`
- Reference: `apps/web/src/lib/mock-data.ts`
- Reference: `apps/web/src/types/api.ts`

**Step 1: Define demo-specific types**

Create `apps/web/src/types/experience.ts`:

```ts
export type ExperienceVein = {
  id: string;
  slug: string;
  codename: string;
  rarity: "common" | "rare" | "golden";
  keywords: Array<{
    category: "ai" | "who" | "domain" | "tech" | "value" | "money";
    ko: string;
    en: string;
  }>;
  previewLineKo: string;
  previewLineEn: string;
};

export type ExperienceIdea = {
  id: string;
  titleKo: string;
  titleEn: string;
  summaryKo: string;
  summaryEn: string;
  signalLineKo: string;
  signalLineEn: string;
};
```

**Step 2: Create deterministic demo data**

Create `apps/web/src/lib/experience-data.ts` with:

- exactly 3 demo veins
- each vein mapped to exactly 3 demo ideas
- helper functions:

```ts
export function getExperienceVeins(): ExperienceVein[]
export function getExperienceVeinById(id: string): ExperienceVein | null
export function getExperienceIdeasByVeinId(id: string): ExperienceIdea[]
```

Rules:

- data must be deterministic, not random
- copy must feel product-real, not lorem ipsum
- use the strongest, most understandable examples

**Step 3: Verify type correctness**

Run:

```bash
cd apps/web
npx tsc --noEmit -p tsconfig.json
```

Expected: types compile without importing backend-only shapes.

**Step 4: Commit**

```bash
git add apps/web/src/types/experience.ts apps/web/src/lib/experience-data.ts
git commit -m "feat(web): add curated public experience data"
```

## Task 2: Create Public Experience Routes

**Files:**
- Create: `apps/web/src/app/experience/page.tsx`
- Create: `apps/web/src/app/experience/[veinId]/page.tsx`
- Create: `apps/web/src/components/experience/experience-entry.tsx`
- Create: `apps/web/src/components/experience/experience-result.tsx`
- Create: `apps/web/src/components/experience/soft-gate-panel.tsx`
- Reference: `apps/web/src/components/mine/sector-scan-stage.tsx`
- Reference: `apps/web/src/components/mine/selected-vein-panel.tsx`
- Reference: `apps/web/src/components/mine/idea-card.tsx`

**Step 1: Build the public entry screen**

Create `experience-entry.tsx` to render:

- observatory background
- status rail
- 3 demo veins
- one dominant CTA to inspect a selected vein

Component API:

```ts
type ExperienceEntryProps = {
  veins: ExperienceVein[];
};
```

Reuse visual language from Mine, but do not import auth-only data hooks.

**Step 2: Build the public result screen**

Create `experience-result.tsx` to render:

- selected demo vein summary
- 3 demo ideas
- one small explanatory block
- soft gate actions for:
  - save
  - see all results
  - generate outline

Component API:

```ts
type ExperienceResultProps = {
  vein: ExperienceVein;
  ideas: ExperienceIdea[];
};
```

**Step 3: Add a reusable soft gate panel**

Create `soft-gate-panel.tsx`:

```ts
type SoftGatePanelProps = {
  title: string;
  body: string;
  ctaLabel: string;
  next: string;
  secondaryLabel?: string;
};
```

This component should link to:

`/auth/sign-in?next=<encoded-return-path>`

Visual rules:

- use the current signal CTA system
- do not look like a generic pricing modal
- frame it as continuation/unlock, not hard rejection

**Step 4: Wire the routes**

`apps/web/src/app/experience/page.tsx`:

- load demo veins from `experience-data.ts`
- render `ExperienceEntry`

`apps/web/src/app/experience/[veinId]/page.tsx`:

- resolve `veinId`
- render `ExperienceResult`
- return `notFound()` if the id is invalid

**Step 5: Verify**

Run:

```bash
cd apps/web
npm run lint
npm run build
```

Expected:

- `/experience` builds as a public route
- `/experience/[veinId]` resolves without auth

**Step 6: Commit**

```bash
git add apps/web/src/app/experience apps/web/src/components/experience
git commit -m "feat(web): add public experience flow"
```

## Task 3: Update Landing and Guest Entry CTA Strategy

**Files:**
- Modify: `apps/web/src/app/page.tsx`
- Modify: `apps/web/src/components/landing/landing-hero.tsx`
- Modify: `apps/web/src/components/landing/final-cta.tsx`
- Modify: `apps/web/src/components/landing/positioning-band.tsx`

**Step 1: Change guest primary CTA destinations**

For logged-out users:

- landing primary CTA -> `/experience`
- final CTA -> `/experience`

For logged-in users:

- keep routing to `/mine`

**Step 2: Update CTA copy**

Replace guest-facing CTA copy so it signals trial, not registration.

Preferred patterns:

- `Try today's vein`
- `Explore a live signal`
- `Enter the demo mine`

Avoid:

- `Sign up to continue`
- `Get started` as the main guest CTA

**Step 3: Update supporting copy**

In hero/positioning sections, add one short line that makes the new structure clear:

- you can preview today's signals before signing in
- save and full exploration unlock after login

Do not overload the hero with pricing copy.

**Step 4: Verify**

Run:

```bash
cd apps/web
npm run lint
```

Manual QA:

- logged-out landing should clearly offer a real experience, not only sign-in
- logged-in landing should still prioritize `/mine`

**Step 5: Commit**

```bash
git add apps/web/src/app/page.tsx apps/web/src/components/landing/landing-hero.tsx apps/web/src/components/landing/final-cta.tsx apps/web/src/components/landing/positioning-band.tsx
git commit -m "refactor(web): route guests into public experience flow"
```

## Task 4: Preserve Return Path Through Sign-In

**Files:**
- Modify: `apps/web/src/app/auth/sign-in/page.tsx`
- Reference: `apps/web/src/app/auth/callback/route.ts`

**Step 1: Read the current callback contract**

Confirm that `apps/web/src/app/auth/callback/route.ts` already supports:

```ts
const next = searchParams.get("next") ?? "/mine";
```

Do not change callback behavior unless required.

**Step 2: Update sign-in page to preserve `next`**

In `sign-in/page.tsx`:

- read `next` from `useSearchParams()`
- pass it into `redirectTo` so OAuth callback receives it

Pseudo-shape:

```ts
const next = searchParams.get("next") ?? "/mine";
redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
```

Make sure the parameter is not double-encoded.

**Step 3: Add guest context messaging**

When `next` starts with `/experience`, show a short helper message such as:

- `Sign in to save this signal and continue in your real Mine.`

This is not a full marketing panel; just enough to explain why the gate appeared.

**Step 4: Verify**

Run:

```bash
cd apps/web
npm run lint
```

Manual QA:

- visit `/auth/sign-in?next=/experience/demo-health`
- confirm the helper copy appears
- confirm OAuth buttons are still clickable and use the callback route

**Step 5: Commit**

```bash
git add apps/web/src/app/auth/sign-in/page.tsx
git commit -m "feat(web): preserve guest return path through sign-in"
```

## Task 5: Keep Protected Product Routes Strict

**Files:**
- Reference: `apps/web/src/proxy.ts`
- Reference: `apps/web/src/lib/supabase/middleware.ts`
- Reference: `apps/web/src/app/(app)/layout.tsx`

**Step 1: Verify that public experience routes do not require auth changes**

Because `/experience` lives outside `/(app)`, do not weaken the authenticated app layout.

Keep:

- `/(app)` requiring a logged-in user
- `/mine`, `/vault`, `/lab` protected

**Step 2: Narrow proxy exceptions only if needed**

If the middleware currently redirects all non-root unauthenticated routes, update `apps/web/src/lib/supabase/middleware.ts` so `/experience` and `/experience/*` are allowed through.

Expected rule shape:

- public: `/`, `/auth/*`, `/experience`, `/experience/*`
- protected: everything in the product shell

Do not open `/mine` in this pass.

**Step 3: Verify**

Manual QA:

- logged-out `/experience` -> allowed
- logged-out `/experience/[veinId]` -> allowed
- logged-out `/mine` -> redirected to sign-in
- logged-out `/vault` -> redirected to sign-in

**Step 4: Commit**

```bash
git add apps/web/src/lib/supabase/middleware.ts apps/web/src/proxy.ts apps/web/src/app/(app)/layout.tsx
git commit -m "feat(web): keep product routes protected while opening public experience"
```

## Task 6: Add Soft Gate Actions and Guest Handoff UI

**Files:**
- Modify: `apps/web/src/components/experience/experience-result.tsx`
- Modify: `apps/web/src/components/experience/soft-gate-panel.tsx`
- Reference: `apps/web/src/components/shared/signal-button.tsx`

**Step 1: Map exact guest gate actions**

The result screen must expose:

- `Save to Vault`
- `See all results`
- `Generate outline`

All three should route through the same soft gate component with different copy.

**Step 2: Differentiate gate strength**

Use one dominant CTA and supporting locked affordances.

Recommended:

- one main unlock CTA
- small locked badges or lines for the other actions

Do not create three equally loud buttons.

**Step 3: Add a second-stage nudge**

Below the gate, add one quiet line clarifying the payoff:

- sign in to store this direction
- unlock the full result set
- continue in your personal Mine

**Step 4: Verify**

Manual QA:

- guest can read enough to feel the value
- guest cannot bypass into save/outline/full result behavior
- gate feels like continuation, not dead-end rejection

**Step 5: Commit**

```bash
git add apps/web/src/components/experience/experience-result.tsx apps/web/src/components/experience/soft-gate-panel.tsx
git commit -m "feat(web): add soft gate handoff for guest experience"
```

## Task 7: Add Minimal Experience Instrumentation

**Files:**
- Create: `supabase/migrations/00013_experience_events.sql`
- Create: `apps/web/src/app/api/experience-events/route.ts`
- Create: `apps/web/src/lib/experience-events.ts`
- Modify: `apps/web/src/components/experience/experience-entry.tsx`
- Modify: `apps/web/src/components/experience/experience-result.tsx`
- Modify: `apps/web/src/components/landing/landing-hero.tsx`

**Step 1: Create an events table**

Add `supabase/migrations/00013_experience_events.sql`:

```sql
create table public.experience_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  event_name text not null,
  route text not null,
  vein_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_experience_events_created_at on public.experience_events (created_at desc);
create index idx_experience_events_event_name on public.experience_events (event_name, created_at desc);
```

Keep this table append-only in this pass.

**Step 2: Add a lightweight logging route**

Create `apps/web/src/app/api/experience-events/route.ts` to accept:

```ts
type ExperienceEventBody = {
  sessionId: string;
  eventName:
    | "landing_experience_click"
    | "experience_entry_view"
    | "experience_vein_select"
    | "experience_result_view"
    | "experience_gate_impression"
    | "experience_gate_click";
  route: string;
  veinId?: string;
  metadata?: Record<string, unknown>;
};
```

Use the server Supabase client to insert rows.

**Step 3: Add a tiny client helper**

Create `apps/web/src/lib/experience-events.ts`:

- generate or reuse a guest `sessionId` from `localStorage`
- expose:

```ts
export function getExperienceSessionId(): string
export async function trackExperienceEvent(...)
```

**Step 4: Instrument only the critical points**

Track:

- hero CTA click
- public experience page load
- vein selection
- result screen load
- gate impression
- gate CTA click

Do not add broad analytics yet.

**Step 5: Verify**

Run:

```bash
cd apps/web
npm run lint
npm run build
```

Manual QA:

- network shows POST requests to `/api/experience-events`
- guest browsing does not break if logging fails

**Step 6: Commit**

```bash
git add supabase/migrations/00013_experience_events.sql apps/web/src/app/api/experience-events/route.ts apps/web/src/lib/experience-events.ts apps/web/src/components/experience/experience-entry.tsx apps/web/src/components/experience/experience-result.tsx apps/web/src/components/landing/landing-hero.tsx
git commit -m "feat(web): add guest experience activation tracking"
```

## Task 8: Full Validation Pass

**Files:**
- No new files
- Validate all files touched in Tasks 1-7

**Step 1: Static validation**

Run:

```bash
cd apps/web
npm run lint
npx tsc --noEmit -p tsconfig.json
npm run build
```

Expected:

- all commands pass

**Step 2: Browser smoke test**

Check, logged out:

1. `/` loads
2. landing guest CTA opens `/experience`
3. `/experience` shows 3 demo veins
4. selecting a vein opens `/experience/[veinId]`
5. sample ideas are visible
6. clicking save / outline / full results opens soft gate
7. soft gate CTA leads to `/auth/sign-in?next=...`

Check, logged in:

1. `/` primary CTA still goes to `/mine`
2. `/mine` real flow still works
3. `/vault` and `/lab` still require auth and render correctly

**Step 3: Product sanity check**

Confirm the strategy intent is visible in the product:

- guests can feel the value
- guests cannot fully replace signed-in use
- soft gate appears after value, not before value

**Step 4: Commit**

```bash
git add -A
git commit -m "test(web): validate experience-first access rollout"
```

## Rollout Notes

- Launch this behind a small UI toggle only if team wants a staggered rollout. Otherwise, ship directly because the public route is additive and does not weaken protected product routes.
- Review the first 7 days of `experience_events` before changing free tier limits.
- If guest-to-sign-in conversion is weak, tune in this order:
  1. improve demo data quality
  2. strengthen gate payoff copy
  3. adjust result count from 3 to 5 only if needed

## Out of Scope for This Plan

- making `/mine` itself public
- live anonymous access to real mining endpoints
- free-tier pricing or limit changes beyond gate copy
- public Vault or public Lab
- broad analytics platform adoption

