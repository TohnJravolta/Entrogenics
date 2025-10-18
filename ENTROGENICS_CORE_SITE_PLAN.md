# Entrogenics Core Web Conversion & Site PRD

## 1. Context
- **Initiative**: Convert the Entrogenics CORE knowledge set into a self-contained static website (future `Entrogenics.com` seed).
- **Scope**: Everything under `CORE/`, excluding reuse of assets outside this tree. Audio file must remain available and be surfaced from within CORE.
- **Driver**: Provide a consistent, Entrogenic-styled presentation for flagship papers, manifests, and research artifacts, mirroring the aesthetic of the recently-built ClipCard whitepaper page.

## 2. Key Objectives
1. Establish a reusable HTML/CSS scaffold (theme, typography, CTA patterns) stored inside `CORE/`.
2. Produce one dedicated web page per source document (PDF/MD/JSX) with accurate content and Entrogenic front-matter.
3. Publish a new CORE landing page that introduces the Entrogenics narrative, links all converted works, and embeds/links the audio briefing.
4. Ensure the whole folder functions standalone (relative asset paths, no external dependencies beyond fonts already referenced in CSS).

## 3. Source Inventory & Target Outputs
| Source Path | Type | Target Page | Notes |
|-------------|------|-------------|-------|
| `applied_ecology/Commons_Sense/Commons Sense.ask.pdf` | PDF | `commons-sense.html` | Entrogenic Commons Sense edition. |
| `applied_ecology/Commons_Sense/Grounded Spirit_ Integrating Soul and Soil for a Holistic Future.pdf` | PDF | `grounded-spirit.html` | Applied ecology essay. |
| `applied_ecology/Commons_Sense/Integrating Commons, Cybernetics, and Resource-Based Visions for Systemic Transformation.pdf` | PDF | `integrating-commons.html` | Systems transformation brief. |
| `Entrogenica/adaptive_systems/ASP/Accessible Symbolic Programming_ A Formal Paper.pdf` | PDF | `asp-formal-paper.html` | Include Entrogenic front-matter. |
| `Entrogenica/adaptive_systems/ASP/ASP_manifest_o.md` | MD | `asp-manifesto.html` | Remove audio embed per instruction. |
| `Entrogenica/adaptive_systems/ASP/ASP Explained_ The New Protocol for AI Alignment and Navigating the Age of Polycrisis.mp3` | Audio | `asp-explained.html` | Page includes audio player + transcript/summary. |
| `Entrogenica/adaptive_systems/Clipcard/ClipCard (Risk & Recheck)_ A Triggered, Blame-Safe Add-On for High-Risk Decisions Across Ops Pattern.pdf` | PDF | `clipcard-risk-recheck.html` | Reuse processed content if possible; ensure symbol fidelity. |
| `Entrogenica/adaptive_systems/KYBERNOSIS_ALTAR/*.md` | MD (4 files) | Separate pages (e.g., `kybernosis-master-codex.html`, etc.) | Preserve ritual formatting & headers. |
| `Entrogenica/CORE/CORE_THESIS.md` | MD | `core-thesis.html` | Already has HTML sibling; re-theme or confirm output. |
| `Entrogenica/CORE/APPENDICES.md` & `APPENDICES_COMPLETION_REPORT.md` | MD | Dedicated pages; link from thesis and landing. |
| `Entrogenica/CORE/BUILD_LOG.md` | MD | Optional page (if long, could be downloadable). |
| `Entrogenica/CORE/citation-stubs.md` | MD | Possibly stay as ancillary resource; decide during build. |
| `Entrogenica/CORE/figures/figure-map.md` | MD | Consider embedding figures references or keep as appendix. |
| `Entrogenica/OG3[READONLY]/*.pdf` | PDFs (3) | Individual pages (framework, manifesto, Fool’s Cycle). |
| `Entrogenica/void_protocol/void_protocol_v0.3.69.md` | MD | `void-protocol.html`. |
| `Silo/data_intelegence/Pebbling_memory-swap-2-ops-w-reversibility/Abstract.pdf` | PDF | `pebbling-abstract.html`. |
| `Silo/data_intelegence/.../tree_pebbling_gradient_flux_friction_ask_mini_visual(3).jsx` | JSX | Consider page with explanation + embedded code snippet / downloadable link. |

> **Out of scope**: `Entrogenica/.claude/` config; keep untouched.

## 4. Deliverables
1. `CORE/index.html` – Landing interface for Entrogenics CORE.
2. Shared asset pack inside `CORE/assets/` or `CORE/css/` (clone of theme styles + supporting JS if needed).
3. Converted HTML pages for every item listed (naming convention: kebab-case derived from titles).
4. Updated navigation components (per-page breadcrumb/back-to-core CTA).
5. Optional print-ready PDFs regenerated where fidelity is critical (store under `CORE/exports/`).

