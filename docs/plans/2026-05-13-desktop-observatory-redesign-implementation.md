# Desktop Observatory Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the desktop app shell and top-level Mine, Vault, and Lab screens so the existing animated starfield stays visible across the app while the foreground matches the denser instrument-style examples.

**Architecture:** Add a desktop-first app frame around the current `(app)` routes: fixed left rail, top status header, and a scrollable content well. Keep the current data fetching and page flows intact, but standardize background layering and foreground panel styles through shared components and CSS utilities.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, lucide-react, Framer Motion where already present, existing canvas/CSS background components.

---

## Context

Approved design doc:

- `docs/plans/2026-05-13-desktop-observatory-redesign-design.md`

Reference examples:

- `example/mine.html`
- `example/vault.html`
- `example/lab.html`
- `example/basecamp.html`
- `example/mine-app.html`
- `example/vault-app.html`
- `example/lab-app.html`
- `example/basecamp-app.html`

Current implementation entry points:

- `apps/web/src/app/(app)/app-shell.tsx`
- `apps/web/src/components/shared/app-header.tsx`
- `apps/web/src/app/(app)/mine/mine-client.tsx`
- `apps/web/src/app/(app)/vault/vault-client.tsx`
- `apps/web/src/app/(app)/lab/lab-client.tsx`
- `apps/web/src/components/backgrounds/observatory-background.tsx`
- `apps/web/src/components/backgrounds/mine-background.tsx`
- `apps/web/src/components/backgrounds/vault-background.tsx`
- `apps/web/src/components/backgrounds/lab-background.tsx`
- `apps/web/src/app/globals.css`

Constraints:

- Desktop first.
- Keep the starfield visible on all app pages.
- Do not change API contracts or backend behavior.
- Do not redesign landing/admin in this pass.
- Use `lucide-react`; do not introduce Material Symbols.
- Preserve guest demo access to `/mine`, `/vault`, and `/lab`.

---

## Task 1: Baseline Build And Visual Inventory

**Files:**

- Read: `apps/web/package.json`
- Read: `apps/web/src/app/(app)/app-shell.tsx`
- Read: `apps/web/src/components/shared/app-header.tsx`
- Read: `apps/web/src/app/(app)/mine/mine-client.tsx`
- Read: `apps/web/src/app/(app)/vault/vault-client.tsx`
- Read: `apps/web/src/app/(app)/lab/lab-client.tsx`

**Step 1: Check current git state**

Run:

```powershell
git status --short
```

Expected: unrelated user changes may exist. Do not revert them.

**Step 2: Install dependencies if needed**

Run:

```powershell
npm install
```

from:

```powershell
apps/web
```

Expected: dependencies are present or installed without package changes unless lockfile updates are genuinely required.

**Step 3: Run baseline lint**

Run:

```powershell
npm run lint
```

Expected: capture existing failures, if any. Do not fix unrelated lint outside the redesign scope.

**Step 4: Run baseline build**

Run:

```powershell
npm run build
```

Expected: capture existing failures, if any. The redesign should not add new build errors.

**Step 5: Commit**

No commit for this task unless a dependency or config change was actually required.

---

## Task 2: Add Shared Desktop App Frame Utilities

**Files:**

- Modify: `apps/web/src/app/globals.css`

**Step 1: Add reusable surface utilities**

Add utilities that can be reused by shell, headers, rail, and page panels:

```css
@layer utilities {
  .desktop-instrument-surface {
    background:
      linear-gradient(180deg, rgba(12, 21, 36, 0.78), rgba(4, 7, 13, 0.88));
    border: 1px solid rgba(42, 60, 88, 0.72);
    box-shadow:
      inset 0 1px 0 rgba(217, 226, 240, 0.06),
      0 18px 40px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(14px);
  }

  .desktop-instrument-flat {
    background: rgba(6, 12, 24, 0.68);
    border: 1px solid rgba(42, 60, 88, 0.62);
    backdrop-filter: blur(10px);
  }

  .desktop-signal-line {
    background: linear-gradient(
      90deg,
      transparent,
      rgba(92, 205, 229, 0.72),
      transparent
    );
  }
}
```

Adjust exact opacity during visual QA if text contrast or background visibility is off.

