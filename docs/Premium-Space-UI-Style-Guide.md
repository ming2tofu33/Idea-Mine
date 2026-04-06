# Premium Space UI Style Guide

> Working design document for IDEA MINE v2. This document captures the current premium space UI direction, including the agreed visual thesis, palette, CTA behavior, and area-based contrast rules. It can later be expanded or moved into `mind/08-Design`.

## 1. Purpose

This guide defines the emotional tone, visual thesis, and high-level interface rules for IDEA MINE v2. Its purpose is to keep the product from drifting into either a generic AI-style purple UI or a game-like sci-fi spectacle. The target is a premium exploration interface that feels cinematic, distinctive, and deeply atmospheric while remaining highly usable as a real planning tool.

## 2. Design Thesis

IDEA MINE v2 is a cinematic observatory interface. Its foundation is technical, precise, and instrument-like. Its atmosphere is alive with nebula depth, signal motion, soft particles, and restrained cosmic energy. Across the app, users should feel that a living space surrounds them. In moments that demand reading, comparison, and judgment, that atmosphere should step back just enough for content to take the lead.

The product should not behave like a flashy sci-fi demo, a neon cyberpunk dashboard, or a retro pixel game. It should feel like a high-value creative instrument: spatially rich, emotionally immersive, and visually refined, while still serious enough for real work.

## 3. Chosen Direction

### 3.1 Style Label

`Cinematic Observatory`

### 3.2 Core Interpretation

- Overall direction: `Hybrid`
- Strongest reference mood: `Cinematic Nebula`, controlled through a more usable structure
- Base structure: `Instrument-heavy`
- Accent material: selective `glass / hologram`
- Background behavior: `Active Atmosphere` across the product
- Readability rule: when reading or comparison becomes primary, atmosphere intensity should reduce
- Strongest visual scene: `Mine`
- Whole-app rule: space atmosphere should exist across the app, not only in hero moments

### 3.3 Product Feeling

The interface should feel like space observation equipment layered with living atmospheric energy. The skeleton of the product must feel engineered and trustworthy. The emotional layer above it should make the world feel deep, alive, and premium without becoming noisy or decorative for its own sake.

## 4. Visual Principles

### 4.1 Instrument First

Panels, cards, buttons, and controls should resemble refined tools, analysis surfaces, and observation equipment rather than decorative game props. The UI must feel dependable before it feels dramatic.

### 4.2 Atmosphere Everywhere, Intensity by Context

The product should maintain a sense of space across most screens. Backgrounds should not collapse into flat emptiness. At the same time, atmosphere should reduce in dominance when users need to read, compare, scan, or make decisions.

### 4.3 Mine as the Signature Scene

Mine is the flagship visual area. It should carry the strongest sense of wonder, depth, glow, motion, and cosmic identity.

### 4.4 Calm Utility in Vault and Lab

Vault and Lab should live in the same universe as Mine, but in calmer and more controlled forms. Vault should feel archival and composed. Lab should feel analytical and precise.

### 4.5 Content Always Wins

No effect, particle field, glow layer, or gradient treatment should compete with the content. Cards, text hierarchy, list structure, and decision controls must always remain visually primary.

## 5. Color System

### 5.1 Approved Base Palette

The current chosen palette is:

- `bg/deep`: `#02050D`
- `bg/base`: `#060C18`
- `surface-1`: `#0C1524`
- `surface-2`: `#121D31`
- `line/steel`: `#2A3C58`
- `text-primary`: `#EFF4FF`
- `text-secondary`: `#9AAAC0`
- `cold-cyan`: `#5CCDE5`
- `signal-pink`: `#FF3B93`
- `cosmic-rose`: `#FF7AAD`
- `metal-highlight`: `#D9E2F0`

This palette is intentionally deeper than a typical SaaS dark theme. The goal is to create stronger spatial depth and stronger contrast for signal accents without making the product feel dead or muddy.

### 5.2 Palette Character

The color system should feel like cold observation infrastructure interrupted by vivid intelligent signals.

- The foundation is deep navy, blue-black, and obsidian.
- Surfaces stay dark, but not flat black.
- Pink is the main signal accent.
- Cyan acts as a technical or observational secondary accent.
- Metallic light values create precision and premium contrast.

### 5.3 What to Avoid

- generic purple-pink AI gradients as the main identity
- neon overload
- overly soft luxury palettes that weaken tool credibility
- dark surfaces so flat that cards and layers disappear

## 6. Pink Usage Rules

Pink is not the default fill color of the entire product. Pink is the signal color of the system.

### 6.1 Primary Accent Behavior

- Default accent: `Signal Pink` `#FF3B93`
- Elevated emotional accent: `Cosmic Rose` `#FF7AAD`

### 6.2 How Pink Should Behave

Pink should most often appear as:

- signal lines
- active borders
- hover glows
- selected states
- high-priority highlights
- focused interaction moments

Pink should appear less often as:

- large solid fills
- full-surface gradients
- dominant background lighting

The product should feel like pink is an intelligent reactive signal, not a decorative wash.

## 7. Material and Surface Direction

At the material level, the interface should lean toward:

- glass
- metal
- radar panels
- refined terminal surfaces
- layered instrument screens

These materials should be implied through transparency, edge treatment, glow restraint, layered depth, and structural hierarchy rather than through literal skeuomorphic textures. The product should feel high-value, technical, and carefully manufactured.

## 8. Shape Language

The shape system should be mixed rather than purely soft or purely sharp.

