# Prompt Quality Checklist

**Date:** 2026-04-11

**Scope:** `backend/app/prompts/*`, `backend/app/services/*`, `backend/app/routers/*`, and the web/mobile lab flow that exposes these outputs

**Decision:** We will improve prompt quality one stage at a time with a fixed checklist and a stable evaluation loop. The core production chain to optimize first is:

`Mining -> Overview (Concept + Overview) -> Appraisal -> Product Design -> Blueprint -> Roadmap`

`Full Overview` will be treated as a separate export-style document track and improved after the core chain is stable.

---

## Actual Flow

- `Mining` creates idea title + summary.
- `Overview` is already a 2-step pipeline: `concept -> overview`.
- `Appraisal` is currently a separate step, not a hard quality gate.
- `Product Design -> Blueprint -> Roadmap` is a separate implementation chain.
- `Full Overview` is not the parent of `Blueprint` or `Roadmap`; it is a parallel deep document.

## How We Improve

For every stage, we use the same loop:

1. Lock the target quality bar for the stage.
2. Prepare 5-10 representative test cases.
3. Capture the current output as baseline.
4. Score the output against the checklist below.
5. Change only one prompt or one prompt block at a time.
6. Compare before/after on the same cases.
7. Keep the change only if quality clearly improves without breaking consistency.

## Shared Quality Bar

Every stage should pass these shared checks:

- [ ] Output is concrete, not vague.
- [ ] Output stays faithful to the upstream concept and does not drift.
- [ ] Output avoids buzzwords, filler adjectives, and generic SaaS phrasing.
- [ ] Output gives the reader something they can immediately understand or act on.
- [ ] Output does not fabricate market data, pricing, or competitor facts.
- [ ] Output matches the schema cleanly without awkward stuffing.
- [ ] Korean reads naturally, not like a translation artifact.
- [ ] English and Korean say the same thing when both are present.

## Improvement Order

- [ ] 1. Mining quality
- [ ] 2. Concept anchor quality
- [ ] 3. Overview section quality
- [ ] 4. Appraisal quality
- [ ] 5. Product design quality
- [ ] 6. Blueprint quality
- [ ] 7. Roadmap quality
- [ ] 8. Full overview quality

---

## 1. Mining Quality Checklist

**Goal:** The user should instantly feel that the generated idea list is specific, memorable, and meaningfully diverse.

### Acceptance checks

- [ ] Title is memorable after one quick read.
- [ ] Title contains a concrete noun, action, object, or recognizable domain signal.
- [ ] Title avoids generic AI/SaaS wording.
- [ ] Summary clearly contains `who + action`, `difference`, and `outcome`.
- [ ] Summary describes what the user does, not what the system provides.
- [ ] At least 4 of 10 ideas feel clearly different in problem or format.
- [ ] At least 2 of 10 ideas feel pleasantly surprising.
- [ ] At least 2 of 10 ideas feel immediately buildable.
- [ ] No idea feels like a renamed duplicate of another.

### Failure signs

- [ ] Titles feel interchangeable.
- [ ] Summaries repeat the same sentence frame.
- [ ] Too many ideas default to "AI recommendation app".
- [ ] Revenue model leaks into the product summary.

## 2. Concept Anchor Quality Checklist

**Goal:** The concept step should lock the product direction tightly enough that downstream prompts stop drifting.

### Acceptance checks

- [ ] `concept` follows the intended template exactly.
- [ ] AI is mentioned only when the input keywords actually justify it.
- [ ] `primary_user` is one clear user, not a crowd or mixed persona.
- [ ] `core_experience` describes the first 30 seconds of use as an action.
- [ ] The concept is specific enough that a PM and designer would imagine the same product.
- [ ] The concept is narrow enough to constrain overview/design/blueprint outputs.

### Failure signs

- [ ] Concept reads like a market description instead of a product.
- [ ] `primary_user` changes downstream.
- [ ] `core_experience` is abstract or system-centric.

## 3. Overview Section Quality Checklist

**Goal:** The overview should be the first document that feels worth keeping, not just a filler bridge.

### Acceptance checks

- [ ] `concept_ko` and `concept_en` exactly echo the concept anchor.
- [ ] `problem` describes current behavior, frequency, and failure of the workaround.
- [ ] `target` describes one person in one real moment, not a market segment paragraph.
- [ ] `features` are screen/action/result oriented, not feature-label fluff.
- [ ] `differentiator` names real alternatives or believable comparison points.
- [ ] `revenue` includes concrete monetization logic, not just "subscription model".
- [ ] `mvp_scope` clearly separates in-scope and out-of-scope.
- [ ] The whole overview feels internally consistent as one product.

### Failure signs

- [ ] Problem already contains the solution.
- [ ] Features sound like investor copy instead of product behavior.
- [ ] Differentiator is generic "better personalization".
- [ ] MVP scope is just a summary of the same features again.