**Step 2: Add shell sizing tokens**

Add CSS custom properties:

```css
:root {
  color-scheme: dark;
  --desktop-rail-width: 72px;
  --desktop-header-height: 64px;
}
```

If `:root` already exists, add only the new properties.

**Step 3: Run lint**

Run:

```powershell
npm run lint
```

Expected: pass or only unrelated pre-existing failures.

**Step 4: Commit**

```powershell
git add apps/web/src/app/globals.css
git commit -m "style: add desktop instrument surface utilities"
```

---

## Task 3: Create A Shared App Background Layer

**Files:**

- Create: `apps/web/src/components/backgrounds/app-starfield-background.tsx`
- Modify: `apps/web/src/components/backgrounds/mine-background.tsx`
- Modify: `apps/web/src/components/backgrounds/vault-background.tsx`
- Modify: `apps/web/src/components/backgrounds/lab-background.tsx`

**Step 1: Create shared wrapper component**

Create `AppStarfieldBackground`:

```tsx
"use client";

import { ObservatoryBackground } from "./observatory-background";

type AppStarfieldBackgroundProps = {
  variant?: "mine" | "vault" | "lab" | "quiet";
};

export function AppStarfieldBackground({
  variant = "mine",
}: AppStarfieldBackgroundProps) {
  const intensity = variant === "quiet" ? "quiet" : "default";

  return (
    <>
      <ObservatoryBackground variant="mine" intensity={intensity} />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(42,60,88,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(42,60,88,0.045)_1px,transparent_1px)] [background-size:72px_72px] opacity-35" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(92,205,229,0.08)_0%,transparent_36%)]" />
        {variant === "lab" && (
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(92,205,229,0.035)_0%,transparent_34%)]" />
        )}
        {variant === "vault" && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(92,205,229,0.045)_0%,transparent_28%)]" />
        )}
      </div>
    </>
  );
}
```

This preserves the starfield everywhere while allowing page-specific overlays.

**Step 2: Update Mine background**

In `mine-background.tsx`, replace the local `ObservatoryBackground` and overlay with:

```tsx
"use client";

import { AppStarfieldBackground } from "./app-starfield-background";

export function MineBackground() {
  return <AppStarfieldBackground variant="mine" />;
}
```

**Step 3: Update Vault background**

Either keep the custom Vault canvas if it is visually preferred, or switch to:

```tsx
"use client";

import { AppStarfieldBackground } from "./app-starfield-background";

export function VaultBackground() {
  return <AppStarfieldBackground variant="vault" />;
}
```

Recommendation: switch to shared starfield first for consistency, then restore the old Vault custom starfield only if QA shows the global background is too active.

**Step 4: Update Lab background**

Preserve the Lab scan-line feeling by layering a lightweight scan overlay over the shared background:

```tsx
"use client";

import { AppStarfieldBackground } from "./app-starfield-background";

export function LabBackground() {
  return (
    <>
      <AppStarfieldBackground variant="lab" />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(180deg,transparent_0%,rgba(92,205,229,0.035)_50%,transparent_100%)] opacity-70"
      />
    </>
  );
}
```

If the animated Lab canvas is important, keep it but reduce particle opacity so it does not compete with the shared starfield.

**Step 5: Run lint and build**

Run:

```powershell
npm run lint
npm run build
```

Expected: pass or only unrelated pre-existing failures.

**Step 6: Commit**

```powershell
git add apps/web/src/components/backgrounds/app-starfield-background.tsx apps/web/src/components/backgrounds/mine-background.tsx apps/web/src/components/backgrounds/vault-background.tsx apps/web/src/components/backgrounds/lab-background.tsx
git commit -m "style: unify app starfield backgrounds"
```

---

## Task 4: Convert App Shell To Desktop Rail Layout

**Files:**

- Modify: `apps/web/src/app/(app)/app-shell.tsx`
- Modify: `apps/web/src/components/shared/app-header.tsx`

**Step 1: Refactor `AppShell` structure**

Change the top-level shell from a simple column to a desktop frame:

