<!-- Entrogenics.com Landing Page PRD -->

# Entrogenics.com Landing Page Specification

## 1. Purpose & Audience
- **Objective**: Introduce Entrogenics as a research nexus blending human intuition, adaptive systems, and synthetic co-authorship. Convert curious systems thinkers into collaborators, readers, or contributors.
- **Primary audiences**:
  1. Researchers / practitioners in adaptive systems, governance, resilience.
  2. Potential collaborators (engineers, policy designers, sociotechnical strategists).
  3. Sponsors / institutions gauging sophistication & credibility.

## 2. Core Themes (derived from Corpus)
- **Symbiotic Intelligence** *(Core Thesis)*: Human-AI co-adaptation, Cyclic-6 ritual.
- **Adaptive Governance** *(ClipCard, ASP)*: Structured friction, accessible symbolic programming.
- **Commons Ecology** *(Applied Ecology+)*: Regenerative stewardship, soul + soil.
- **Kybernōsis Rituals** *(Kybernōsis Altar suite)*: Symbolic grammar, collective integration.
- **Invitation to Build** *(Build log, appendices insight)*: Not monolithic; open to contribution pathways.

## 3. Narrative Outline
1. **Hero: “Entrogenics — Symbiotic Governance for Polycrisis”**
   - Subheadline summarising what Entrogenics is.
   - Primary CTA: `Explore the Core Thesis`
   - Secondary CTA: `Join the Research Mesh` (email / contact placeholder).
   - Background consistent neon grid aesthetic.
2. **Proof Section: “Why Entrogenics”**
   - Three pillars (Symbiotic Intelligence, Adaptive Rituals, Commons Stewardship).
   - Each referencing specific works (e.g., Core Thesis, ASP, Commons Sense).
3. **Research Streams Grid**
   - Cards for major domains: Core Thesis, ASP, ClipCard, Kybernōsis, Applied Ecology, Silo experiments.
   - Buttons to key pages (reuse existing `CORE/pages` outputs & `library.html`).
4. **Catalytic Framework Overview**
   - Visual text block summarising Cyclic-6 + Fool’s Cycle formula.
   - Pull-quote from Core Thesis.
5. **Collaboration CTA**
   - Invite contributions (research briefs, field pilots, translators).
   - Link to ASK.report and GitHub.
6. **Footnotes / Symbolic Standards**
   - Reinforce ✡ usage, licensing (CC BY-SA).
   - Link to full library (existing CORE library page).

## 4. IA & File Layout
- New entry point: `CORE/landing.html`.
- Existing library becomes `CORE/library.html` (rename `index.html`).
- Update builder script so generated pages link back to `../library.html`.
- Link structure:
  - Landing primary CTA -> `library.html` / `pages/core-thesis.html`
  - Navigation within landing uses anchors for hero, proof, streams, collaborate.

## 5. Visual Details
- Reuse `assets/css/site.css`; extend with landing-specific utilities (navigation bar, hero background overlay, feature cards).
- Ensure responsive layout: hero stack, mobile nav (hamburger optional).
- Add subtle animated gradient background similar to doc pages.
- Use `span.symbol` with `font-family: var(--symbol-font);` for ✡, ☉, → to avoid encoding drift.

## 6. Copy Blocks (Draft)
- **Hero**: “Entrogenics weaves human intuition with symbolic protocols to keep adaptive systems accountable in the polycrisis.”
- **Pillars**:
  - *Symbiotic Intelligence* — “Cyclic-6 rituals for co-creating knowledge with machine counterparts.” (link: Core Thesis)
  - *Applied Rituals* — “ASP & ClipCard translate symbolism into operational control surfaces.” (links: ASP, ClipCard)
  - *Commons Stewardship* — “Grounded Spirit and Commons Sense reconnect soul + soil.” (links: ecology pages)
- **Streams**: six cards with 1–2 sentence blurbs referencing actual documents.
- **Collab**: “Signal interest via ask.report, contribute case studies, help translate Kybernōsis rituals.”

## 7. Implementation Tasks
- [x] Rename `CORE/index.html` → `CORE/library.html`, adjust CSS if needed.
- [x] Update `build_pages.py` to link “Back to CORE Library”.
- [x] Build the public landing surface (`CORE/index.html`) per outline.
- [x] Refresh link checker and PRD.

## 8. Open Questions
- Contact mechanism? placeholder `mailto:` vs linking to ask.report contact form.
- Should landing include timeline / upcoming releases? (nice-to-have).
- Do we want analytics hooks? Not planned; keep static.

## 9. Handoff Notes
- Landing-specific styles should live in `assets/css/site.css`.
- Document copy sources: use quotes from `CORE/pages/core-thesis.html`, `asp-manifesto`, `clipcard-risk-recheck`, `grounded-spirit`.
- After build, run `python CORE/scripts/check_links.py` and manual visual QA.
  - [x] Generate normalized Markdown and headless-print PDFs (`exports/markdown`, `exports/pdf`).
