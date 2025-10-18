from __future__ import annotations

import html
import subprocess
import shutil
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Literal

import markdown
import pymupdf4llm  # type: ignore

from normalize_markdown import clean_markdown, split_front_matter


BASE_DIR = Path(__file__).resolve().parents[1]
EXPORT_DIR = BASE_DIR / "exports"
EXPORT_MD_DIR = EXPORT_DIR / "markdown"
EXPORT_PDF_DIR = EXPORT_DIR / "pdf"
BROWSER_CANDIDATES = [
    Path("C:/Program Files/Microsoft/Edge/Application/msedge.exe"),
    Path("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"),
    Path("C:/Program Files/Google/Chrome/Application/chrome.exe"),
    Path("C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"),
]
USER_DATA_DIR = BASE_DIR / ".headless-profile"


def find_headless_browser() -> Path | None:
    for candidate in BROWSER_CANDIDATES:
        if candidate.exists():
            return candidate
    return None


def write_pdf(slug: str, html_path: Path) -> None:
    browser = find_headless_browser()
    if not browser:
        print(f"[warn] No headless browser found; skipping PDF for {slug}")
        return

    EXPORT_PDF_DIR.mkdir(parents=True, exist_ok=True)
    USER_DATA_DIR.mkdir(parents=True, exist_ok=True)

    output_path = (EXPORT_PDF_DIR / f"{slug}.pdf").resolve()
    html_uri = html_path.resolve().as_uri()
    user_dir = USER_DATA_DIR.resolve()

    cmd = [
        str(browser),
        "--headless",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "--virtual-time-budget=10000",
        f"--user-data-dir={user_dir}",
        f"--print-to-pdf={output_path}",
        html_uri,
    ]

    try:
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except subprocess.CalledProcessError as exc:
        err = exc.stderr.decode(errors="ignore").strip()
        print(f"[warn] Failed to generate PDF for {slug}: {err}")


def front_matter_yaml(cfg: PageConfig) -> str:
    return "\n".join(
        [
            "---",
            f'title: "✦ {cfg.title}"',
            f'subtitle: "{cfg.subtitle}"',
            f'author: "{DEFAULT_FRONT["author"]}"',
            f'collaboration: "{DEFAULT_FRONT["collaboration"]}"',
            f'series: "{DEFAULT_FRONT["series"]}"',
            f'version: "{cfg.version}"',
            f'license: "{DEFAULT_FRONT["license"]}"',
            f'repository: "{DEFAULT_FRONT["repository"]}"',
            f'doi: "{DEFAULT_FRONT["doi"]}"',
            f'manifest-type: "{DEFAULT_FRONT["manifest"]}"',
            "---",
        ]
    )


def prepare_markdown(cfg: PageConfig, raw_md: str) -> tuple[str, str]:
    cleaned = clean_markdown(raw_md)
    cleaned = cleaned.strip()
    if cleaned.startswith("---"):
        _, body_lines = split_front_matter(cleaned)
        body = "\n".join(body_lines).strip()
    else:
        body = cleaned

    front_yaml = front_matter_yaml(cfg)
    full_markdown = front_yaml
    if body:
        full_markdown += "\n\n" + body
    return body, full_markdown
@dataclass
class PageConfig:
    slug: str
    source: Path | None
    title: str
    subtitle: str
    category: str
    hero: str
    source_label: str = "Download original"
    source_type: Literal["pdf", "md", "code", "audio", "manual"] = "pdf"
    version: str = "v1.0 \u2014 October 2025"
    description: str = ""
    extra_body: Callable[[], str] | None = None
    output: Path = field(init=False)

    def __post_init__(self) -> None:
        self.output = Path("pages") / f"{self.slug}.html"


DEFAULT_FRONT = {
    "author": "Tohn Burray Travolta (Entrogenic Research Collective)",
    "collaboration": "Co-synthesized with large-language systems (GPT-5, Claude, Gemini) under the Cyclic-6 and Kybern\u014dsis protocols",
    "series": "Entrogenic Papers | Adaptive Systems Kollektive",
    "license": "CC BY-SA 4.0",
    "repository": "github.com/entrogenics/entrogenics-core",
    "doi": "",
    "manifest": "entrogenic-standard-paper",
}