```tsx
return (
  <div className="relative flex min-h-full overflow-hidden bg-bg-deep text-text-primary">
    <div className="hidden md:flex">
      <DesktopRail />
    </div>

    <div className="flex min-w-0 flex-1 flex-col">
      <AppHeader user={user} profile={profile} />
      <main className="relative flex min-h-0 flex-1 flex-col">{children}</main>
    </div>

    {profile?.role === "admin" && <AdminFab profile={profile} />}
  </div>
);
```

Create `DesktopRail` in the same file first to avoid premature abstraction. Extract later only if it grows.

**Step 2: Add rail navigation**

Use `usePathname()` and lucide icons:

```tsx
import { Archive, FlaskConical, LayoutDashboard, Pickaxe, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
```

Rail items:

```tsx
const RAIL_ITEMS = [
  { href: "/mine", label: "Mine", icon: Pickaxe },
  { href: "/vault", label: "Vault", icon: Archive },
  { href: "/lab", label: "Lab", icon: FlaskConical },
] as const;
```

Use compact icon-first buttons with `title` and visible labels where space allows:

```tsx
<Link
  href={item.href}
  title={item.label}
  className={[
    "group relative flex h-14 w-full items-center justify-center border-l-2 transition-all duration-200",
    isActive
      ? "border-cold-cyan bg-cold-cyan/10 text-cold-cyan"
      : "border-transparent text-text-secondary/60 hover:bg-surface-1/50 hover:text-cold-cyan",
  ].join(" ")}
>
  <Icon className="h-5 w-5" />
  <span className="sr-only">{item.label}</span>
</Link>
```

**Step 3: Keep mobile header behavior**

Do not remove the current header navigation for mobile. Hide desktop top nav links on `md` and above once the rail exists.

**Step 4: Restyle AppHeader**

Make it match the example desktop header:

```tsx
<header className="sticky top-0 z-30 h-[var(--desktop-header-height)] border-b border-line-steel/55 bg-bg-deep/72 px-4 backdrop-blur-xl sm:px-6">
```

Keep `StatusRail` only if it still helps. If it adds too much rounded-card chrome, replace with a flat flex row inside the header.

**Step 5: Run lint**

Run:

```powershell
npm run lint
```

Expected: pass.

**Step 6: Manual check**

Start dev server:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000/mine
```

Expected desktop behavior:

- Left rail visible at desktop width.
- Top header visible.
- Existing content still renders.
- Guest access still works.
- No horizontal overflow.

**Step 7: Commit**

```powershell
git add apps/web/src/app/\(app\)/app-shell.tsx apps/web/src/components/shared/app-header.tsx
git commit -m "style: add desktop app rail shell"
```

---

## Task 5: Redesign Mine Top-Level Desktop Screen

**Files:**

- Modify: `apps/web/src/app/(app)/mine/mine-client.tsx`

**Step 1: Reframe content width and page chrome**

Change the page content wrapper to a desktop instrument composition:

```tsx
<div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
  <div className="mx-auto w-full max-w-7xl space-y-5">
```

**Step 2: Restyle `PageHeader` usage**

Keep the existing props, but pass a class that creates a flatter instrument header:

```tsx
<PageHeader
  className="border-b border-line-steel/45 pb-5"
  eyebrow="ACTIVE VEINS"
  title="Mine Idea Ores"
  subtitle="Select one live keyword vein, extract short ores, and save the strongest signals."
  ...
