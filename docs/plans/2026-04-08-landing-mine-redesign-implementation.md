# Landing / Mine Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 랜딩 페이지와 광맥(Mine) 페이지를 `Cinematic Observatory` 방향으로 재구성해, 랜딩은 세계관+제품 이해+진입을 동시에 수행하고, Mine은 카드 그리드 대신 `Sector Scan` 장면 중심의 선택 경험을 제공한다.

**Architecture:** 기존 Next.js App Router 구조와 데이터 API는 유지한다. 공통 비주얼 언어는 `background`, `status rail`, `signal CTA` 같은 얇은 재사용 프리미티브로 추출하고, 페이지별 차별점은 `landing/*`와 `mine/*` 컴포넌트에서 해결한다. Mine은 서버 데이터 shape를 바꾸지 않고 클라이언트 selection state만 추가해 `3개 후보 → 1개 상세 패널 → 탐사 진입` 흐름으로 바꾼다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Framer Motion, TanStack React Query, existing Supabase auth/API client

---

## Ground Rules

- 이번 작업 범위는 `apps/web`의 랜딩과 Mine 페이지만 포함한다.
- `Premium-Space-UI-Style-Guide.md`의 `B+ Deep Relay` 팔레트와 CTA 규칙을 그대로 따른다.
- API shape, 라우팅 shape, `/mine/[veinId]` 진입 방식은 바꾸지 않는다.
- 새 자동화 테스트 러너는 이번 패스에서 도입하지 않는다. 검증은 `lint`, `build`, 수동 UI smoke check로 수행한다.
- 폰트 교체는 이번 패스 범위에서 제외한다. 현재 폰트 스택을 유지하고 레이아웃/표면/모션부터 정리한다.

## Acceptance Criteria

- 랜딩 첫 화면에 `status rail + split hero + 실제 Mine 프리뷰 + 2단 CTA`가 보인다.
- 랜딩은 `Mine → Vault → Lab` 흐름과 실제 제품 패널 일부를 보여준다.
- Mine 첫 화면은 카드 3열이 아니라 `scan field + 3개 signal node + 1개 detail panel` 구조다.
- Mine에서는 기본 선택 대상이 하나 잡히고, 사용자가 선택을 바꾸면 detail panel과 CTA가 함께 업데이트된다.
- `re-scan`은 보조 액션으로 남고, `Start Mining` 계열 CTA가 가장 강하다.
- 핑크는 랜딩 진입 CTA와 Mine primary CTA에만 강하게 쓰이고, 나머지는 steel/cyan 중심으로 유지된다.
- 데스크톱이 기준이며, 태블릿/모바일에서 깨지지 않고 핵심 정보가 순서대로 읽힌다.

## Task 1: Shared Observatory Primitives

**Files:**
- Create: `apps/web/src/components/backgrounds/observatory-background.tsx`
- Create: `apps/web/src/components/shared/status-rail.tsx`
- Create: `apps/web/src/components/shared/signal-button.tsx`
- Modify: `apps/web/src/app/globals.css`
- Modify: `apps/web/src/app/(app)/app-shell.tsx`

**Step 1: Add a shared background primitive**

Create `observatory-background.tsx` with a variant prop:

```ts
type ObservatoryBackgroundProps = {
  variant?: "landing" | "mine";
  intensity?: "hero" | "default" | "quiet";
  className?: string;
};
```

Keep the current starfield/nebula approach, but make intensity controllable so landing hero and Mine stage can share one visual language.

**Step 2: Add a shared status rail component**

Create `status-rail.tsx` with slot-based API:

```ts
type StatusRailProps = {
  left: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  variant?: "landing" | "app";
  className?: string;
};
```

This component must be thin, framed, and HUD-like. Do not bake page-specific copy into it.

**Step 3: Add a shared signal button component**

Create `signal-button.tsx` with explicit visual variants:

```ts
type SignalButtonVariant = "primary" | "default" | "secondary" | "ghost";
```