- Core panels and structural modules should use precise, angular forms.
- Highlight layers, glow edges, and atmospheric shapes can be softer.
- Corners should feel engineered, not playful.
- The product should suggest advanced equipment, not toy-like softness.

This balance lets the UI feel both exact and spatial.

## 9. Typography Direction

Typography should split brand expression from working readability.

- Display typography can be more futuristic, cinematic, and identity-forward.
- UI and body typography should remain calm, highly legible, and efficient.
- Mine and landing can tolerate stronger typographic personality.
- Vault and Lab should prioritize long-session readability and information clarity.

The type system should support the feeling of a premium working product, not a concept poster.

## 10. Motion Direction

Motion should be layered, fluid, and cinematic, but never sloppy. The product should feel as if signals, light, and interface layers are gently moving through space.

### 10.1 Chosen Motion Direction

`Layered Hybrid`, leaning strongly toward `Cinematic Flow`

### 10.2 Motion Rules

- Default interaction motion should already feel alive and premium.
- Major transitions and Mine-specific moments can become more cinematic.
- High-precision actions such as clicking, selecting, typing, and confirming should remain crisp and responsive.
- Motion should guide attention, not delay work.

The feeling should be floating intelligence, not chaos.

## 11. Background Direction

Backgrounds should generally behave like an active atmosphere rather than static wallpaper. The world of IDEA MINE should feel alive across most screens.

Possible background ingredients include:

- nebula depth layers
- dust or particle fields
- distant light movement
- signal glows
- soft parallax

When a screen becomes reading-heavy or comparison-heavy, the background should step back in visual dominance. The world remains present, but the foreground must reclaim clarity.

## 12. CTA System

CTA behavior is one of the most important parts of the style system because it determines how brand energy enters the interface.

### 12.1 CTA Thesis

Pink should not dominate CTA fills by default. Pink should function primarily as a signal layer.

The preferred CTA pattern is:

`dark panel base + steel structure + pink signal accents`

### 12.2 Approved CTA Direction

Use a combination of:

- `Signal Accent CTA`
- `Area-Based CTA`

### 12.3 Signal Accent CTA

Default CTA behavior:

- button background uses dark panel values
- border, inner lines, icon accents, and hover glows can use pink
- the button should feel like a responsive instrument panel rather than a candy-colored marketing button

Recommended base values:

- CTA background: `#121D31`
- CTA border: `#2A3C58`
- CTA text: `#EFF4FF`
- pink signal accent: `#FF3B93`
- pink soft fill tint: `rgba(255, 59, 147, 0.08)`
- pink hover glow: `rgba(255, 59, 147, 0.22)`
- cyan secondary accent: `#5CCDE5`

### 12.4 Area-Based CTA

- Mine can use stronger pink emphasis than the rest of the product.
- Vault and Lab should rely more on steel, cyan, and restrained signal behavior.
- The strongest pink CTA should be limited to the most important primary action in Mine.

### 12.5 CTA Hierarchy

#### Primary CTA

Used for the main high-value action, especially in Mine.

- very subtle pink fill tint allowed
- pink border or stronger pink signal line
- slightly stronger glow

#### Default CTA

Used across most of the app.

- dark panel background
- steel border
- pink signal line, icon, or hover response

#### Secondary CTA

Used especially in Vault and Lab.

- dark panel background
- steel or cyan emphasis
- pink minimized or absent

#### Tertiary Action

Used for text actions or lower emphasis controls.

- minimal surface treatment
- hover can trigger pink or cyan response depending on context

## 13. Spatial Contrast by Area

### 13.1 Mine

The most cinematic and atmospheric area.

- widest spacing
- deepest scene layering
- strongest glow
- strongest motion
- strongest sense of wonder
- strongest pink signal emphasis

### 13.2 Vault

Still premium and spatial, but more archival.

- stronger structure
- clearer grouping
- calmer energy
- stronger scanability
- reduced ambient intensity

### 13.3 Lab

The most analytical area.

- cleaner presentation
- more disciplined hierarchy
- more obvious tool behavior
- reduced atmospheric noise
- precision over spectacle

## 14. Density Rules

Density should vary by space rather than remain uniform across the product.

- Mine: more spacious, more cinematic, more scene-oriented
- Vault: more structured and scannable
- Lab: more productive and information-dense

This ensures the whole app shares one world while still respecting the job of each area.

## 15. What This Style Is Not

This style is not:

- a generic purple AI SaaS interface
- a neon cyberpunk dashboard
- a full 3D game UI
- a retro pixel reskin
- a visual-first concept piece with weak usability

It is a premium exploration product UI that uses space atmosphere to deepen identity without weakening function.

## 16. Working Summary

The current design direction for IDEA MINE v2 can be summarized like this:

IDEA MINE v2 is a cinematic observatory UI. It combines the trust and precision of high-end space observation equipment with the living atmosphere of nebulae, particles, and signal motion. The app should feel spatial and premium across most screens, with Mine acting as the flagship scene. The visual system should avoid cliche AI-purple styling, using cold observational tones with pink signal energy instead. CTA behavior should keep pink as a signal layer rather than a default fill color, with stronger pink emphasis reserved for Mine and other high-priority moments. The interface must remain readable, structured, and serious enough for deep planning work at all times.

## 17. Next Areas to Define

The following pieces should be defined next:

- exact heading and body font pairings
- card and panel construction rules
- iconography rules
- illustration rules
- motion duration values and hierarchy
- background intensity rules by screen type
- form elements and input styles
