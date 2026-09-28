# Halftone Design System

An editorial, retro-computing visual language for AI / developer-tool marketing sites: huge tightly-tracked grotesque headlines, flat saturated section grounds (pink, sage, near-black), halftone dot textures, and square OS-style windows used as content containers. Typeset entirely in **Pretendard Variable** (Latin + Hangul).

Source: claude.ai/design project "Halftone Design System" (83d65a89-36b2-4905-b4ed-fc0e2a97dc69). Tokens are copied to `src/styles/halftone.css`; React ports of the components live in `src/components/ds/index.tsx`.

## Components
- **core/** — `Button` (chip · solid · window · link), `Tag` (ink · accent · outline · paper), `Kicker` (dotted-leader eyebrow)
- **surfaces/** — `Window` (OS window with ink titlebar), `CornerFrame` (crop-mark corners), `NoteColumn` (label + hairline + paragraph), `MeterRow` (benchmark row), `Accordion` (FAQ)
- **navigation/** — `TopNav` (floating chip nav)
- **forms/** — `Input`, `Checkbox`, `Switch` (styled in the Window vocabulary)

## CONTENT FUNDAMENTALS
- **Voice:** confident, technical, slightly contrarian. Claims are specific and numeric with a footnoted proof link.
- **Casing:** headlines and UI labels in Title Case. Body copy sentence case. Korean: keep headlines short and declarative (…습니다 / noun phrase).
- **Headlines** are punchy statements or wordplay. Parentheses and semicolons allowed in display type.
- **Labels** are 1–3 words ("Not Chat", "A New Model") and sit above longer paragraphs.
- **Acronyms and version strings** are used as texture: "OS1", "Clock Tool 1.1", "Version 0.01", "[B.64]" followed by base64 gibberish.
- **Emoji:** essentially none. Unicode glyphs (∵ ×) mark section edges.
- **CTAs** are plain verbs, set huge and underlined ("Sign Up") or as small chips ("Contact Sales").

## VISUAL FOUNDATIONS
- **Colour:** each full-width section is one flat ground — white/sky hero, **Field Pink #F3869F**, **Sage #ABB9B9**, **Ink #1E1E1E**. Text on pink/sage is warm **Cocoa #3C2D30**, not black. **Magenta #F65FD8** is the accent (halftone clouds, category tags). Blue/rust/green appear only as chart bars. Never gradients as decoration; the only gradient is the hero's fade-to-white under the imagery.
- **Type:** Pretendard 600 for display at 96–128px, line-height 0.88, tracking −0.055em. Headings 28–64px. Body 17–22px at 1.2 leading, tracking −0.015em. Labels 11px semibold. Numbers use tabular figures. Korean: track less tightly than Latin (−0.03em), body leading 1.35+.
- **Layout:** centred 1240px content column; headlines centred, editorial text in 2–3 columns each hung from a 1px left rule. ≈128px between blocks. Crop-mark corners (10px L-brackets) frame headlines and stat blocks instead of boxes.
- **Backgrounds & imagery:** halftone/dithered photography, 1-bit dot grids (6px) and fine dots (3px). High-contrast, grainy, never glossy.
- **Corner radii:** 0 everywhere. No pills, no rounded cards.
- **Borders:** 1px ink hairlines; dashed for collapsed FAQ items; solid when open.
- **Shadows:** none. Depth comes from overlapping windows and 1px OS bevels (`--bevel-out` raised, `--bevel-in` sunken).
- **Cards:** the "card" is a **Window** — ink titlebar (20px), 1px ink frame, grey #D9D9D9 body with inset bevel, or white body for data/code.
- **Transparency & blur:** none. Solid fills only; modal scrim is a light 20% ink wash.
- **Hover:** chips invert to ink/white; links drop to 70% opacity or cocoa. **Press:** 1px downward nudge; window buttons swap to inset bevel. No scale, no bounce.
- **Motion:** minimal and mechanical — instant state swaps or stepped (`steps(4)`) transitions. No easing flourishes, no fades on scroll.
- **Fixed elements:** the top nav floats as detached chips over content with no bar background.

## ICONOGRAPHY
- Marks are typographic: crop corners, dotted leaders, `∵ ×` edge glyphs, square markers, filled squares for checked states.
- If icons are genuinely needed, use **Lucide** at 1.5px stroke, square caps, 16/20px, in ink.
- No emoji. The brand name is set in Pretendard 600 wherever a mark would go.