TEMPLATE = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title} \u2014 Entrogenics CORE</title>
  <meta name="description" content="{description}" />
  <link rel="stylesheet" href="../assets/css/site.css" />
  <script src="../assets/js/toc.js" defer></script>
</head>
<body>
  <div class="bg" aria-hidden="true"></div>
  <div class="scan" aria-hidden="true"></div>
  <main class="wrap">
    <header class="hero hero-paper">
      <div class="brand"><span class="dot" aria-hidden="true"></span> ENTROGENICS / CORE</div>
      <h1>{title}</h1>
      <p>{hero}</p>
      <div class="cta">
        <a class="btn-alt btn" href="../library.html">Back to CORE Library</a>
        {download_cta}
      </div>
    </header>
    <section class="layout">
      <aside class="sidebar">
        <div class="toc-card">
          <h2>Contents</h2>
          <ol data-toc-list></ol>
        </div>
        <div class="meta-card">
          <h3>Document</h3>
          <p><strong>Category:</strong> {category}</p>
          <p><strong>Version:</strong> {version}</p>
          <p><strong>Type:</strong> {source_type}</p>
        </div>
      </aside>
      <article class="content">
        {front_matter}
        {body}
      </article>
    </section>
    <footer class="site-footer">
      &#169; Adaptive Systems Kollektive &middot; Entrogenics CORE &middot; Self-contained release
    </footer>
  </main>
</body>
</html>
"""


def render_front_matter(cfg: PageConfig) -> str:
    yaml_block = front_matter_yaml(cfg)
    authorship = """
<section class="front-matter">
  <pre>{yaml}</pre>
  <section class="front-matter-section">
    <h3>Authorship Declaration</h3>
    <p>This document was produced through <strong>synthetic co-authorship</strong> within the Entrogenic research framework.</p>
    <p>The human author \u2014 <strong>Tohn Burray Travolta</strong> \u2014 provided conceptual design, curation, and final synthesis.</p>
    <p>Language-model agents assisted in drafting, structural refinement, and citation weaving following the <em>Cyclic-6</em> process: <strong>Unfold \u2192 Disturb \u2192 Collapse \u2192 Bind \u2192 Dissipate \u2192 Recur.</strong></p>
    <p>All content has been reviewed, edited, and ethically approved by the human author, who assumes full accountability for its meaning and publication.</p>
    <blockquote><em>Entrogenics regards writing as co-adaptation between consciousness and code; each paper is a living artifact within that evolving grammar.</em></blockquote>
  </section>
  <section class="front-matter-section">
    <h3>Abstract / Invocation</h3>
    <p>This web edition arises from the <strong>Entrogenic tradition</strong> \u2014 a trans-disciplinary inquiry into adaptive systems, cyclic intelligence, and the synthesis of human intuition with artificial reasoning.</p>
    <p>It preserves the original manuscript while adopting a digital ritual format consistent with Entrogenic publication standards.</p>
  </section>
  <section class="front-matter-section">
    <h3>Symbolic Standard \u2014 The Catalytic Star (\u2721)</h3>
    <p>The six-pointed star (<strong>\u2721</strong>, Unicode U+2721) represents the <strong>Bind / Catalytic Unification phase</strong> within <em>The Fool\u2019s Cycle</em>, signifying harmonic convergence of dualities in adaptive transformation.</p>
    <p>Never substitute \u2721 with alternative glyphs. The canonical sequence appears below:</p>
    <div class="front-formula">
      <span>0</span>
      <span>\u2192</span>
      <span>\u2721</span>
      <span>\u2192</span>
      <span>\u2639</span>
      <span>\u2192</span>
      <span>0\u2032</span>
    </div>
    <ul>
      <li>Confirm UTF-8 encoding in all Entrogenic manuscripts.</li>
      <li>Preserve <code>&lt;meta charset="UTF-8"&gt;</code> declarations in HTML builds.</li>
      <li>Validate symbol rendering across browsers before distribution.</li>
    </ul>
  </section>
