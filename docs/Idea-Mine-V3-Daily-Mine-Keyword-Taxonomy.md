# Idea Mine V3: Daily Mine Keyword Taxonomy

Updated: 2026-05-12

This document records the current V3 conclusion about how Daily Mine keywords should work.

The core product goal is not to generate polished startup ideas directly. Daily Mine should give users attractive keyword combinations, mine them into varied Idea Ores, and let users save the ores that feel worth opening in Web Lab.

## 1. Core Problem

The current keyword structure still behaves like the older startup idea generator.

The existing Vein generation uses categories such as:

- `who`
- `domain`
- `tech`
- `value`
- `money`

This structure is rational, but it closes the idea too early.

For example:

`Solo Traveler + Traveltech + Marketplace + Accuracy & Trust Improvement + Licensing`

This already implies a trust-oriented travel marketplace or licensing product. The LLM can vary the output shape, but most ores stay inside the same business idea.

For V3, this is the wrong pressure. Daily Mine keywords should create imaginative tension, not pre-decide the product category.

## 2. Working Principle

Daily Mine keywords should act as idea materials, not startup planning fields.

The visible Vein should feel like:

`cat + dream + loneliness + card archive + tiny ritual`

not:

`pet owner + consumer app + subscription + marketplace + retention`

The first kind of Vein opens imagination. The second kind asks the model to complete a business plan.

## 3. Recommended Vein Structure

Each Daily Vein should contain 5 visible keywords.

Those 5 keywords should have different internal roles:

1. `Subject`
   - A character, user, object, or concrete anchor.
   - Examples: `cat`, `solo traveler`, `old photo`, `plant`, `tiny desk`

2. `Material`
   - A sensory, symbolic, or world-building material.
   - Examples: `dream`, `weather`, `receipt`, `moon`, `map`, `letter`

3. `Tension`
   - An emotion, discomfort, desire, or unresolved pressure.
   - Examples: `loneliness`, `safety anxiety`, `nostalgia`, `unfinished thoughts`, `decision fatigue`

4. `Shape`
   - A buildable form, medium, or interaction surface.
   - Examples: `card archive`, `map diary`, `tiny widget`, `private collection`, `AI companion`

5. `Ritual / Constraint`
   - A usage pattern or strange rule that makes the idea feel specific.
   - Examples: `one-button log`, `daily ritual`, `no typing`, `only at night`, `3-minute check-in`

These role labels are internal. Users should see only keyword labels.

## 4. Ore Keyword Usage

A Vein can contain 5 keywords, but each Idea Ore should actively use only 3 to 4 of them.

This is important because forcing every Ore to use all 5 keywords makes the 10 ores too similar.

The Vein should work like a material tray. Each Ore picks a partial combination from that tray.

This should be controlled, not fully random.

Rules:

- Each Ore uses 3 to 4 `active_keywords`.
- The full 10-Ore set should use all 5 Vein keywords multiple times.
- Not every Ore should use the same dominant keyword.
- `Tension` should appear often because it gives the Ore emotional or practical pressure.
- `Shape` should not appear in every Ore because it can over-fix the product form.
- Ore cards may show only the active keyword labels used by that Ore.
- Category, role, subtype, lane, and other metadata stay hidden.

## 5. Hidden Ore Lanes

The 10 Idea Ores from one Vein should be distributed across hidden lanes:

1. Cozy Personal Lane: 3 ores
   - Emotional, cute, intimate, personal apps.
   - Examples: companion, ritual, archive, card, diary.

2. Indie Tool Lane: 3 ores
   - Weird but buildable tools for indie builders.
   - Examples: tiny utility, browser tool, desktop widget, personal system.

3. Practical Twist Lane: 3 ores
   - Real-world problems solved with a slight twist.
   - Examples: safety, memory, routine, travel, decision, trust.

4. Weird Bridge Lane: 1 ore
   - The oddest but still buildable bridge between the keywords.

