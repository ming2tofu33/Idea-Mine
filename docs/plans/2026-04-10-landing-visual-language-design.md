# Landing Visual Language Design

**Date:** 2026-04-10

**Scope:** `apps/web/src/app/page.tsx` and landing-only sections in `apps/web/src/components/landing/*`

**Decision:** Use `A1. Pure A / 정제된 Observatory` as the primary direction, but reduce copy noise and make the tone more strategic than theatrical.

---

## Goal

The landing page should feel like a premium observatory interface without reading like a concept demo. The visual system stays dark, cinematic, and atmospheric, but the message becomes sharper, more product-led, and easier to scan.

This redesign is intentionally narrow. It does not solve Korean localization yet. It defines the visual language and section behavior for the landing page first.

## Approved Direction

- Keep the observatory world and dark theme.
- Keep the split hero and product-preview feeling.
- Remove visual and verbal excess.
- Replace decorative microcopy with clear product language.
- Make the page feel more strategic, more confident, and less like a themed showcase.

## Tone

The tone is `단단하고 전략적`.

That means:

- Headlines should promise a result, not describe an atmosphere.
- Support copy should explain the product in one direct sentence.
- Buttons should sound actionable, not cinematic.
- Section titles should describe outcomes, workflow, or proof.

## Message Principles

- The hero should contain one promise, one support sentence, and one primary CTA.
- Small eyebrow labels should be removed unless they truly improve orientation.
- Repeated ideas should be collapsed. The same story should not be restated in slightly different language across multiple sections.
- Abstract labels like `Product Proof`, `Positioning`, and `Ready to enter` should be replaced with more concrete language.
- The page should say what the user gets, how it works, and where to click next.

## Hero Structure

The hero remains a split composition.

### Left Side

- One strong headline
- One concise supporting sentence
- One primary CTA
- Optional low-weight secondary CTA
- One short proof or onboarding note below the CTA

### Right Side

- Keep the observatory-style product frame
- Reduce empty ornamentation
- Increase legible product cues
- Make the preview reinforce the promise instead of competing with it

### Hero Content Intent

The hero must answer three questions quickly:

1. What does this product do?
2. Why is it different from a generic idea capture tool?
3. What should I do now?

## Section Rhythm

The landing page should have fewer sections and each one should have a different job.

### Final Section Order

1. Hero
2. Core Loop
3. Product Proof
4. Final CTA

### Removed Section

`PositioningBand` should be removed or its strongest sentence should be absorbed into the hero support copy.

### Rhythm Rules

- Hero: most spacious, strongest promise
- Core Loop: simplest section, structural explanation only
- Product Proof: highest interface density, strongest credibility
- Final CTA: shortest and cleanest closing beat

The current problem is not lack of content. It is repeated card weight, repeated chrome, and repeated abstract language. The redesign should create contrast between sections.

## Visual Rules

- Keep the existing observatory palette and background family.
- Use fewer repeated framed cards.
- Let at least one section feel less boxed-in than the others.
- Reduce tiny uppercase labels and excessive tracking.
- Preserve atmospheric lighting, but lower the amount of chrome that competes with content.
- Give headline, CTA, and preview a clearer hierarchy than the surrounding decorative detail.

## What This Redesign Does Not Cover Yet

- Korean localization
- Font replacement for Korean support
- KO/EN content parity across the landing page

Those should be handled as a follow-up once the visual language is stable.
