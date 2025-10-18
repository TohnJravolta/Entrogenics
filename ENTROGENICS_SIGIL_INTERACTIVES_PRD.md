# Entrogenics Sigil Interactives PRD + Worklog

- **Author**: Codex Agent
- **Date**: 2025-10-16
- **Scope**: Embed interactive, procedural mini-experiences for the Entrogenics landing page (`CORE/index.html`) and CORE library (`CORE/library.html`) using provided LOGOGENS assets.

## 1. Project Compass

- **Vision**: Turn the Entrogenics and Pylon sigils into playable teaching moments that embody the Cyclic-6 ritual without bloating the existing lightweight site.
- **Primary Goals**
  - Preserve each sigil's visual identity while layering an unobtrusive, infinitely replayable micro-game.
  - Teach at least one Entrogenic principle per experience (Symbiotic governance on the landing page, Consent thresholds within the library).
  - Keep code footprint minimal (no external libraries, sub-5 KB inline script target, degrade gracefully if JS disabled).
  - Maintain self-containment inside `CORE/` so the folder can ship independently.
- **Non-Goals**
  - Comprehensive game frameworks or heavy state machines.
  - Persisting scores/analytics beyond simple session feedback.
  - Broad browser polyfill support beyond modern evergreen engines already required by current pages.

## 2. Inputs & References

- `CORE/LOGOGENS/entrogenics_sigil_standalone_html_canvas_png_svg.html`
- `CORE/LOGOGENS/pylon_sigil_kit_memetic_share_pack_svg_html.html`
- `ENTROGENICS_LANDING_PRD.md`, `ENTROGENICS_CORE_SITE_PLAN.md`
- Cyclic-6: `Unfold → Disturb → Collapse → Bind → Dissipate → Recur`

## 3. Experience Concepts

### 3.1 Entrogenics Sigil: **Cyclic Signal Harmonics**
- **Principle**: Symbiotic governance emerges by keeping six sensing nodes in balanced cadence with emergent inputs.
- **Loop**:
  1. Procedurally spawn six phase pulses (soft neon arcs) with random drift magnitudes, one per Cyclic-6 stage.
  2. Player nudges alignment by rotating the sigil (mouse drag / touch drag / keyboard arrow) attempting to line up pulses with the canonical Cyclic-6 markers.
  3. On alignment within tolerance, the stage "binds" and emits a short textual aphorism (Unfold, Disturb, etc.). Drift resets with new random seed.
  4. System tracks consecutive binds to subtly increase drift amplitude, ensuring novelty.
  5. No fail state; idle mode auto-orbits slowly to stay ambient.
- **Cyclic-6 Integration**: Each phase uses different color accent and text snippet; ordering locked clockwise.
- **Replayability**: Drift seeds derived from `Math.sin` of elapsed time; every success reseeds using hash of previous input.
- **Minimalism Strategy**: Re-use existing canvas drawing logic (single `<canvas>` overlay). Defer heavy recalculation by precomputing trig tables. Under 200 lines of JS.

### 3.2 Pylon Sigil: **Consent Gate Weave**
- **Principle**: Library curation requires consent-led gating; insights pass only when the six ritual conditions align.
- **Loop**:
  1. Generate an endless stream of "glyphs" (tiny bars) sliding up the gate, each tagged with one of the six stages.
  2. Player toggles the central gate by tapping/clicking; gate opens only when the next required stage matches the running sequence (Unfold → ... → Recur → repeat).
  3. Correct passes illuminate pylons incrementally; mismatches pulse red and reset the sequence (soft feedback, no failure).
  4. After each full cycle the ouroboros stitches a new horizon trace with random jitter, keeping visuals fresh.
  5. Idle state auto-runs at low speed to show concept if untouched.
- **Cyclic-6 Integration**: Gate only completes when all six phases pass in order; HUD whispers stage names.
- **Replayability**: Glyph timing sourced from pseudo-random interval generator; horizon jitter seeded from timestamp so cycles stay varied.
- **Minimalism Strategy**: SVG + tiny inline script, rely on `requestAnimationFrame`, keep DOM nodes under 20, avoid layout thrash.

## 4. Interaction & Placement

- **Landing (`index.html`)**
  - Replace static hero badge area with sigil canvas module.
  - Provide compact instructions tooltip (`hover` or `focus`) to keep hero uncluttered.
  - Ensure keyboard accessibility via arrow keys and space bar (toggle auto-alignment).
  - Canvas sized to 320–360 px, responsive down to 240 px.

- **Library (`library.html`)**
  - Insert gate experience just below hero CTA.
  - Provide descriptive caption + fallback static SVG for no-JS (hidden by default, revealed via `<noscript>`).
  - Respect existing card grid spacing; max width 420 px centered.

## 5. Technical Notes

- Shared utility snippet for Cyclic-6 labels stored inline per page (avoid cross-file coupling).
- Ensure scripts execute after DOM ready without blocking initial content (defer attribute or inline bottom script).
- Leverage CSS already present (neon palette); add minimal additions in `assets/css/site.css` for containers/tooltips.
- Accessibility: `aria-live="polite"` for stage feedback; alt text for static fallback logos referencing LOGOGENS guidance.

## 6. Testing & Validation

- Manual smoke: verify both games run desktop + mobile emulation, keyboard support, and degrade gracefully when JS disabled.
- Automated: rerun `python CORE/scripts/check_links.py`.
- Visual regression: quick eyeball to confirm hero/library layout remains responsive.

## 7. Task Checklist

- [x] Review & integrate assets (DONE: see Worklog 2025-10-16 14:40Z)
- [x] Implement hero sigil interactive
- [x] Implement library sigil interactive
- [x] Update CSS with shared micro-styles
- [x] Run link checker and manual QA
- [x] Archive notes / final log entry

## 8. Worklog (UTC)

| Timestamp | Author | Notes |
|-----------|--------|-------|
| 2025-10-16 14:40 | Codex | Drafted PRD, defined mechanics, recorded initial checklist. |
| 2025-10-16 15:25 | Codex | Implemented landing-page sigil experience with cyclic-6 pulse gameplay and accessibility hooks. |
| 2025-10-16 16:05 | Codex | Added library consent-gate mini-game with procedural glyph cycle and idle assistance. |
| 2025-10-16 16:15 | Codex | Styled shared components and ran `python CORE/scripts/check_links.py` (pass). |
| 2025-10-16 16:25 | Codex | Logged completion and readiness for handoff; both interactives documented and verified. |
| 2025-10-16 17:05 | Codex | Recentred hero layout, clarified sigil cues with color-coded markers, and added adaptive pacing plus symbolic glyphs to the consent gate. |
| 2025-10-16 18:20 | Codex | Converted sigil ritual into lock-picking timing game with level ramp, tiered randomisation after level 3, and rebalanced speed/tolerance curves. |
| 2025-10-16 19:05 | Codex | Wired deterministic stage-order shuffles, late-game node drift (level 42+), and kept the pointer continuous so the lock ritual loops forever. |
| 2025-10-16 19:30 | Codex | Added level-scaled scoring (visible from level 9), per-stage rewards, miss penalties, and quadratic cycle bonus. |
| 2025-10-16 20:00 | Codex | Introduced drone audio with per-phase pitches, gradient feedback tied to level/phase, and in-hero mute/volume controls. |
| 2025-10-16 20:35 | Codex | Ported level/randomisation/score loop to the Pylon gate ritual, tightened glyph spacing, and refreshed library UI to show level & score. |
| 2025-10-16 20:55 | Codex | Added brown-noise drone with per-phase harmonics and player controls to the library gate ritual. |