</section>
""".strip()
    # Replace placeholder ☹ (U+2639) with sun glyph ☉ (U+2609) after escape handling
    authorship = authorship.replace("\u2639", "\u2609")
    return authorship.format(yaml=html.escape(yaml_block))


def markdown_to_html(md_text: str) -> str:
    return markdown.markdown(
        md_text,
        extensions=[
            "extra",
            "admonition",
            "sane_lists",
            "tables",
            "fenced_code",
        ],
    )


def load_pdf_markdown(path: Path) -> str:
    return pymupdf4llm.to_markdown(str(path))


def wrap_code_block(path: Path) -> str:
    code = path.read_text(encoding="utf-8")
    escaped = html.escape(code)
    return f"<pre><code>{escaped}</code></pre>"


def audio_body() -> str:
    return """
<section>
  <h2>Audio Briefing</h2>
  <p>This briefing introduces the Accessible Symbolic Programming (ASP) protocol for navigating polycrisis-era alignment challenges.</p>
  <audio controls preload="metadata">
    <source src="../media/audio/asp-explained.mp3" type="audio/mpeg" />
    Your browser does not support embedded audio. <a href="../media/audio/asp-explained.mp3">Download the MP3</a>.
  </audio>
  <p class="audio-notes"><strong>Suggested use</strong>: Pair this audio with the ASP Manifesto and Formal Paper to align operational practice with the symbolic grammar.</p>