`primary` uses subtle pink tint + pink signal response. `default` uses dark panel + steel border + pink glow. `secondary` uses steel/cyan emphasis. `ghost` is text-led.

**Step 4: Extend global CSS only for reusable tokens/utilities**

Keep existing colors. Add only missing reusable utilities for:

- observatory panel shadow
- signal glow
- framed glass/metal surface treatment
- readable max width helpers if needed

Do not add page-specific CSS here.

**Step 5: Refit `app-shell.tsx` to the new status language**

Keep current nav items and auth behavior, but update the shell header to use `StatusRail` styling instead of the current thick header treatment. The goal is visual continuity with Mine, not a route/nav rewrite.

**Step 6: Verify**

Run:

```bash
cd apps/web
npm run lint
```

Expected: lint passes with new shared components and no unused imports.

**Step 7: Commit**

```bash
git add apps/web/src/components/backgrounds/observatory-background.tsx apps/web/src/components/shared/status-rail.tsx apps/web/src/components/shared/signal-button.tsx apps/web/src/app/globals.css apps/web/src/app/(app)/app-shell.tsx
git commit -m "feat(web): add observatory layout primitives"
```

## Task 2: Rebuild Landing Top Half

**Files:**
- Create: `apps/web/src/components/landing/landing-hero.tsx`
- Modify: `apps/web/src/app/page.tsx`

**Step 1: Keep `page.tsx` as the auth-aware server entry**

Do not move auth lookup out of `page.tsx`. Keep the current `createClient()` + `getUser()` flow so CTA destination can still depend on login state.

**Step 2: Replace the placeholder center stack with page sections**

`page.tsx` should render, in order:

- landing status rail
- split hero
- lower landing sections (added in later tasks)

Remove the current centered placeholder layout entirely.

**Step 3: Build `landing-hero.tsx`**

Component must accept:

```ts
type LandingHeroProps = {
  hasUser: boolean;
};
```

It should render:

- left: kicker, headline, body copy, 2 CTA buttons, proof line
- right: framed product preview of Mine sector scan

Do not fetch live data in this component. The right-side frame should be a curated static UI composition using existing Mine language, not a query-driven widget.

**Step 4: Apply split hero ratio and CTA behavior**

Use a desktop-first split around `45 / 55`. Logged-in users should route the primary CTA to `/mine`; logged-out users should route to `/auth/sign-in`. The secondary CTA can anchor-scroll to product proof or core loop section.

**Step 5: Use the shared primitives**

- `StatusRail` for top nav
- `SignalButton` for CTAs
- `ObservatoryBackground` for full-bleed atmosphere

Landing should already feel like the same universe as Mine before lower sections are added.

**Step 6: Verify**

Run:

```bash
cd apps/web
npm run lint
npm run build
```

Expected: home page still builds as a server component and links resolve.

**Step 7: Commit**

```bash
git add apps/web/src/app/page.tsx apps/web/src/components/landing/landing-hero.tsx
git commit -m "feat(web): rebuild landing hero experience"
```

## Task 3: Add Landing Lower Sections

**Files:**
- Create: `apps/web/src/components/landing/core-loop-preview.tsx`
- Create: `apps/web/src/components/landing/product-proof.tsx`
- Create: `apps/web/src/components/landing/positioning-band.tsx`
- Create: `apps/web/src/components/landing/final-cta.tsx`
- Modify: `apps/web/src/app/page.tsx`

**Step 1: Add `core-loop-preview.tsx`**

Render `Mine → Vault → Lab` as connected system nodes, not generic feature cards. Keep copy short and structural.

**Step 2: Add `product-proof.tsx`**

Build 2-3 framed UI proof panels for:

- Mine
- Vault
- Lab

These are static showcase slices, not routed embeds. Use current product nouns and real-looking density.

**Step 3: Add `positioning-band.tsx`**

