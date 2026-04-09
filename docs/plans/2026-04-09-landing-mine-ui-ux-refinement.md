# Landing / Mine UI UX Refinement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 랜딩과 Mine 화면의 분위기와 구조는 유지하되, 정보 위계, CTA 강약, 섹션 리듬, 선택 판단성을 강화해서 실제로 더 잘 읽히고 더 잘 고를 수 있는 화면으로 다듬는다.

**Architecture:** 현재 Next.js App Router 구조와 `ObservatoryBackground`, `StatusRail`, `SignalButton`, `SectorScanStage`, `SelectedVeinPanel` 기반 컴포넌트 체계는 유지한다. 이번 패스에서는 디자인 시스템을 다시 갈아엎지 않고, 랜딩의 장면 구조와 Mine의 선택 UX를 더 선명하게 만드는 방향으로 정리한다. 새 테스트 러너는 도입하지 않고, 기존 `apps/web` 범위에서 `lint`, `build`, 브라우저 QA 체크포인트로 검증한다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Framer Motion, TanStack React Query, Supabase auth, existing web app component system

---

## Ground Rules

- 이번 작업 범위는 `apps/web`의 랜딩과 Mine UI/UX에 한정한다.
- 세계관 방향은 유지한다. 목표는 `Cinematic Observatory`를 버리는 것이 아니라, 실제 사용성을 더 강하게 만드는 것이다.
- 새 페이지를 추가하지 않는다. 기존 진입점과 라우트는 유지한다.
- 로그인/비로그인 분기, `/mine/[veinId]` 진입 흐름, API shape는 바꾸지 않는다.
- 컴포넌트 테스트 하네스가 없으므로 이번 패스에서는 새 테스트 프레임워크를 추가하지 않는다.
- 각 작업 후 최소 검증은 `npm run lint`, 필요 시 `npm run build`, 그리고 브라우저 수동 QA 체크포인트로 수행한다.

## Acceptance Criteria

- 랜딩 첫 화면에서 시선이 분산되지 않고, `headline -> primary CTA -> preview` 순서로 읽힌다.
- 랜딩 중간 섹션들이 같은 카드 반복처럼 보이지 않고, 각 섹션의 역할과 장면 강약이 구분된다.
- `Product Proof`가 마케팅용 목업보다 실제 제품 밀도를 보여주는 프레임처럼 느껴진다.
- Mine에서 사용자가 각 대상의 차이를 빠르게 파악하고 하나를 고를 수 있다.
- Mine 상세 패널의 텍스트가 무드 카피보다 선택과 행동을 돕는 정보로 읽힌다.
- 보라색 rarity 톤이 제거되거나 시스템 팔레트에 맞게 정리된다.
- CTA 모션과 강약이 일반 SaaS 버튼보다 장비형 인터페이스에 가깝게 느껴진다.
- 데스크톱, 태블릿, 모바일 랜딩에서 가독성과 흐름이 유지된다.

## Manual QA Baseline

이 계획을 실행하기 전에 아래 현재 문제를 기준선으로 삼는다.

- 랜딩 hero의 정보 밀도와 CTA가 동시에 강해서 첫 시선이 분산된다.
- `Core Loop`, `Product Proof`, `Final CTA`가 비슷한 프레임 구조로 반복되어 스크롤 리듬이 평평하다.
- Mine은 장면은 강하지만 선택 근거가 약해 사용자가 왜 하나를 골라야 하는지 빠르게 이해하기 어렵다.
- 작은 uppercase 라벨이 과다해 실제 읽기 피로도가 높다.
- 일부 보조 카피가 분위기에는 기여하지만 행동 지시는 약하다.

## Task 1: Rebalance Landing Hero Hierarchy

**Files:**
- Modify: `apps/web/src/app/page.tsx`
- Modify: `apps/web/src/components/landing/landing-hero.tsx`
- Reference: `apps/web/src/components/shared/status-rail.tsx`
- Reference: `apps/web/src/components/shared/signal-button-styles.ts`