</section>
""".strip()


PAGES: list[PageConfig] = [
    PageConfig(
        slug="commons-sense",
        source=Path("archive/original_pdfs/applied_ecology/Commons_Sense/Commons Sense.ask.pdf"),
        title="Commons Sense (ASK Edition)",
        subtitle="Applied Ecology Manifest for Entrogenic Commons",
        category="Applied Ecology",
        hero="An Entrogenic lens on commons stewardship, cybernetic resource flows, and regenerative governance.",
        description="Commons Sense converted for the Entrogenics CORE web edition.",
    ),
    PageConfig(
        slug="grounded-spirit",
        source=Path("archive/original_pdfs/applied_ecology/Commons_Sense/Grounded Spirit_ Integrating Soul and Soil for a Holistic Future.pdf"),
        title="Grounded Spirit",
        subtitle="Integrating Soul and Soil for a Holistic Future",
        category="Applied Ecology",
        hero="Bridging ecology, spirituality, and adaptive governance within the Entrogenic syntax.",
        description="Grounded Spirit holistic ecology paper in web ritual format.",
    ),
    PageConfig(
        slug="integrating-commons",
        source=Path("archive/original_pdfs/applied_ecology/Commons_Sense/Integrating Commons, Cybernetics, and Resource-Based Visions for Systemic Transformation.pdf"),
        title="Integrating Commons, Cybernetics, and Resource-Based Visions",
        subtitle="Systemic Transformation Thesis",
        category="Applied Ecology",
        hero="A bridge between cybernetic commons management and resource-based ideology, adapted for Entrogenics.",
        description="Systemic transformation treatise rendered for Entrogenics CORE.",
    ),
    PageConfig(
        slug="asp-formal-paper",
        source=Path("archive/original_pdfs/Entrogenica/adaptive_systems/ASP/Accessible Symbolic Programming_ A Formal Paper.pdf"),
        title="Accessible Symbolic Programming",
        subtitle="A Formal Paper on ASP Protocols",
        category="Adaptive Systems (ASP)",
        hero="The definitive articulation of the ASP protocol distilled into the Entrogenic publication grammar.",
        description="ASP formal paper in Entrogenics CORE format.",
    ),
    PageConfig(
        slug="asp-manifesto",
        source=Path("Entrogenica/adaptive_systems/ASP/ASP_manifest_o.md"),
        title="ASP Manifesto",
        subtitle="Accessible Symbolic Programming Manifesto",
        category="Adaptive Systems (ASP)",
        hero="The manifesto for Accessible Symbolic Programming — core principles for Entrogenic alignment.",
        source_type="md",
        description="ASP manifesto rendered for Entrogenics CORE.",
    ),
    PageConfig(
        slug="asp-explained",
        source=None,
        title="ASP Explained",
        subtitle="Audio Briefing for Polycrisis Navigation",
        category="Adaptive Systems (ASP)",
        hero="A narrated walkthrough of the ASP protocol and its role in navigating the age of polycrisis.",
        source_type="audio",
        description="Audio briefing embedded for ASP.",
        extra_body=audio_body,
        source_label="Download audio",
    ),
    PageConfig(
        slug="clipcard-risk-recheck",
        source=Path("archive/original_pdfs/Entrogenica/adaptive_systems/Clipcard/ClipCard (Risk & Recheck)_ A Triggered, Blame-Safe Add-On for High-Risk Decisions Across Ops Pattern.pdf"),
        title="ClipCard (Risk & Recheck)",
        subtitle="Triggered, Blame-Safe Add-On for High-Risk Decisions",
        category="Adaptive Systems",
        hero="The ClipCard ritual framed inside the Entrogenic CORE motif for adaptive risk governance.",
        description="ClipCard risk & recheck whitepaper web edition.",
    ),
    PageConfig(
        slug="kybernosis-kollektive-integration",
        source=Path("Entrogenica/adaptive_systems/KYBERNOSIS_ALTAR/KOLLEKTIVE_INTEGRATION_PROCESS.md"),
        title="Kybern\u014dsis Kollektive Integration Process",
        subtitle="Kybern\u014dsis Altar",
        category="Kybern\u014dsis",
        hero="Process notes for the Kybern\u014dsis altar — integrating collective intelligence rituals.",
        source_type="md",
        description="Kybern\u014dsis integration process in web form.",
    ),
    PageConfig(
        slug="kybernosis-master-codex",
        source=Path("Entrogenica/adaptive_systems/KYBERNOSIS_ALTAR/KYBERNOSIS_MASTER_CODEX.md"),
        title="Kybern\u014dsis Master Codex",
        subtitle="Canonical Kybern\u014dsis Grammar",
        category="Kybern\u014dsis",
        hero="The master codex detailing symbols, phases, and operational praxis of Kybern\u014dsis.",
        source_type="md",
        description="Kybern\u014dsis master codex web conversion.",
    ),
    PageConfig(
        slug="kybernosis-nexus-codex",
        source=Path("Entrogenica/adaptive_systems/KYBERNOSIS_ALTAR/THE_NEXUS_CODEX_UNIFIED.md"),
        title="The Nexus Codex (Unified)",
        subtitle="Kybern\u014dsis Nexus Codex",
        category="Kybern\u014dsis",
        hero="Unified Nexus Codex bridging Kybern\u014dsis altar practices with Entrogenic operations.",
        source_type="md",
        description="Kybern\u014dsis Nexus Codex delivered as Entrogenics CORE page.",
    ),
    PageConfig(
        slug="kybernosis-nexus-manifesto",
        source=Path("Entrogenica/adaptive_systems/KYBERNOSIS_ALTAR/THE_NEXUS_MANIFESTO.md"),
        title="The Nexus Manifesto",
        subtitle="Kybern\u014dsis Manifesto",
        category="Kybern\u014dsis",
        hero="Manifesto for Nexus alignment within the Kybern\u014dsis altar.",
        source_type="md",
        description="Kybern\u014dsis manifesto web conversion.",
    ),
    PageConfig(
        slug="core-thesis",
        source=Path("Entrogenica/CORE/CORE_THESIS.md"),
        title="Entrogenics \u2014 The Core Thesis",
        subtitle="Foundational Text on Symbiotic Intelligence and Adaptive Transformation",
        category="CORE Thesis",
        hero="The foundational thesis of Entrogenics, adapted into the unified CORE web ritual.",
        source_type="md",
        description="Entrogenics core thesis (web edition).",
    ),
    PageConfig(
        slug="core-appendices",
        source=Path("Entrogenica/CORE/APPENDICES.md"),
        title="Entrogenics Appendices",
        subtitle="Supporting Materials for the Core Thesis",
        category="CORE Thesis",
        hero="Appendix materials supporting the Entrogenics core thesis.",
        source_type="md",
        description="Core appendices in Entrogenics CORE format.",
    ),
    PageConfig(
        slug="core-appendices-report",
        source=Path("Entrogenica/CORE/APPENDICES_COMPLETION_REPORT.md"),
        title="Appendices Completion Report",
        subtitle="Compilation & QA Report",
        category="CORE Thesis",
        hero="Report on the compilation and completion of Entrogenics appendices.",
        source_type="md",
        description="Appendices completion report.",
    ),
    PageConfig(
        slug="core-build-log",
        source=Path("Entrogenica/CORE/BUILD_LOG.md"),
        title="CORE Build Log",
        subtitle="Engineering Notes for Entrogenics CORE",
        category="CORE Operations",
        hero="Build log tracking the Entrogenics CORE compilation process.",
        source_type="md",
        description="CORE build log web view.",
    ),
    PageConfig(
        slug="core-citation-stubs",
        source=Path("Entrogenica/CORE/citation-stubs.md"),
        title="Citation Stubs",
        subtitle="Entrogenics Research Citations",
        category="CORE Operations",
        hero="Citation stubs and references for Entrogenics research artifacts.",
        source_type="md",
        description="Citation stubs web view.",
    ),
    PageConfig(
        slug="core-figure-map",
        source=Path("Entrogenica/CORE/figures/figure-map.md"),
        title="Figure Map",
        subtitle="Mapping Entrogenics Figures",
        category="CORE Operations",
        hero="Figure map enumerating visual assets referenced across Entrogenics CORE.",
        source_type="md",
        description="Figure map page.",
    ),
    PageConfig(
        slug="entrogenica-framework",
        source=Path("archive/original_pdfs/Entrogenica/OG3[READONLY]/Entrogenica_ A Framework for Adaptive Transformation Across Domains.pdf"),
        title="Entrogenica \u2014 A Framework for Adaptive Transformation",
        subtitle="Framework Across Domains",
        category="OG3 Archive",
        hero="The original framework text for Entrogenic adaptive transformation across domains.",
        description="Framework PDF converted to Entrogenics CORE style.",
    ),
    PageConfig(
        slug="entrogenica-manifesto",
        source=Path("archive/original_pdfs/Entrogenica/OG3[READONLY]/Entrogenica_ A Manifesto for Adaptive Transformation.pdf"),
        title="Entrogenica Manifesto",
        subtitle="Manifesto for Adaptive Transformation",
        category="OG3 Archive",
        hero="The manifest origin text of Entrogenics reinterpreted within the CORE presentation.",
        description="Manifesto web edition.",
    ),
    PageConfig(
        slug="fools-cycle-grammar",
        source=Path("archive/original_pdfs/Entrogenica/OG3[READONLY]/The Fool\u2019s Cycle_ A Symbolic Grammar for Adaptive Systems Across Disciplines-1.pdf"),
        title="The Fool\u2019s Cycle",
        subtitle="Symbolic Grammar for Adaptive Systems",
        category="OG3 Archive",
        hero="Symbolic grammar explaining The Fool\u2019s Cycle across disciplines.",
        description="Fool\u2019s Cycle grammar web edition.",
    ),
    PageConfig(
        slug="void-protocol",
        source=Path("Entrogenica/void_protocol/void_protocol_v0.3.69.md"),
        title="Void Protocol v0.3.69",
        subtitle="Protocol Manuscript",
        category="Void Protocol",
        hero="Void Protocol manual rendered for Entrogenics CORE distribution.",
        source_type="md",
        description="Void protocol web edition.",
    ),
    PageConfig(
        slug="pebbling-abstract",
        source=Path("archive/original_pdfs/Silo/data_intelegence/Pebbling_memory-swap-2-ops-w-reversibility/Abstract.pdf"),
        title="Pebbling Gradient Flux \u2014 Abstract",
        subtitle="Memory Swap Ops with Reversibility",
        category="Silo: Data Intelligence",
        hero="Abstract for the Pebbling memory-swap experiments with reversibility.",
        description="Pebbling abstract web edition.",
    ),
    PageConfig(
        slug="pebbling-visual-script",
        source=Path("Silo/data_intelegence/Pebbling_memory-swap-2-ops-w-reversibility/tree_pebbling_gradient_flux_friction_ask_mini_visual(3).jsx"),
        title="Pebbling Gradient Flux Visual Script",
        subtitle="Mini Visual JSX",
        category="Silo: Data Intelligence",
        hero="Annotated JSX visualization script for tree pebbling gradient flux friction.",
        source_type="code",
        description="Pebbling visual script with annotated code block.",
    ),
]


def build_page(cfg: PageConfig) -> None:
    body_html = ""
    body_md = ""
    download_links: list[str] = []

    if cfg.source_type == "pdf" and cfg.source:
        raw_md = load_pdf_markdown(BASE_DIR / cfg.source)
        body_md, export_md = prepare_markdown(cfg, raw_md)
        EXPORT_MD_DIR.mkdir(parents=True, exist_ok=True)
        (EXPORT_MD_DIR / f"{cfg.slug}.md").write_text(export_md, encoding="utf-8")
        body_html = markdown_to_html(body_md)
        download_links = [
            f'<a class="btn" href="../exports/pdf/{cfg.slug}.pdf" download>Download PDF</a>',
            f'<a class="btn" href="../exports/markdown/{cfg.slug}.md" download>Download Markdown</a>',
        ]
    elif cfg.source_type == "md" and cfg.source:
        raw_md = (BASE_DIR / cfg.source).read_text(encoding="utf-8")
        body_md, export_md = prepare_markdown(cfg, raw_md)
        EXPORT_MD_DIR.mkdir(parents=True, exist_ok=True)
        (EXPORT_MD_DIR / f"{cfg.slug}.md").write_text(export_md, encoding="utf-8")
        body_html = markdown_to_html(body_md)
        download_links = [
            f'<a class="btn" href="../exports/pdf/{cfg.slug}.pdf" download>Download PDF</a>',
            f'<a class="btn" href="../exports/markdown/{cfg.slug}.md" download>Download Markdown</a>',
        ]
    elif cfg.source_type == "code" and cfg.source:
        body_html = "<h2>Source Code</h2>" + wrap_code_block(BASE_DIR / cfg.source)
        download_links = [
            f'<a class="btn" href="../{cfg.source.as_posix()}" download>Download Source</a>',
        ]
    elif cfg.source_type == "audio":
        body_html = cfg.extra_body() if cfg.extra_body else ""
        download_links = ['<a class="btn" href="../media/audio/asp-explained.mp3" download>Download audio</a>']
    else:
        body_html = cfg.extra_body() if cfg.extra_body else ""

    front_matter_html = render_front_matter(cfg)

    download_cta = "\n        ".join(download_links)

    html_output = TEMPLATE.format(
        title=cfg.title,
        description=cfg.description or cfg.hero,
        hero=cfg.hero,
        download_cta=download_cta,
        category=cfg.category,
        version=cfg.version,
        source_type=cfg.source_type.upper(),
        front_matter=front_matter_html,
        body=body_html,
    )

    output_path = (BASE_DIR / cfg.output).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(html_output, encoding="utf-8")
    print(f"[built] {cfg.output.as_posix()}")

    if cfg.source_type in {"pdf", "md"}:
        write_pdf(cfg.slug, output_path)


def main() -> None:
    for page in PAGES:
        build_page(page)


if __name__ == "__main__":
    main()
