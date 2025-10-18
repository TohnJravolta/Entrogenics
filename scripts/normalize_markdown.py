"""
Markdown normalisation utilities for Entrogenics CORE.

This module is intentionally standalone so it can be invoked against raw
markdown emitted by pymupdf4llm before we render to HTML.

Usage (dry run):
    python normalize_markdown.py input.md

Usage (write back):
    python normalize_markdown.py input.md --write
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path


FRONT_KEYS = {"title", "subtitle", "author", "collaboration", "series", "version", "license", "repository", "doi", "manifest-type"}
LIST_MARKERS = ("- ", "* ", "+ ", "> ")


def split_front_matter(text: str) -> tuple[str, list[str]]:
    lines = text.splitlines()
    if lines and lines[0].strip() == "---":
        for idx, line in enumerate(lines[1:], 1):
            if line.strip() == "---":
                front = "\n".join(lines[: idx + 1])
                body = lines[idx + 1 :]
                return front, body
    return "", lines


def remove_duplicate_metadata(lines: list[str]) -> list[str]:
    idx = 0
    while idx < len(lines):
        line = lines[idx].strip()
        if not line:
            idx += 1
            continue
        parts = line.split(":", 1)
        if len(parts) == 2 and parts[0].lower() in FRONT_KEYS:
            idx += 1
            continue
        break
    return lines[idx:]


def is_list_item(line: str) -> bool:
    stripped = line.lstrip()
    if any(stripped.startswith(marker) for marker in LIST_MARKERS):
        return True
    if re.match(r"^\d+\.\s", stripped):
        return True
    return False


def should_flush_buffer(line: str) -> bool:
    stripped = line.lstrip()
    return (
        not stripped
        or stripped.startswith("#")
        or stripped.startswith("```")
        or is_list_item(line)
        or stripped.startswith("|")
    )


def merge_buffer(buffer: list[str]) -> str:
    if not buffer:
        return ""
    result = buffer[0].strip()
    for segment in buffer[1:]:
        segment = segment.strip()
        if not segment:
            continue
        if result.endswith("-") and segment[:1].islower():
            result = result[:-1] + segment
        else:
            result += " " + segment
    return result


def normalise_lines(lines: list[str]) -> list[str]:
    output: list[str] = []
    buffer: list[str] = []
    in_code = False

    for line in lines:
        stripped = line.rstrip()

        if stripped.startswith("```"):
            if buffer:
                merged = merge_buffer(buffer)
                if merged:
                    output.append(merged)
                buffer.clear()
            output.append(stripped)
            in_code = not in_code
            continue

        if in_code:
            output.append(line.rstrip())
            continue

        if not stripped:
            if buffer:
                merged = merge_buffer(buffer)
                if merged:
                    output.append(merged)
                buffer.clear()
            if output and output[-1]:
                output.append("")
            continue

        if stripped.isdigit() and len(stripped) <= 3:
            # Likely stray page number.
            continue

        if is_list_item(line) or stripped.startswith(">") or stripped.startswith("|") or stripped.startswith("#"):
            if buffer:
                merged = merge_buffer(buffer)
                if merged:
                    output.append(merged)
                buffer.clear()
            output.append(stripped)
            continue

        buffer.append(stripped)

    if buffer:
        merged = merge_buffer(buffer)
        if merged:
            output.append(merged)

    while output and not output[-1]:
        output.pop()

    return output


def clean_markdown(text: str) -> str:
    front, body_lines = split_front_matter(text)
    body_lines = remove_duplicate_metadata(body_lines)
    cleaned_lines = normalise_lines(body_lines)

    result_parts = []
    if front:
        result_parts.append(front.strip())
    result_parts.append("\n".join(cleaned_lines))
    return "\n\n".join(part for part in result_parts if part)


def main() -> None:
    parser = argparse.ArgumentParser(description="Normalise Entrogenics markdown (remove soft line breaks, duplicate metadata, page numbers).")
    parser.add_argument("path", type=Path, help="Markdown file to normalise.")
    parser.add_argument("--write", action="store_true", help="Overwrite the file with the cleaned content.")
    args = parser.parse_args()

    raw = args.path.read_text(encoding="utf-8")
    cleaned = clean_markdown(raw)

    if args.write:
        args.path.write_text(cleaned, encoding="utf-8")
        print(f"Normalised markdown written to {args.path}")
    else:
        print(cleaned)


if __name__ == "__main__":
    main()