/>
```

**Step 3: Restyle vein selection panel**

Replace rounded-xl heavy cards with sharper bordered panels:

```tsx
className={[
  "relative flex min-h-36 flex-col overflow-hidden border p-4 text-left transition-all duration-200",
  isSelected
    ? "border-cold-cyan bg-cold-cyan/10 text-text-primary shadow-[0_0_24px_rgba(92,205,229,0.12)]"
    : "border-line-steel/45 bg-bg-base/48 hover:border-cold-cyan/50 hover:bg-surface-1/58",
].join(" ")}
```

Use `rounded-md` or no radius. Add a slim active line for selected state:

```tsx
{isSelected && <span className="absolute inset-x-0 top-0 h-px bg-cold-cyan" />}
```

**Step 4: Restyle action buttons**

Make cyan the default instrument accent. Keep pink only for the primary mining signal if desired:

```tsx
? "border-cold-cyan/55 bg-cold-cyan/12 text-cold-cyan hover:bg-cold-cyan/18"
```

For `Mine Ores`, use either cyan or a restrained pink signal:

```tsx
? "border-signal-pink/45 bg-signal-pink/10 text-text-primary hover:bg-signal-pink/16 hover:shadow-[0_0_24px_rgba(255,59,147,0.18)]"
```

**Step 5: Restyle Ore cards**

Update `OreCard` to use the shared instrument utilities:

```tsx
<article className="desktop-instrument-surface relative overflow-hidden rounded-md p-5">
```

Move tags from rounded pills toward small bordered labels:

```tsx
className="border border-line-steel/45 bg-bg-base/45 px-2 py-1 text-[11px] uppercase tracking-[0.08em] text-text-secondary"
```

**Step 6: Run lint and build**

Run:

```powershell
npm run lint
npm run build
```

Expected: pass.

**Step 7: Visual check**

Open `/mine` at desktop width.

Expected:

- Starfield remains clearly visible in empty regions.
- Content is readable.
- Selected vein has clear cyan state.
- Mining primary action is visible but not a large candy-colored fill.

**Step 8: Commit**

```powershell
git add apps/web/src/app/\(app\)/mine/mine-client.tsx
git commit -m "style: redesign desktop mine screen"
```

---

## Task 6: Redesign Vault Top-Level Desktop Screen

**Files:**

- Modify: `apps/web/src/app/(app)/vault/vault-client.tsx`
- Modify: `apps/web/src/components/vault/skeleton-card.tsx` if skeletons clash visually

**Step 1: Change page rhythm**

Use a flatter archive layout:

```tsx
<div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
  <div className="mx-auto w-full max-w-7xl space-y-5">
```

**Step 2: Restyle `VaultOreCard`**

Use archive rows or dense cards. Recommended first pass: dense cards in a bordered grid:

```tsx
className="group desktop-instrument-flat relative flex min-h-60 flex-col overflow-hidden rounded-md p-5 transition-all duration-200 hover:border-cold-cyan/50 hover:bg-surface-1/70"
```

Add a hover left signal line:

```tsx
<span className="absolute bottom-0 left-0 top-0 w-px bg-cold-cyan opacity-0 transition-opacity group-hover:opacity-100" />
```

**Step 3: Reduce pink usage**

Do not use pink on Vault cards unless an item is in a special alert state. Use cyan for "Open in Web Lab".

**Step 4: Restyle empty state action**

Use a flat cyan-bordered button:

```tsx
className="inline-flex items-center gap-2 border border-cold-cyan/45 bg-cold-cyan/10 px-5 py-2.5 text-sm font-medium text-cold-cyan transition-all hover:bg-cold-cyan/16"
```

**Step 5: Run lint and build**

Run:

```powershell
npm run lint
npm run build
```

Expected: pass.

**Step 6: Visual check**

Open `/vault` at desktop width.

Expected:

- Archive content is calmer than Mine.
- Starfield still visible around and between panels.
- Cards/lists scan cleanly.
- Tags and metadata do not overflow.

**Step 7: Commit**

```powershell
git add apps/web/src/app/\(app\)/vault/vault-client.tsx apps/web/src/components/vault/skeleton-card.tsx
git commit -m "style: redesign desktop vault screen"
```

---

## Task 7: Redesign Lab Top-Level Desktop Screen

**Files:**

- Modify: `apps/web/src/app/(app)/lab/lab-client.tsx`
- Modify: `apps/web/src/components/lab/skeleton-row.tsx` if skeletons clash visually

**Step 1: Use analytical page frame**

Change wrapper to match Mine/Vault:

```tsx
<div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
  <div className="mx-auto w-full max-w-6xl space-y-5">
