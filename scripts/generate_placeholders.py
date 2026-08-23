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

# Half the dimensions a photograph would need. These are flat tonal fields with
# no detail to lose, and the hero frame is the page's LCP element.
RATIOS = {
    "hero": (1200, 675),     # 16:9
    "card": (800, 600),      # 4:3
    "portrait": (600, 800),  # 3:4
    "wide": (1000, 625),     # estate feature
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

    digest = hashlib.sha256(name.encode()).digest()

    # A horizon placed off-centre, then two shallower bands below it. A single
    # flat field reads as a broken image once it is 760px wide; the banding gives
    # a large frame enough structure to read as deliberate without pretending to
    # be a picture of anything.
    horizon = int(height * (0.46 + (digest[1] % 14) / 100))
    draw.rectangle([0, horizon, width, height], fill=band)

    mid = tuple(round((b * 2 + t) / 3) for b, t in zip(band, base))
    lower = tuple(max(0, round(c * 0.94)) for c in band)
    first = horizon + int((height - horizon) * 0.34)
    second = horizon + int((height - horizon) * 0.68)
    draw.rectangle([0, horizon, width, first], fill=mid)
    draw.rectangle([0, second, width, height], fill=lower)

    # Faint verticals echoing the container column rules in §4, offset per image
    # so a grid of placeholders does not line up into a single stripe.
    offset = (digest[2] % 12) / 100
    for fraction in (0.18 + offset, 0.62 + offset):
        x = int(width * min(fraction, 0.94))
        draw.line([(x, 0), (x, height)], fill=HAIRLINE, width=2)

    for y in (horizon, first, second):
        draw.line([(0, y), (width, y)], fill=HAIRLINE, width=2)

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