Use one short positioning statement plus a supporting sentence. This section exists to restate “not just idea generation”.

**Step 4: Add `final-cta.tsx`**

Use the same route logic as the hero primary CTA. This section may use slightly stronger pink energy than the middle of the page.

**Step 5: Compose sections in `page.tsx`**

Landing section order must be:

1. `StatusRail`
2. `LandingHero`
3. `CoreLoopPreview`
4. `ProductProof`
5. `PositioningBand`
6. `FinalCta`

Do not add extra marketing filler between these sections.

**Step 6: Verify**

Manual smoke check in `npm run dev`:

- hero reads first
- core loop scans as one connected flow
- product proof feels like real app UI
- final CTA is visually strong but not gaudy

Then run:

```bash
cd apps/web
npm run lint
npm run build
```

**Step 7: Commit**

```bash
git add apps/web/src/app/page.tsx apps/web/src/components/landing
git commit -m "feat(web): add landing lower sections"
```

## Task 4: Replace Mine Grid with Sector Scan Shell

**Files:**
- Create: `apps/web/src/components/mine/sector-scan-stage.tsx`
- Create: `apps/web/src/components/mine/vein-signal-node.tsx`
- Create: `apps/web/src/components/mine/selected-vein-panel.tsx`
- Modify: `apps/web/src/app/(app)/mine/page.tsx`
- Modify: `apps/web/src/components/backgrounds/mine-background.tsx` or replace usage with `observatory-background.tsx`

**Step 1: Add client-side selected vein state**

In `mine/page.tsx`, derive a `selectedVeinId` state from the query response.

Rules:

- first successful payload selects `veins[0]`
- reroll success resets selection to the new `veins[0]`
- if current selection disappears, fall back to `veins[0]`

Do not change server data or React Query keys.

**Step 2: Replace the current grid shell**

Remove the current `VeinCard` grid from the main layout. Replace it with:

- top status rail
- central sector scan stage
- right-side selected vein detail panel
- reroll secondary action integrated into the panel or status area

The page should still use the same loading and error states, but those states should now occupy the scan layout rather than a generic card grid.

**Step 3: Build `vein-signal-node.tsx`**

This component should accept:

```ts
type VeinSignalNodeProps = {
  vein: Vein;
  selected: boolean;
  onSelect: (id: string) => void;
  position: "top" | "left" | "right";
};
```

It must feel like a detected target, not a card. Use `Meteorite3D` if it helps, but the container treatment must be signal-driven.

**Step 4: Build `sector-scan-stage.tsx`**

This component owns:

- asymmetric placement of 3 nodes
- stage framing
- tracking lines / subtle scan overlays
- empty/loading/error composition

Do not place heavy copy here. The stage is for scene + selection.

**Step 5: Build `selected-vein-panel.tsx`**

This panel receives the chosen vein and renders:

- name
- rarity
- 2-4 keyword chips
- short summary/instruction line
- primary CTA
- secondary reroll CTA

Primary CTA routes to `/mine/${selectedVein.id}`. Secondary CTA triggers the existing reroll mutation.

**Step 6: Verify**

Manual smoke check:

- initial load selects one node automatically
- clicking each node updates the detail panel
- reroll swaps all three and resets selection
- clicking the primary CTA still navigates correctly

Then run:

```bash
cd apps/web
npm run lint
npm run build
```

**Step 7: Commit**

```bash
git add apps/web/src/app/(app)/mine/page.tsx apps/web/src/components/mine/sector-scan-stage.tsx apps/web/src/components/mine/vein-signal-node.tsx apps/web/src/components/mine/selected-vein-panel.tsx apps/web/src/components/backgrounds
git commit -m "feat(web): turn mine into sector scan scene"
```

## Task 5: Align Supporting Surface Components