**Step 1: Audit the current landing hero structure**

Read:

```bash
Get-Content apps/web/src/app/page.tsx
Get-Content apps/web/src/components/landing/landing-hero.tsx
```

Confirm the current visual competition points:
- top rail secondary CTA
- top rail primary CTA
- hero primary CTA
- hero secondary CTA
- preview frame chrome

**Step 2: Reduce top rail prominence**

Adjust `page.tsx` so the landing `StatusRail` right side reads as utility navigation, not a co-equal hero CTA cluster.

Implementation notes:
- Keep auth-aware destinations.
- Reduce visual weight of the secondary action.
- Consider simplifying text in the right slot so the top rail does not compete with the hero.

**Step 3: Tighten hero copy hierarchy**

In `landing-hero.tsx`:
- keep one strong headline
- keep one concise support paragraph
- reduce decorative micro-copy where possible
- ensure the proof line is visually subordinate to CTA

Do not add more copy.

**Step 4: Make preview more product-like and less decorative**

Still in `landing-hero.tsx`:
- reduce empty ornamentation in the preview frame
- increase real UI cues: panel divisions, signal labels, selected state cues, readable surface density
- make the preview support the main story instead of competing with it

**Step 5: Verify**

Run:

```bash
cd apps/web
npm run lint
```

Manual QA:
- Landing first screen should read in this order: headline -> primary CTA -> preview
- Top rail CTA should feel secondary

**Step 6: Commit**

```bash
git add apps/web/src/app/page.tsx apps/web/src/components/landing/landing-hero.tsx
git commit -m "refactor(web): rebalance landing hero hierarchy"
```

## Task 2: Differentiate Landing Section Rhythm

**Files:**
- Modify: `apps/web/src/components/landing/core-loop-preview.tsx`
- Modify: `apps/web/src/components/landing/product-proof.tsx`
- Modify: `apps/web/src/components/landing/final-cta.tsx`

**Step 1: Rework `CoreLoopPreview` from equal cards to directional flow**

Update `core-loop-preview.tsx` so it reads more like a connected system and less like three equal feature cards.

Implementation notes:
- preserve `Mine -> Vault -> Lab`
- make connection more explicit
- reduce repeated chrome
- consider one dominant central flow line or more asymmetric node treatment

**Step 2: Rebuild `ProductProof` into an asymmetric proof composition**

Update `product-proof.tsx` so `Mine` is the dominant proof slice and `Vault` / `Lab` support it.

Implementation notes:
- avoid three equally weighted columns if possible
- make at least one slice feel like a real app surface, not a marketing card
- keep density, but reduce symmetry

**Step 3: Shorten and sharpen `FinalCta`**

Update `final-cta.tsx`:
- keep one clear primary action
- reduce duplicated explanatory tone
- make this section feel like a clean closing beat, not another large feature panel

**Step 4: Verify**

Run:

```bash
cd apps/web
npm run lint
npm run build
```

Manual QA:
- scroll the landing page from hero to bottom
- each section should feel like a different scene with a different job
- `Product Proof` should feel more credible than decorative

**Step 5: Commit**

```bash
git add apps/web/src/components/landing/core-loop-preview.tsx apps/web/src/components/landing/product-proof.tsx apps/web/src/components/landing/final-cta.tsx
git commit -m "refactor(web): improve landing section rhythm"
```

## Task 3: Reduce Microtype Noise Across Landing

**Files:**
- Modify: `apps/web/src/components/landing/landing-hero.tsx`
- Modify: `apps/web/src/components/landing/core-loop-preview.tsx`
- Modify: `apps/web/src/components/landing/product-proof.tsx`
- Modify: `apps/web/src/components/landing/final-cta.tsx`
- Modify: `apps/web/src/app/page.tsx`

**Step 1: Inventory tiny uppercase labels**

Search for small uppercase labels in landing-related files:

```bash
Get-ChildItem -Recurse apps/web/src/components/landing -Include *.ts,*.tsx | Select-String -Pattern "text-\\[10px\\]|text-\\[11px\\]|uppercase"
```

Identify which labels are essential for navigation and which are only decorative.

**Step 2: Remove or downgrade decorative labels**

In the files above:
- keep labels that orient the user
- remove labels that restate obvious section names
- promote key labels to more readable sizing where needed

**Step 3: Normalize body readability**

Ensure:
- body text remains readable on mobile
- no section depends on tiny uppercase text for meaning

**Step 4: Verify**

Run:

```bash
cd apps/web
npm run lint
```

Manual QA:
- mobile landing should still feel premium
- no section should require reading tiny uppercase labels to understand purpose

**Step 5: Commit**

```bash
git add apps/web/src/app/page.tsx apps/web/src/components/landing
git commit -m "refactor(web): reduce landing microtype noise"
```

## Task 4: Strengthen Mine Selection Readability

**Files:**
- Modify: `apps/web/src/components/mine/sector-scan-stage.tsx`
- Modify: `apps/web/src/components/mine/vein-signal-node.tsx`
- Modify: `apps/web/src/components/mine/selected-vein-panel.tsx`
- Modify: `apps/web/src/app/(app)/mine/page.tsx`

**Step 1: Audit current selection cues**

Read:

```bash
Get-Content apps/web/src/components/mine/sector-scan-stage.tsx
Get-Content apps/web/src/components/mine/vein-signal-node.tsx
Get-Content apps/web/src/components/mine/selected-vein-panel.tsx
```

List what information helps a user choose before clicking a node:
- rarity
- keywords
- one-line potential
- slot identity

**Step 2: Add fast-scanning differentiation to nodes**

Update `vein-signal-node.tsx` and, if needed, `sector-scan-stage.tsx` so each node exposes one or two meaningful differences before selection.

Implementation notes:
- do not turn them back into cards
- keep them as targets
- add just enough comparative information to support quick choice

**Step 3: Replace weak codename-first emphasis in panel**

In `selected-vein-panel.tsx`:
- reduce reliance on `Target Alpha/Beta/Gamma` as the main identity
- surface a more useful title or subtitle derived from actual vein data
- keep codename only as a secondary label if needed

**Step 4: Rewrite panel guidance to support decisions**

Still in `selected-vein-panel.tsx`:
- replace vague labels like `scan note` with more helpful framing
- ensure the support text answers “why this target” or “what kind of idea path this opens”
- keep copy short

**Step 5: Verify**

Run:

```bash
cd apps/web
npm run lint
```

Manual QA:
- from the Mine screen, a user should be able to compare three targets quickly
- the selected panel should help confirm the choice, not just restyle it

**Step 6: Commit**

```bash
git add apps/web/src/components/mine/sector-scan-stage.tsx apps/web/src/components/mine/vein-signal-node.tsx apps/web/src/components/mine/selected-vein-panel.tsx apps/web/src/app/(app)/mine/page.tsx
git commit -m "refactor(web): strengthen mine selection clarity"
```

## Task 5: Re-align Mine Color and Rarity System

**Files:**
- Modify: `apps/web/src/components/mine/selected-vein-panel.tsx`
- Modify: `apps/web/src/components/mine/keyword-chip.tsx`
- Reference: `apps/web/src/components/shared/signal-button-styles.ts`

**Step 1: Remove palette drift from rarity treatment**

Update `RARITY_META` in `selected-vein-panel.tsx` so `rare` no longer introduces an off-system purple.

Use only the approved system family:
- cold cyan
- signal pink / cosmic rose direction
- metal / mineral highlight
- neutral steel

**Step 2: Re-check chip accents**

Update `keyword-chip.tsx` only if category accents are now visually fighting the panel rarity system.

Keep chips readable, but ensure they feel like system tags rather than candy-colored badges.

**Step 3: Verify**

Run:

```bash
cd apps/web
npm run lint
```

Manual QA:
- no element on Mine should suddenly feel like a different design system
- rarity and chip accents should still be distinguishable without introducing purple drift

