# Landing Copy And Layout Design

**Date:** 2026-04-10

**Scope:** `apps/web/src/components/landing/*`, landing copy in `apps/web/src/components/landing/landing-labels.ts`, and landing assembly in `apps/web/src/app/page.tsx`

**Decision:** Reposition the landing page around a simple promise for solo founders: discover new ideas daily, then turn the strongest idea into an execution document. The page should feel calm and strategic first, while still creating a reason to come back tomorrow.

---

## Goal

The landing page should help a first-time visitor quickly understand what IDEA MINE does, and it should also make the product feel worth revisiting every day. The page must stay simple, readable, and premium. It should not feel like a themed concept page or a generic feature-grid SaaS page.

## Audience

- Primary audience: solo founders who are repeatedly looking for new product ideas
- Core mindset: "Show me something worth exploring today"
- Desired outcome: "If I find something interesting, help me turn it into a document I can actually use"

## Positioning

The landing page should not lead with abstract internal language like `signal`.

The page should lead with:

- `ideas` as the main user-facing concept
- `execution documents` as the differentiator
- `daily discovery` as the revisit reason

Internal or supporting UI labels may still use observatory/world-building language in a low-key way, but the main message should stay concrete.

## Approved Core Promise

**Primary promise:** `매일 새로운 아이디어를 발견하고, 바로 실행 문서로 정리하세요.`

This headline works because it combines:

- the revisit loop: `매일 새로운 아이디어를 발견하고`
- the product value: `바로 실행 문서로 정리하세요`

## Messaging Principles

- Simplicity over lore
- Clear user benefit over internal metaphors
- Revisit motivation first, product explanation second
- Calm and strategic tone over hype
- One idea per section

## Tone

The tone should feel like:

- a calm strategy desk
- a product for serious solo builders
- quietly confident rather than theatrical

The page should not sound:

- overly poetic
- overly game-like
- overly startup-hype

## Page Flow

### 1. Hero

Purpose:

- say what the product does in one line
- create curiosity about today's ideas
- show that promising ideas can become execution documents

Content intent:

- headline
- one short support paragraph
- primary CTA: today’s ideas
- secondary CTA: how it works
- one believable preview showing a promising idea becoming a document path

### 2. Why Look Today

Purpose:

- explain why this is worth checking now, not someday

Content intent:

- 3 concise reasons only
- no big feature grid
- should feel like a slim proof strip, not a full section of cards

### 3. From Idea To Document

Purpose:

- explain the core product flow

Content intent:

- discover
- save
- turn into a document

This should be the simplest explanation section on the page.

### 4. Return Loop

Purpose:

- create a reason to revisit tomorrow

Content intent:

- tomorrow brings new ideas
- yesterday’s best idea can continue into documentation
- the page should imply an ongoing loop, not a one-time browse

### 5. Final CTA

Purpose:

- close with one clear action

Content intent:

- short
- direct
- no extra explanation

## Layout Direction

- Hero is the largest and most visually dominant section
- `Why Look Today` should be short and light
- `From Idea To Document` should be the cleanest structural section
- `Return Loop` should be emotionally persuasive but compact
- `Final CTA` should feel like a short closing band, not another feature section

Section rhythm should be:

- strong
- light
- structural
- emotional
- decisive

## Visual Direction

- Keep the dark observatory background
- Keep the restrained near-black navy theme
- Reduce repeated card metaphors
- Prefer lines, rails, bands, and editorial spacing
- Let the background breathe more
- Use very light surface veils only where readability needs support

## Copy Direction

- Replace all unclear or abstract landing copy
- Avoid `signal` in main headlines and main section titles
- Prefer Korean that feels natural and spoken, not translated
- Keep sentences short enough for mobile scanning
- Use active, specific verbs: `발견하다`, `고르다`, `정리하다`, `이어가다`

## Success Criteria

- A new visitor understands the product in under 5 seconds
- The page feels simpler and more premium than the current version
- The daily revisit loop is clearly visible
- The execution-document value is clearly visible
- The landing page feels designed for solo founders, not a generic SaaS audience