These lanes are generation controls, not UI labels.

Users should just see 10 Idea Ores. The product should not label an ore as "Cozy Personal" or "Indie Tool" in the UI.

## 6. Example

Visible Vein:

`cat + dream + loneliness + card archive + tiny ritual`

Possible 10-Ore distribution:

| Lane | Active Keywords | Possible Ore Direction |
| --- | --- | --- |
| Cozy Personal | `cat + dream + card archive` | A soft dream-card collection guided by a cat character. |
| Cozy Personal | `cat + loneliness + tiny ritual` | A small daily ritual where a cat companion checks in with the user. |
| Cozy Personal | `dream + loneliness + card archive` | A private archive for lonely dreams and recurring symbols. |
| Indie Tool | `dream + card archive + tiny ritual` | A one-click dream tagging widget. |
| Indie Tool | `cat + card archive + tiny ritual` | A desktop tool that sorts notes through a cat-card metaphor. |
| Indie Tool | `loneliness + tiny ritual + card archive` | A personal emotional check-in system stored as cards. |
| Practical Twist | `dream + loneliness + tiny ritual` | A bedtime reflection app that reduces pre-sleep anxiety. |
| Practical Twist | `cat + loneliness + card archive` | A cute but practical loneliness pattern log. |
| Practical Twist | `dream + card archive + tiny ritual` | A recurring dream pattern tracker. |
| Weird Bridge | `cat + dream + loneliness + tiny ritual` | A dream cat that turns the user's mood into a tiny nightly ritual. |

## 7. What To Remove From Daily Mine Keywords

The following keyword types are not bad, but they belong later in Web Lab or Projectize:

- `Marketplace`
- `Licensing`
- `Subscription`
- `B2B SaaS`
- `API Service`
- `Dashboard`
- `Pay-per-use`
- `Ad-supported`
- `Compliance`
- `Enterprise`

These terms close the idea too early. They are useful for projectization, monetization, implementation planning, or blueprinting, but they make Daily Mine feel like a generic startup idea generator.

## 8. Product Conclusion

The V3 Daily Mine keyword system should move from:

`who + domain + tech + value + money`

to:

`Subject + Material + Tension + Shape + Ritual / Constraint`

The 10-Ore generation should move from:

`all ores use all Vein keywords`

to:

`each ore uses a controlled 3-4 keyword subset across hidden lanes`

This is now a core V3 direction:

`5 visible Vein keywords -> 10 Idea Ores -> 3 Cozy + 3 Indie Tool + 3 Practical Twist + 1 Weird Bridge`

## 9. Candidate Keyword Pool v1

This pool is intentionally small enough to review by hand.

The goal is not to maximize keyword count. The goal is to create a high-signal set of materials that can produce:

- emotional and cute personal apps
- weird but buildable indie tools
- practical real-life twists

All labels are written in English because they are user-visible keyword labels.

### Subject Candidates

Subjects should be concrete anchors: a user, object, character, place, or life scene.

The pool should lean practical without becoming business/market language.

Recommended first set:

- `solo traveler`
- `new city walker`
- `commuter`
- `working parent`
- `small apartment`
- `shared housemate`
- `receipt pile`
- `empty fridge`
- `medicine cabinet`
- `lost item`
- `appointment calendar`
- `family group chat`
- `unread manual`
- `messy downloads folder`
- `unfinished project`
- `late-night coder`
- `first-time creator`
- `tiny desk`
- `voice memo`
- `empty inbox`
- `overthinker`
- `old photo`
- `dream journaler`
- `cat`
- `houseplant`
- `book collector`
- `locked drawer`
- `night walker`
- `pocket map`
- `forgotten notebook`

Lower-priority or avoid for Daily Mine:

- `remote worker`: usable, but too generic.
- `pet owner`: weaker than a concrete animal/object such as `cat`.
- `small business owner`: likely pulls the model toward SaaS.
- `founder`: likely pulls the model toward startup ideation.

