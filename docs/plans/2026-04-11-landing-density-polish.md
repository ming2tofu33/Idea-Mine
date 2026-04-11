# Landing Density Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Increase the visual hierarchy gap between the landing hero and the supporting sections so the page feels more intentional and less flat.

**Architecture:** Keep the current section order and copy structure, but rebalance density. Make the hero larger, airier, and more dominant. Make the middle sections lighter, shorter, and more supportive. End with a thinner return loop and a compact final CTA.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4

---

### Task 1: Strengthen The Hero

**Files:**
- Modify: `apps/web/src/components/landing/landing-hero.tsx`

**Step 1: Increase hero scale**

- Increase vertical padding around the hero section.
- Increase the hero headline footprint and whitespace.
- Give the hero left column slightly more breathing room.

**Step 2: Reduce hero clutter**

- Lower the prominence of the helper note.
- Slightly simplify the preview density without changing its core story.
- Keep the CTA area strong and readable.

### Task 2: Lighten The Supporting Sections

**Files:**
- Modify: `apps/web/src/components/landing/core-loop-preview.tsx`
- Modify: `apps/web/src/components/landing/product-proof.tsx`

**Step 1: Make `Why Today` slimmer**

- Reduce title scale.
- Shorten visual height.
- Present the three reasons as lighter supporting proof rather than a full feature block.

**Step 2: Keep the flow section structural**

- Reduce the headline and intro footprint.
- Tighten the spacing inside the step list.
- Make the right-side document rail feel more like a note than a second feature section.

### Task 3: Thin Out The Closing Sections

**Files:**
- Modify: `apps/web/src/components/landing/return-loop.tsx`
- Modify: `apps/web/src/components/landing/final-cta.tsx`

**Step 1: Turn the return loop into a slim band**

- Reduce headline size and section height.
- Keep the beats compact and easy to scan.

**Step 2: Make the final CTA decisive**

- Reduce explanatory copy footprint.
- Let the CTA button carry the action.

### Task 4: Verification

**Files:**
- Verify: `apps/web/src/components/landing/*.tsx`

**Step 1: Run lint**

Run:

```bash
cd apps/web
npx eslint "src/components/landing/*.tsx"
```

**Step 2: Run build**

Run:

```bash
cd apps/web
npm run build
```
