from __future__ import annotations

import sys
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable


BASE_DIR = Path(__file__).resolve().parents[1]
CORE_DIR = BASE_DIR


class LinkCollector(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for attr, value in attrs:
            if attr in {"href", "src"} and value:
                self.links.add(value)


def iter_html_files() -> Iterable[Path]:
    yield CORE_DIR / "index.html"
    pages_dir = CORE_DIR / "pages"
    for file in sorted(pages_dir.glob("*.html")):
        yield file


def resolve_target(origin: Path, link: str) -> Path:
    if link.startswith("/"):
        return CORE_DIR / link.lstrip("/")
    return (origin.parent / link).resolve()


def main() -> int:
    missing: list[tuple[Path, str]] = []
    checked = 0

    for html_file in iter_html_files():
        if not html_file.exists():
            missing.append((html_file, "<file missing>"))
            continue

        checked += 1
        collector = LinkCollector()
        try:
            collector.feed(html_file.read_text(encoding="utf-8"))
        except Exception as exc:  # pragma: no cover - diagnostic
            missing.append((html_file, f"<parse error: {exc}>"))
            continue

        for link in collector.links:
            link = link.strip()
            if not link or link.startswith("#"):
                continue
            if link.startswith(("http://", "https://", "mailto:", "tel:")):
                continue

            target = resolve_target(html_file, link)
            # Normalise to CORE root
            try:
                target.relative_to(CORE_DIR)
            except ValueError:
                # Link escapes CORE; treat as warning
                if not target.exists():
                    missing.append((html_file, link))
                continue

            if not target.exists():
                missing.append((html_file, link))

    if missing:
        print("Link check FAILED\n")
        for origin, link in missing:
            print(f"- {origin.relative_to(CORE_DIR)} -> {link}")
        return 1

    print(f"Link check passed ({checked} HTML files)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