### Material Candidates

Materials should be tangible inputs, artifacts, signals, or sensory objects.

Good materials help the Ore become screenable and buildable.

Recommended first set:

- `receipt`
- `voice note`
- `old photo`
- `map pin`
- `calendar block`
- `screenshot`
- `bookmark`
- `packing list`
- `medicine label`
- `grocery list`
- `weather report`
- `train ticket`
- `bank alert`
- `warranty card`
- `user manual`
- `PDF stack`
- `browser tab`
- `downloaded file`
- `email thread`
- `family photo`
- `dream fragment`
- `moon phase`
- `tiny note`
- `route line`
- `sleep log`
- `QR code`
- `barcode`
- `plant leaf`
- `postcard`
- `mood color`

Avoid as Materials:

- `productivity`
- `wellness`
- `trust`
- `memory`
- `safety`
- `growth`
- `community`
- `market`
- `workflow`

These are too abstract. They may work as tensions, values, or projectization concepts, but they are not good Daily Mine materials.

### Tension Candidates

Tensions are the emotional or practical pressure that makes an Ore worth saving.

This is one of the most important keyword groups.

Recommended first set:

- `loneliness`
- `safety anxiety`
- `decision fatigue`
- `unfinished thoughts`
- `forgetfulness`
- `overwhelm`
- `nostalgia`
- `small guilt`
- `avoidance`
- `uncertainty`
- `low energy`
- `time blindness`
- `lost context`
- `messy backlog`
- `waiting anxiety`
- `fear of forgetting`
- `hard to start`
- `hard to stop`
- `quiet panic`
- `social friction`
- `not knowing what matters`
- `repeating mistakes`
- `private worry`
- `mental clutter`
- `tiny chaos`
- `unread pressure`
- `packing stress`
- `schedule drift`
- `memory fading`
- `decision regret`

Especially strong cross-lane tensions:

- `lost context`
- `fear of forgetting`
- `not knowing what matters`
- `tiny chaos`
- `unfinished thoughts`

Avoid as Tensions:

- `growth`
- `success`
- `monetization`
- `efficiency`
- `engagement`
- `retention`
- `trust improvement`
- `productivity boost`

These are too close to business value language and tend to produce generic startup ideas.

### Shape Candidates

Shapes are buildable forms, media, or interaction surfaces.

Shape is powerful but dangerous. If every Ore overuses the Shape keyword, the 10 ores collapse into one product form.

Recommended first set:

- `card archive`
- `map diary`
- `tiny widget`
- `AI companion`
- `private collection`
- `desktop tray app`
- `browser extension`
- `new tab page`
- `checklist card`
- `timeline view`
- `daily deck`
- `symbol cards`
- `map layer`
- `memory box`
- `ritual tracker`
- `micro journal`
- `sorting tray`
- `file inbox`
- `mini calendar`
- `notification digest`
- `packing board`
- `receipt vault`
- `voice inbox`
- `photo capsule`
- `calm checklist`
- `decision wheel`
- `local-first vault`
- `printable sheet`
- `lock screen note`
- `one-page dashboard`

Use with limits:

- `AI companion`: useful, but too much of it turns every Ore into a chatbot.
- `one-page dashboard`: acceptable only when kept small; plain `dashboard` should be avoided.
- `personal kanban`: useful for indie tools, but can become generic productivity software.

Avoid as Shapes:

- `marketplace`
- `enterprise dashboard`
- `B2B SaaS`
- `API platform`
- `subscription app`
- `social network`

These are too complete as product categories.

### Ritual / Constraint Candidates

Ritual / Constraint keywords define how or when the idea is used.

This group gives the idea specificity, reduces MVP scope, and often makes the output more memorable.

Recommended first set:

