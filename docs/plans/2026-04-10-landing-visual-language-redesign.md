# Landing Visual Language Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refine the landing page into a cleaner observatory-style interface with stronger hierarchy, less copy noise, and clearer section rhythm.

**Architecture:** Keep the current Next.js landing composition and observatory design tokens, but simplify the page into four sections with distinct roles. The redesign should modify existing landing components rather than introduce a new page architecture, and it should intentionally defer Korean localization so visual decisions are not mixed with translation work.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, existing shared UI primitives

---

### Task 1: Remove the Extra Positioning Section

**Files:**
- Modify: `apps/web/src/app/page.tsx`
- Reference: `apps/web/src/components/landing/positioning-band.tsx`

**Step 1: Confirm where `PositioningBand` is mounted**

Run:

```bash
Get-Content apps/web/src/app/page.tsx
```

Expected: `PositioningBand` appears between `ProductProof` and `FinalCta`.

**Step 2: Remove the `PositioningBand` import and render**

Update `apps/web/src/app/page.tsx` so the landing page renders only:

- `LandingHero`
- `CoreLoopPreview`
- `ProductProof`
- `FinalCta`

Do not delete the component file yet.

**Step 3: Run lint**

Run:

```bash
cd apps/web
npm run lint
```

Expected: PASS with no unused import errors.

**Step 4: Commit**

```bash
git add apps/web/src/app/page.tsx
git commit -m "refactor(web): simplify landing page section structure"
```

### Task 2: Rebuild the Hero Hierarchy

**Files:**
- Modify: `apps/web/src/components/landing/landing-hero.tsx`
- Reference: `apps/web/src/components/shared/signal-button-styles.ts`

**Step 1: Write down the target hierarchy before editing**

The hero should read in this order:

1. headline
2. support sentence
3. primary CTA
4. preview
5. low-weight proof note

**Step 2: Replace abstract or decorative microcopy**

In `landing-hero.tsx`:

- remove or soften the eyebrow line if it is only decorative
- replace the headline with a result-led statement
- shorten the support paragraph to one direct sentence
- rewrite CTA labels into action language
- reduce or remove copy that repeats the same idea in different words

**Step 3: Simplify the preview panel**

Still in `landing-hero.tsx`:

- reduce empty visual ornamentation
- increase readable product cues
- keep the observatory frame, but make it feel more like a believable app preview

**Step 4: Run lint**

Run:

```bash
cd apps/web
npm run lint
```

Expected: PASS.

**Step 5: Manual QA**

Verify:

- the hero feels more strategic than theatrical
- the CTA is easier to notice than the surrounding chrome
- the preview supports the message instead of competing with it

**Step 6: Commit**

```bash
git add apps/web/src/components/landing/landing-hero.tsx
git commit -m "refactor(web): sharpen landing hero hierarchy and copy"
```

### Task 3: Simplify Core Loop Into One Clear Flow

**Files:**
- Modify: `apps/web/src/components/landing/core-loop-preview.tsx`

**Step 1: Audit repeated chrome in the current section**

Run:

```bash
Get-Content apps/web/src/components/landing/core-loop-preview.tsx
```

Expected: three similarly weighted cards connected by small separators.

**Step 2: Redesign the composition**

Update `core-loop-preview.tsx` so it reads as one connected workflow rather than three feature cards.

Implementation intent:

- keep `Mine -> Vault -> Lab`
- reduce repeated card framing
- use one stronger directional composition
- keep copy short and structural

**Step 3: Run lint**

Run:

```bash
cd apps/web
npm run lint
```

Expected: PASS.

**Step 4: Commit**

```bash
git add apps/web/src/components/landing/core-loop-preview.tsx
git commit -m "refactor(web): turn core loop into directional landing flow"
```

### Task 4: Recompose Product Proof for Credibility

**Files:**
- Modify: `apps/web/src/components/landing/product-proof.tsx`

**Step 1: Rebalance proof hierarchy**

Update `product-proof.tsx` so the section is not three equally weighted columns.

Implementation intent:

- make one slice dominant
- make the others support it
- keep proof grounded in believable UI detail
- reduce the feeling of marketing cards arranged in a grid

**Step 2: Remove unnecessary micro-labels and abstract section framing**

In the same file:

- reduce tiny uppercase labels where they do not help
- shorten section title and support copy
- keep the section focused on credibility

**Step 3: Run lint and build**

Run:

```bash
cd apps/web
npm run lint
npm run build
```

Expected: both PASS.

**Step 4: Manual QA**

Verify:

- `Product Proof` feels like real product evidence
- visual weight is asymmetrical on purpose
- the section no longer reads like a generic feature grid

**Step 5: Commit**

```bash
git add apps/web/src/components/landing/product-proof.tsx
git commit -m "refactor(web): improve landing product proof composition"
```

### Task 5: Turn the Final CTA Into a Clean Closing Beat

**Files:**
- Modify: `apps/web/src/components/landing/final-cta.tsx`

**Step 1: Tighten the section**

Update `final-cta.tsx` so it contains:

- one compact title
- one support sentence at most
- one strong primary action

Do not let it feel like another full feature panel.

**Step 2: Keep the observatory tone but reduce duplication**

Make the CTA feel like the final confident nudge, not a repeat of the hero promise.

**Step 3: Run lint**

Run:

```bash
cd apps/web
npm run lint
```

Expected: PASS.

**Step 4: Commit**

```bash
git add apps/web/src/components/landing/final-cta.tsx
git commit -m "refactor(web): simplify landing final call to action"
```

### Task 6: Final Verification Pass

**Files:**
- Verify: `apps/web/src/app/page.tsx`
- Verify: `apps/web/src/components/landing/landing-hero.tsx`
- Verify: `apps/web/src/components/landing/core-loop-preview.tsx`
- Verify: `apps/web/src/components/landing/product-proof.tsx`
- Verify: `apps/web/src/components/landing/final-cta.tsx`

**Step 1: Run the full checks**

Run:

```bash
cd apps/web
npm run lint
npm run build
```

Expected: PASS.

**Step 2: Manual QA checklist**

Check the landing page top to bottom and confirm:

- the hero has the clearest visual priority
- the page no longer feels like five similar cards in a stack
- the tone feels strategic and premium
- decorative microcopy is substantially reduced
- `Core Loop` explains structure
- `Product Proof` provides credibility
- `Final CTA` closes cleanly

**Step 3: Commit**

```bash
git add apps/web/src/app/page.tsx apps/web/src/components/landing
git commit -m "refactor(web): finalize landing visual language redesign"
```