**Step 4: Commit**

```bash
git add apps/web/src/components/mine/selected-vein-panel.tsx apps/web/src/components/mine/keyword-chip.tsx
git commit -m "refactor(web): align mine palette and rarity states"
```

## Task 6: Make CTA Motion Feel More Instrument-Like

**Files:**
- Modify: `apps/web/src/components/shared/signal-button-styles.ts`
- Modify: `apps/web/src/components/landing/landing-hero.tsx`
- Modify: `apps/web/src/components/landing/final-cta.tsx`
- Modify: `apps/web/src/components/mine/selected-vein-panel.tsx`

**Step 1: Review current signal button motion language**

Read:

```bash
Get-Content apps/web/src/components/shared/signal-button-styles.ts
```

Identify where lift/hover scale feels too generic or too “SaaS”.

**Step 2: Reduce generic lift behavior**

Update `signal-button-styles.ts` so the default interaction language relies more on:
- border/light activation
- signal glow
- inner surface response

and less on physical lift for every variant.

Do not remove all motion. Just make it more controlled.

**Step 3: Re-check primary CTA emphasis**

In `landing-hero.tsx`, `final-cta.tsx`, and `selected-vein-panel.tsx`, ensure the primary CTA still feels strongest after motion is toned down.

**Step 4: Verify**

Run:

```bash
cd apps/web
npm run lint
npm run build
```

Manual QA:
- primary CTA should still feel more important
- hover should feel like a signal activation, not a floating app button

**Step 5: Commit**

```bash
git add apps/web/src/components/shared/signal-button-styles.ts apps/web/src/components/landing/landing-hero.tsx apps/web/src/components/landing/final-cta.tsx apps/web/src/components/mine/selected-vein-panel.tsx
git commit -m "refactor(web): tune cta motion language"
```

## Task 7: Final Responsive and Browser QA Pass

**Files:**
- Modify: landing or mine components only as needed after QA

**Step 1: Run static verification**

Run:

```bash
cd apps/web
npm run lint
npm run build
```

**Step 2: Run browser QA at required breakpoints**

Verify at:
- 390px
- 768px
- 1024px
- 1440px

Landing checks:
- hero hierarchy still holds
- sections feel differentiated
- no horizontal scroll
- CTA placement remains clear

Mine checks:
- stage remains readable
- panel does not crush comparison
- mobile stacks in a logical order

**Step 3: Fix only QA regressions**

If QA reveals issues:
- fix one regression at a time
- rerun `lint`
- rerun the specific browser scenario

Do not add opportunistic redesigns in this step.

**Step 4: Commit**

```bash
git add apps/web/src/app/page.tsx apps/web/src/app/(app)/mine/page.tsx apps/web/src/components/landing apps/web/src/components/mine apps/web/src/components/shared
git commit -m "refactor(web): polish landing and mine usability"
```

## Final QA Checklist

### Landing

- The first screen has one dominant story, not multiple equal heroes.
- The top rail feels like utility navigation, not a second hero CTA zone.
- `Core Loop`, `Product Proof`, and `Final CTA` feel like different sections with different roles.
- The page reads clearly without relying on tiny uppercase labels.
- `Product Proof` feels like product credibility, not mock UI wallpaper.

### Mine

- The three targets are comparable before selection.
- The selected panel gives a concrete reason to proceed.
- CTA hierarchy is obvious.
- Error, empty, and retry states still behave clearly.
- No off-system purple remains in rarity handling.

### Cross-Page

- Landing and Mine still belong to the same observatory system.
- Button motion feels controlled and intentional.
- No new console, lint, or build regressions are introduced.

## Assumptions

- Existing auth and API wiring remain unchanged.
- No new automated component test harness will be added in this pass.
- The current visual direction stays `premium space / cinematic observatory`; this is a usability refinement pass, not a full redesign reset.
- Browser QA may still require manual authenticated verification for the full Mine scene if OAuth blocks automated access.