- `one-button log`
- `only at night`
- `3-minute check-in`
- `no typing`
- `daily ritual`
- `weekly reset`
- `before sleep`
- `after the trip`
- `on the way home`
- `when opening a new tab`
- `when closing the laptop`
- `after taking a photo`
- `after a receipt scan`
- `before leaving home`
- `when anxiety spikes`
- `one card per day`
- `only three choices`
- `local-only`
- `offline-first`
- `no account needed`
- `private by default`
- `auto-delete after 7 days`
- `save only favorites`
- `one tiny task`
- `one question at a time`
- `morning preview`
- `evening recap`
- `two-minute sort`
- `voice first`
- `camera first`
- `keyboard only`
- `single screen only`
- `works without internet`
- `one folder only`
- `three saved items max`

Avoid as Ritual / Constraint:

- `growth hacking`
- `monetization`
- `viral sharing`
- `enterprise workflow`
- `team collaboration`
- `subscription upgrade`
- `marketplace matching`

These are business strategies, not Daily Mine usage constraints.

## 10. Candidate Review Criteria

Every candidate keyword should pass most of these checks:

1. It opens ideas instead of closing them.
2. It is concrete enough to imagine a screen, object, action, or loop.
3. It can work in at least two hidden lanes.
4. It does not force a generic SaaS, marketplace, dashboard, or business model.
5. It feels attractive enough to appear on a Daily Mine card.
6. It can contribute to a buildable MVP after Projectize.

Useful questions:

- Could this keyword produce both a cozy app and a practical tool?
- Does this keyword invite a specific user action?
- Would a user feel curious when seeing it in a Vein?
- Does it sound like an idea material, not a business plan field?

## 11. Example Test Veins

These are draft Veins for manual validation before implementation.

Each Vein uses:

`Subject + Material + Tension + Shape + Ritual / Constraint`

### Cozy-Leaning

`cat + dream fragment + loneliness + card archive + only at night`

Expected range:

- dream card collection
- lonely-night companion ritual
- recurring symbol archive
- small bedtime reflection tool

### Indie Tool-Leaning

`messy downloads folder + screenshot + lost context + tiny widget + two-minute sort`

Expected range:

- screenshot triage widget
- download cleanup ritual
- local context-restoration tool
- tiny file inbox

### Practical-Leaning

`working parent + calendar block + decision fatigue + calm checklist + 3-minute check-in`

Expected range:

- family schedule reducer
- daily prep checklist
- decision fatigue assistant
- one-screen parent planning ritual

### Travel / Safety-Leaning

`solo traveler + map pin + safety anxiety + map diary + offline-first`

Expected range:

- offline safety map diary
- route confidence cards
- travel memory and check-in tool
- private trip archive

### Memory-Leaning

`old photo + voice note + memory fading + photo capsule + one question at a time`

Expected range:

- family memory capsule
- voice-guided photo annotation
- gentle archive ritual
- memory preservation tool

### Practical Weird

`medicine cabinet + medicine label + fear of forgetting + checklist card + one-button log`

Expected range:

- medication reassurance card
- family cabinet tracker
- no-typing health routine
- small verification ritual

## 12. Implementation Notes For Later

Do not implement this taxonomy by simply renaming the old categories.

The old categories and the new roles have different product purposes:

- Old: `who + domain + tech + value + money`
- New: `Subject + Material + Tension + Shape + Ritual / Constraint`

Future implementation should likely:

1. Add or migrate Daily Mine keyword role metadata.
2. Keep public keyword responses limited to `id` and `label`.
3. Generate each Vein with one keyword from each new role.
4. Generate each Ore with a controlled 3-4 keyword subset.
5. Add hidden `ore_lane` metadata for `Cozy Personal`, `Indie Tool`, `Practical Twist`, and `Weird Bridge`.
6. Keep lane and role metadata hidden from the UI.
7. Add validation to prevent overuse of the same active keyword, shape, product form, or AI companion pattern.

