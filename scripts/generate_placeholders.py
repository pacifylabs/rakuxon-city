#!/usr/bin/env python3
"""Generate placeholder imagery for seeded records.

The design is photography-led and the client's real estate photography has not
arrived yet. Rather than dress the demo in Western stock that misrepresents the
market, these stand in: quiet sage-toned fields at the exact aspect ratios the
design system calls for (§8 — 16:9 hero, 4:3 cards, 3:4 collage tiles), carrying
no baked-in text so the "photography pending" caption can render in real type.

They are deliberately plain. They are not trying to look like photographs.

    python3 scripts/generate_placeholders.py

Phase 8's content gate replaces every one of these, and this script goes with
them. Output lands in public/images/placeholders/.
"""

from __future__ import annotations

import hashlib
import pathlib

from PIL import Image, ImageDraw

OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "images" / "placeholders"

# Drawn from the design system palette so placeholders sit inside the page
# rather than punching a grey hole through it. canvas / accent-tint / hairline
# and two quiet stone tones that carry the same sage cast.
TONES = [
    ((206, 216, 204), (176, 190, 174)),
    ((211, 221, 212), (183, 198, 185)),
    ((201, 209, 198), (170, 182, 168)),
    ((214, 220, 210), (186, 196, 182)),
    ((198, 210, 201), (166, 181, 169)),
]

HAIRLINE = (238, 242, 236)

RATIOS = {
    "hero": (2000, 1125),      # 16:9
    "card": (1200, 900),       # 4:3
    "portrait": (900, 1200),   # 3:4
    "wide": (1600, 1000),      # estate feature
}


def tone_for(name: str) -> tuple[tuple[int, int, int], tuple[int, int, int]]:
    """Stable per-name tone, so a listing keeps its shade across regenerations."""
    digest = hashlib.sha256(name.encode()).digest()
    return TONES[digest[0] % len(TONES)]


def render(name: str, ratio: str) -> pathlib.Path:
    width, height = RATIOS[ratio]
    base, band = tone_for(name)

    image = Image.new("RGB", (width, height), base)
    draw = ImageDraw.Draw(image)

    # A single soft horizon, placed off-centre. Enough to read as ground and sky
    # without pretending to be a picture of anything.
    digest = hashlib.sha256(name.encode()).digest()
    horizon = int(height * (0.58 + (digest[1] % 14) / 100))
    draw.rectangle([0, horizon, width, height], fill=band)

    # Two faint verticals echoing the container column rules in §4.
    for fraction in (0.18, 0.82):
        x = int(width * fraction)
        draw.line([(x, 0), (x, height)], fill=HAIRLINE, width=2)

    draw.line([(0, horizon), (width, horizon)], fill=HAIRLINE, width=2)

    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / f"{name}.png"
    image.save(path, optimize=True)
    return path


def main() -> None:
    # Named per seeded record so the seed script references them by slug.
    plan: list[tuple[str, str]] = [
        ("hero-estate", "hero"),
        ("estate-emerald-ridge", "wide"),
        ("estate-cornerstone-gardens", "wide"),
        ("estate-sabon-lugbe-court", "wide"),
        ("collage-1", "portrait"),
        ("collage-2", "card"),
        ("collage-3", "portrait"),
    ]
    plan += [(f"land-{n:02d}", "card") for n in range(1, 13)]
    plan += [(f"home-{n:02d}", "card") for n in range(1, 9)]
    plan += [(f"article-{n}", "card") for n in range(1, 5)]

    total = 0
    for name, ratio in plan:
        path = render(name, ratio)
        total += path.stat().st_size
    print(f"{len(plan)} placeholders written to {OUT} ({total / 1024:.0f} KB total)")


if __name__ == "__main__":
    main()