```

**Step 2: Restyle Lab rows**

Use flat rows with left status markers:

```tsx
className="group desktop-instrument-flat relative flex items-center justify-between gap-4 overflow-hidden rounded-md p-4 transition-all duration-200 hover:border-cold-cyan/50 hover:bg-surface-1/70"
```

Add left cyan marker on hover:

```tsx
<span className="absolute bottom-0 left-0 top-0 w-px bg-cold-cyan opacity-0 transition-opacity group-hover:opacity-100" />
```

**Step 3: Restyle Projectize badge**

Make it read as a tool control:

```tsx
className="shrink-0 border border-cold-cyan/35 bg-cold-cyan/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cold-cyan"
```

**Step 4: Keep document readability first**

If the starfield competes with text, increase row background opacity before reducing the global background.

**Step 5: Run lint and build**

Run:

```powershell
npm run lint
npm run build
```

Expected: pass.

**Step 6: Visual check**

Open `/lab` at desktop width.

Expected:

- Lab feels analytical and calmer than Mine.
- Rows are readable.
- Background still connects visually to Mine and Vault.

**Step 7: Commit**

```powershell
git add apps/web/src/app/\(app\)/lab/lab-client.tsx apps/web/src/components/lab/skeleton-row.tsx
git commit -m "style: redesign desktop lab screen"
```

---

## Task 8: Desktop Detail Route Pass

**Files:**

- Inspect and modify only if visually broken:
  - `apps/web/src/app/(app)/mine/[veinId]/page.tsx`
  - `apps/web/src/app/(app)/vault/[ideaId]/page.tsx`
  - `apps/web/src/app/(app)/lab/[oreId]/page.tsx`
  - `apps/web/src/app/(app)/lab/overview/[ideaId]/page.tsx`
  - `apps/web/src/app/(app)/lab/full/[overviewId]/page.tsx`
  - `apps/web/src/app/(app)/lab/appraisal/[overviewId]/page.tsx`
  - `apps/web/src/app/(app)/lab/collection/[ideaId]/page.tsx`

**Step 1: Start with visual inspection**

Open each route that can render with mock/demo data. For protected or data-dependent pages, inspect code first and update only shared wrappers/classes that obviously clash with the new shell.

**Step 2: Apply minimal styling changes**

Use these rules:

- Replace large rounded panels with `desktop-instrument-surface` or `desktop-instrument-flat`.
- Keep max-width constraints for long documents.
- Increase foreground opacity on long-form text.
- Do not change data fetching, mutations, or navigation targets.

**Step 3: Run lint and build**

Run:

```powershell
npm run lint
npm run build
```

Expected: pass.

**Step 4: Commit**

```powershell
git add apps/web/src/app/\(app\)
git commit -m "style: align app detail routes with desktop shell"
```

Only commit files actually changed.

---

## Task 9: Desktop Responsive QA

**Files:**

- No required code changes unless QA finds issues.

**Step 1: Start dev server**

Run from `apps/web`:

```powershell
npm run dev
```

Expected:

```text
Local: http://localhost:3000
```

If port 3000 is occupied, use the port Next.js reports.

**Step 2: Check desktop routes**

Open:

```text
http://localhost:3000/mine
http://localhost:3000/vault
http://localhost:3000/lab
```

Check at:

- 1440 x 900
- 1280 x 800
- 1024 x 768

Expected:

- Left rail does not overlap content.
- Header does not wrap awkwardly.
- No horizontal scrolling.
- Starfield is visible but text remains readable.
- Buttons and labels fit their containers.
- Hover and active states are visible.

**Step 3: Check mobile has no accidental regressions**

Check at:

- 390 x 844

Expected:

- Desktop rail is hidden.
- Top/mobile navigation still works.
- Content is not clipped by shell changes.

**Step 4: Run final lint/build**

Run:

```powershell
npm run lint
npm run build
```

Expected: pass.

**Step 5: Commit fixes if needed**

```powershell
git add apps/web
git commit -m "fix: polish desktop observatory responsiveness"
```

Only commit if QA required changes.

---

## Final Acceptance Criteria

- Desktop app uses a left rail plus top header.
- `/mine`, `/vault`, and `/lab` share a continuous starfield environment.
- Mine remains the most signal-rich screen.
- Vault and Lab are calmer but still visibly part of the same world.
- Cyan is the dominant working accent.
- Pink is limited to high-priority signal states.
- No API or backend behavior changes.
- `npm run lint` passes or has only documented pre-existing failures.
- `npm run build` passes or has only documented pre-existing failures.
- Manual desktop QA passes at 1440, 1280, and 1024 widths.