## 4. Appraisal Quality Checklist

**Goal:** Appraisal should feel like a sharp product review that changes a founder's thinking.

### Acceptance checks

- [ ] Each dimension takes a clear stance.
- [ ] Each comment includes a reason, evidence, or comparison.
- [ ] Each comment is actionable for the founder.
- [ ] Appraisal adds a real judgment layer instead of restating the overview.
- [ ] Tone is honest and sharp without becoming empty negativity.
- [ ] No hidden scoring language or vague hedge words dominate the text.

### Failure signs

- [ ] It feels like generic consultant language.
- [ ] It repeats the overview in different words.
- [ ] It is all "could", "might", "maybe" with no conclusion.

## 5. Product Design Quality Checklist

**Goal:** Product design should tell a designer or PM exactly what to build at the user-experience layer.

### Acceptance checks

- [ ] Every `Must` feature appears in the user flow.
- [ ] Every screen in `screens` is used by the user flow.
- [ ] `Must`, `Should`, and `Later` are clearly separated with no duplicates.
- [ ] Each feature line contains user action and outcome.
- [ ] Business rules are constraints, not disguised features.
- [ ] MVP scope is realistic and consistent with the `Must` list.
- [ ] The document reads like product specification, not tech planning.

### Failure signs

- [ ] User flow is too vague to storyboard.
- [ ] Screens are just page names with no behavior.
- [ ] Business rules repeat monetization or features loosely.

## 6. Blueprint Quality Checklist

**Goal:** Blueprint should let an engineer start implementation without inventing missing structure.

### Acceptance checks

- [ ] Every `Must` feature maps to at least one endpoint.
- [ ] Every endpoint maps to a table or explicit data object.
- [ ] Table design is minimal but sufficient for MVP.
- [ ] File structure names real files, not placeholder folders only.
- [ ] External services include a purpose and env var.
- [ ] Auth flow covers signup, login, token, and tier logic.
- [ ] The blueprint matches product design exactly and does not invent new product scope.

### Failure signs

- [ ] Endpoint list is generic CRUD with no feature linkage.
- [ ] SQL is over-designed for MVP.
- [ ] File structure is too abstract to scaffold from.

## 7. Roadmap Quality Checklist

**Goal:** Roadmap should feel executable by a small team, not like a generic three-phase template.

### Acceptance checks

- [ ] Phase 0 contains only foundation work.
- [ ] Phase 1 contains `Must` features in dependency order.
- [ ] Phase 2 contains launch polish, later features, and deployment work.
- [ ] Validation checkpoints are concrete and testable.
- [ ] Estimated complexity matches the real scope.
- [ ] First sprint tasks are specific enough to paste into an AI coding tool.
- [ ] Tasks follow a believable build order from schema/auth/layout to feature logic.

### Failure signs

- [ ] Phase names look right but tasks are generic.
- [ ] Validation checkpoints say nothing observable.
- [ ] First sprint tasks are too broad to start coding from.

## 8. Full Overview Quality Checklist

**Goal:** Full overview should be a genuinely useful export document, not a duplicated mash-up of overview/design/blueprint.

### Acceptance checks

- [ ] It clearly deepens the overview instead of repeating it.
- [ ] Narrative and technical sections stay consistent with each other.
- [ ] Feature categorization is stronger than the light overview, not just longer.
- [ ] User flow, screens, API, data model, and auth flow align.
- [ ] The self-critique/regeneration path improves weak outputs meaningfully.
- [ ] The final document feels usable as a handoff doc.

### Failure signs

- [ ] It duplicates product design and blueprint with different wording only.
- [ ] It becomes long without becoming clearer.
- [ ] Technical sections are generic because the narrative section is weak.

---

## Baseline Evaluation Sheet

Use this for each stage before editing prompts:

### Stage

- [ ] Stage identified
- [ ] Current prompt version recorded
- [ ] 5-10 test cases selected

### Output Review

- [ ] Best output example saved
- [ ] Worst output example saved
- [ ] Repeated failure pattern noted
- [ ] One high-impact prompt change proposed

### After Prompt Change

- [ ] Same test cases rerun
- [ ] Before/after difference summarized
- [ ] Improvement confirmed
- [ ] New regression checked
- [ ] Prompt version bumped or change logged

## Working Rule

We do not improve all prompts at once.

We move in this order:

1. Fix the earliest stage that damages downstream quality.
2. Re-check downstream outputs before touching the next stage.
3. Only then move to the next checklist item.

## Recommended First Pass

Start here:

- [ ] Mining: title memorability + idea diversity
- [ ] Concept/Overview: anchor consistency + feature concreteness

These two stages influence almost every downstream document, so improving them first should have the highest leverage.
