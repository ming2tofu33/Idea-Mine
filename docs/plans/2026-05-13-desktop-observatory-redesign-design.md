# Desktop Observatory Redesign Design

**Date:** 2026-05-13

**Scope:** Desktop app UI for `apps/web/src/app/(app)/*`, especially the shared shell and the Mine, Vault, and Lab top-level screens.

**Decision:** Keep the existing animated starfield across the full app, and blend it with the denser instrument-style desktop UI shown in `example/*.html`.

---

## Goal

The desktop app should feel like one continuous IDEA MINE instrument, not a set of isolated pages. The current starfield remains part of the product identity across Mine, Vault, and Lab. The foreground UI shifts toward the example files: docked navigation, thin borders, dark transparent panels, compact headers, and cyan-led active states.

## Approved Direction

- Keep star twinkle and atmospheric depth across the entire app.
- Use the same visual world on Mine, Vault, and Lab.
- Move desktop navigation toward a left rail plus a top status header.
- Let the background remain visible through the layout instead of covering it with heavy opaque cards.
- Use cyan as the main technical accent.
- Keep pink for high-priority signal states only, such as selected veins or major mining actions.
- Start with desktop only. Mobile stays structurally unchanged unless a change is required to avoid regressions.

## Page-Specific Behavior

### Mine

Mine is the signature scene. It can keep the strongest visible atmosphere and signal energy. The foreground should feel like a live scanning station: active vein panels, selected states, mining actions, and extracted ores should sit on semi-transparent instrument surfaces.

### Vault

Vault should keep the starfield but make the archive content primary. The list/grid should be calmer, flatter, and more scannable than Mine. Cyan may indicate openable or active records. Pink should be rare.

### Lab

Lab should share the starfield world but lean analytical. Scan-line and grid motifs are appropriate, but they must not distract from document rows and generation states. Panels should be precise and readable.

## Layout Rules

- Desktop uses an app frame: left rail, top header, scrollable content area.
- Left rail contains primary navigation icons and labels for Mine, Vault, and Lab.
- Top header contains brand/status on the left and account/actions on the right.
- Main content uses transparent or translucent surfaces with steel borders.
- Avoid oversized rounded cards. Prefer 0 to 12px radii for app surfaces, with sharper panels than the current landing-style chrome.
- Keep readable content areas constrained, but do not create a single opaque page card that hides the starfield.

## Visual Rules

- Base surfaces: deep navy and blue-black.
- Structural lines: steel blue.
- Primary working accent: cyan.
- Signal accent: pink, only for important selected or generative states.
- Background intensity is consistent enough that every app page feels connected.
- Foreground opacity increases in reading-heavy regions.

## Non-Goals

- Do not redesign the landing page in this pass.
- Do not redesign admin pages in this pass.
- Do not rewrite API/data behavior.
- Do not convert the project to Material Symbols. Continue using `lucide-react`.
- Do not finish mobile redesign in this pass.

