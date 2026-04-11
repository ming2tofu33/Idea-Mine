# Landing Copy And Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the landing page copy and section layout so solo founders understand the product quickly and feel motivated to return daily for new ideas.

**Architecture:** Keep the existing landing page entry and observatory background, but reassign section roles around a new message architecture: daily idea discovery first, execution-document value second. Replace the current landing copy source, simplify some sections, and repurpose others so the page reads like an editorial strategy desk instead of a feature gallery.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shared landing components, shared button styles

---

### Task 1: Replace The Landing Copy Source

**Files:**
- Modify: `apps/web/src/components/landing/landing-labels.ts`

**Step 1: Rewrite the landing labels**

Replace the current hero, section, and CTA copy with a new set based on these principles:

- lead with `아이디어`
- make daily revisit explicit
- make execution documents explicit
- remove unclear abstract language from primary copy

**Step 2: Keep labels aligned to section roles**

Update copy so each section matches the approved flow:

- Hero
- Why Look Today
- From Idea To Document
- Return Loop
- Final CTA

**Step 3: Verify copy consistency**

Check that:

- `signal` is not used in main headings
- verbs stay consistent
- Korean reads naturally on mobile

### Task 2: Recompose The Landing Sections Around The New Flow

**Files:**
- Modify: `apps/web/src/components/landing/landing-content.tsx`
- Modify: `apps/web/src/components/landing/core-loop-preview.tsx`
- Modify: `apps/web/src/components/landing/product-proof.tsx`
- Modify: `apps/web/src/components/landing/final-cta.tsx`

**Step 1: Reassign section roles**

Change the page flow to:

1. Hero
2. Why Look Today
3. From Idea To Document
4. Return Loop
5. Final CTA

**Step 2: Turn the current supporting sections into those roles**

- `CoreLoopPreview` becomes the clearest structural explanation section
- `ProductProof` becomes the strongest practical proof section
- `FinalCta` becomes shorter and more action-led

If needed, add or remove small section wrappers to make each section feel distinct.

### Task 3: Rebuild The Hero Around Daily Discovery

**Files:**
- Modify: `apps/web/src/components/landing/landing-hero.tsx`
- Reference: `apps/web/src/components/shared/signal-button-styles.ts`

**Step 1: Rewrite the hero message**

Implement the approved headline:

- `매일 새로운 아이디어를 발견하고, 바로 실행 문서로 정리하세요.`

Add one support sentence that:

- mentions finding promising ideas daily
- mentions turning strong ideas into briefs or follow-up documents

**Step 2: Adjust the hero preview**

Make the preview read as:

- today’s promising idea
- why it matters
- how it turns into the next document

The preview should support the hero promise, not introduce a competing story.

**Step 3: Align CTA hierarchy**

- Primary CTA should point to today’s ideas
- Secondary CTA should explain how the flow works

### Task 4: Add A Clear Return Loop

**Files:**
- Modify: `apps/web/src/components/landing/product-proof.tsx`
- Modify: `apps/web/src/components/landing/final-cta.tsx`

**Step 1: Make revisit value explicit**

At least one section below the hero should say, in plain language:

- new ideas appear again tomorrow
- strong ideas can continue into deeper documents

**Step 2: Keep it compact**

This section should feel like a reason to return, not a feature explanation block.

### Task 5: Polish Layout Rhythm For The New Message

**Files:**
- Modify: `apps/web/src/components/landing/landing-hero.tsx`
- Modify: `apps/web/src/components/landing/core-loop-preview.tsx`
- Modify: `apps/web/src/components/landing/product-proof.tsx`
- Modify: `apps/web/src/components/landing/final-cta.tsx`

**Step 1: Increase hierarchy differences**

- Hero should be visually strongest
- the "why today" section should be lighter and shorter
- the flow section should be clean and structural
- the revisit section should be emotionally legible but compact
- the final CTA should be shortest

**Step 2: Preserve readability**

Ensure:

- body text stays comfortable on mobile
- touch targets remain at least 44px tall
- the background still breathes behind sections

### Task 6: Verification

**Files:**
- Verify: `apps/web/src/components/landing/landing-labels.ts`
- Verify: `apps/web/src/components/landing/landing-content.tsx`
- Verify: `apps/web/src/components/landing/landing-hero.tsx`
- Verify: `apps/web/src/components/landing/core-loop-preview.tsx`
- Verify: `apps/web/src/components/landing/product-proof.tsx`
- Verify: `apps/web/src/components/landing/final-cta.tsx`
- Verify: `apps/web/src/components/shared/signal-button-styles.ts`

**Step 1: Run lint**

Run:

```bash
cd apps/web
npx eslint "src/components/landing/*.tsx" "src/components/shared/signal-button-styles.ts"
```

Expected: PASS.

**Step 2: Run production build**

Run:

```bash
cd apps/web
npm run build
```

Expected: PASS.

**Step 3: Manual QA checklist**

- Can a new visitor understand the product in 5 seconds?
- Does the page sound like natural Korean?
- Is the daily revisit reason obvious?
- Is the execution-document value obvious?
- Does the page feel simpler and more premium than the current version?