## 5. Design & Technical Guidelines
- **Theme baseline**: Reuse ClipCard whitepaper styling (gradient background, neon palette, Segoe UI fonts). Extract definitions into a shared CSS file (e.g., `core-theme.css` already exists; validate or refactor).
- **Front matter**: Each page begins with the Entrogenic standard block (title, subtitle, authorship declaration, symbol note).
- **Accessibility**: Ensure anchor targets, alt text, semantic headings (h1-h3).
- **Typography**: Use system fonts plus `Segoe UI Symbol` for ✡/☉ etc. Provide fallbacks.
- **Media**: Embed audio via `<audio controls>` with a download link. For large PDFs, offer download button referencing original file (within CORE).
- **Conversion**: Use Python tooling (FitZ/pymupdf4llm) to extract text; clean encoding issues (ō, ✡). Maintain numbering for citations/footnotes.
- **Routing**: All links relative (e.g., `href="./asp/asp-explained.html"`).
- **Deployment readiness**: When CORE folder is copied elsewhere it should render via static server / GitHub Pages.

## 6. Implementation Plan (Phased)
1. **Foundation**
   - Audit existing `core-theme.css`; extend for shared components.
   - Establish directory layout: `CORE/css/`, `CORE/js/` (if needed), `CORE/docs/` for generated HTML, `CORE/media/` for downloads/audio.
   - Create HTML template (header/footer, metadata, CTA block).
2. **Content Conversion**
   - Prioritize by cluster (Applied Ecology, ASP, ClipCard, Kybernōsis, OG3, Silo).
   - For each source: extract text, normalize symbols, compose HTML page, verify page break logic (if generating companion PDF).
   - Track tricky assets (e.g., tables, code blocks).
3. **Audio & Interactive Elements**
   - Build `asp-explained.html` with embedded `<audio>` referencing `../media/asp-explained.mp3`.
   - Provide transcript bullet list or summarised segments.
4. **Main Landing Page**
   - Introduce Entrogenics vision, highlight categories, include quick navigation cards.
   - Provide call-to-action to download aggregated bundle if needed.
5. **QA & Packaging**
   - Validate relative links, symbol rendering, responsive layout.
   - Spot-check PDF reflows (if produced).
   - Update README or `BUILD_LOG.md` with output summary.

## 7. Task Tracker (update as work progresses)
| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| Review & finalize theme assets | | ☑ Complete | `assets/css/site.css` + `assets/js/toc.js` established |
| Convert Applied Ecology PDFs (x3) | | ☑ Complete | Pages under `pages/commons-sense.html` etc. |
| Build ASP manifesto page (MD) | | ☑ Complete | `pages/asp-manifesto.html` |
| Build ASP formal paper page (PDF) | | ☑ Complete | `pages/asp-formal-paper.html` |
| Implement ASP Explained audio page | | ☑ Complete | Embedded audio + download (`pages/asp-explained.html`) |
| Convert ClipCard PDF (CORE version) | | ☑ Complete | `pages/clipcard-risk-recheck.html` |
| Convert KYBERNOSIS altar docs (x4) | | ☑ Complete | Integration, Codex, Manifesto suite |
| Convert OG3 READONLY PDFs (x3) | | ☑ Complete | Framework, Manifesto, Fool’s Cycle |
| Convert CORE thesis + appendices | | ☑ Complete | Thesis + appendices and report pages generated |
| Convert Void Protocol doc | | ☑ Complete | `pages/void-protocol.html` |
| Convert Silo abstract + JSX explainer | | ☑ Complete | Pebbling abstract + visual script |
| Build CORE landing page | | ☑ Complete | `index.html` with category cards |
| Global QA (links, symbols, audio) | | ☑ Complete | Link script `scripts/check_links.py` run locally |

*Update each row with `☐ Pending` → `◑ In Progress` → `☑ Complete` plus brief comments.*

## 8. Open Questions / Assumptions
1. Should OG3 PDFs remain downloadable only, or fully converted? (Assume full conversion unless instructed otherwise.)
2. Any need for multilingual support or alt-skin (light mode)? Currently not planned.
3. How to handle JSX file – showcase as code snippet or convert to narrative (need confirmation).

## 9. Dependencies & Tooling
- Python stack available (PyMuPDF, pdfminer, weasyprint if environment supports; fallback to fitz-based extraction).
- Ensure fonts (Segoe UI, Segoe UI Symbol) render in target environment.
- Avoid reliance on external CDNs per self-contained requirement.

## 10. Handoff Guidance
- Keep this document updated (timestamp changes, add sub-tasks).
- Record blockers in `BUILD_LOG.md` with reference to this plan.
- Store intermediate outputs under `CORE/workbench/` (gitignored if needed) to avoid polluting release structure.
- Before handoff, summarize remaining tasks in a short note appended to section 7.

---
_Initial version authored by automation agent; please amend as progress continues._

| Generate PDF / Markdown exports | | ✓ Complete | Headless Edge runs to `exports/pdf` + normalized markdown copies |