**Files:**
- Modify: `apps/web/src/components/mine/keyword-chip.tsx`
- Modify: `apps/web/src/components/mine/meteorite-3d.tsx` (only if lighting or framing is needed)
- Modify: `apps/web/src/components/mine/vein-card.tsx` (remove usage assumptions or simplify for eventual deletion)

**Step 1: Restyle `keyword-chip.tsx`**

Keep category distinction, but remove loud purple/SaaS tag energy. Chips should feel like instrument tags:

- darker fill
- steel border baseline
- restrained category accent
- no candy-colored pill effect

If category colors remain, they should appear as signal accents, not full chip identity.

**Step 2: Tune `meteorite-3d.tsx` only if the new node composition requires it**

If the current object reads too much like a “card asset” instead of a detected target, reduce over-rendered presentation and make it work better inside a signal node frame.

**Step 3: Decommission `vein-card.tsx` safely**

After `mine/page.tsx` no longer imports it, either:

- leave the file untouched but unused for one pass, or
- delete it in the same PR if there are zero remaining imports

Default: delete it only if no imports remain.

**Step 4: Verify**

Run:

```bash
cd apps/web
npm run lint
```

Expected: no dead imports or unused component warnings from the Mine migration.

**Step 5: Commit**

```bash
git add apps/web/src/components/mine/keyword-chip.tsx apps/web/src/components/mine/meteorite-3d.tsx apps/web/src/components/mine/vein-card.tsx
git commit -m "refactor(web): align mine support components"
```

## Task 6: Responsive, Motion, and Final QA

**Files:**
- Modify: `apps/web/src/app/page.tsx`
- Modify: `apps/web/src/app/(app)/mine/page.tsx`
- Modify: any newly created landing/mine components as needed

**Step 1: Lock desktop-first responsive behavior**

Landing:

- desktop keeps split hero
- tablet narrows but preserves hero hierarchy
- mobile stacks left content above framed preview

Mine:

- desktop keeps stage + right panel
- tablet can collapse detail panel below the stage
- mobile stacks `status rail → stage → panel → support`

Do not preserve a desktop side panel on small screens if it crushes the stage.

**Step 2: Normalize motion**

Use Framer Motion only where it reinforces:

- stage entry
- node hover/select
- panel update
- CTA hover/focus

Do not add decorative motion to every section.

**Step 3: Run final verification**

Run:

```bash
cd apps/web
npm run lint
npm run build
```

Then manually verify:

- logged-out landing
- logged-in landing CTA destination
- Mine loading state
- Mine error state
- Mine reroll flow
- Mine selection flow
- desktop/tablet/mobile breakpoints

**Step 4: Commit**

```bash
git add apps/web/src/app/page.tsx apps/web/src/app/(app)/mine/page.tsx apps/web/src/components/landing apps/web/src/components/mine apps/web/src/components/shared apps/web/src/components/backgrounds
git commit -m "feat(web): finalize landing and mine redesign"
```

## Manual QA Checklist

### Landing

- Hero headline reads before the preview frame.
- Primary CTA is visually strongest.
- Secondary CTA is visibly weaker but still discoverable.
- `Mine → Vault → Lab` reads as a flow, not 3 equal feature boxes.
- Product proof panels look like real app surfaces, not marketing cards.

### Mine

- The page immediately reads as a scan scene.
- Only one vein is emphasized at a time.
- Detail panel reflects the selected node without lag or mismatch.
- `re-scan` is clearly secondary to the primary mining CTA.
- Pink usage stays concentrated in selected state and primary CTA.

### Cross-Page

- Landing and Mine feel like the same observatory system.
- Status rails share one visual language.
- No flat empty backgrounds.
- Content is always readable over atmosphere.

## Assumptions

- Keep current Geist-based font stack for this pass.
- Do not add Vitest/Playwright setup in this redesign pass.
- Use the first returned vein as the default selected node.
- Keep `/mine/[veinId]` downstream flow unchanged.
- `Project-Overview-v2.ko.md` encoding issues are unrelated and out of scope for this implementation.
