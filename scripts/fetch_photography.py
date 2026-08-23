#!/usr/bin/env python3
"""Fetch the openly-licensed stand-in photography and crop it to the design ratios.

Sourced through Openverse, filtered to commercial-use licences. Every image here
is CC BY 2.0, which permits commercial use and requires attribution — the
attribution string travels into the `Media` row and out to IMAGE_CREDITS.md, so
crediting cannot be forgotten when someone edits the seed.

These are Nigerian terrain photographs standing in for land listings. They are
NOT photographs of the actual plots, and every one renders with a visible
"Representative image" label. Openverse carries no usable Nigerian residential
exteriors, so homes and estates keep the designed placeholders for now.

A fourth candidate (Yankari Reserve) was dropped: a leafless tree over a hazy
plain reads as barren, which is the wrong first impression for a plot listing.

    python3 scripts/fetch_photography.py

Output lands in public/images/photography/ with a manifest alongside it.
"""

from __future__ import annotations

import json
import pathlib
import subprocess

from PIL import Image

OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "images" / "photography"

# 4:3, matching the listing card ratio in design system §8.
CARD = (1000, 750)

SOURCES = [
    {
        "name": "land-terrain-01",
        "url": "https://live.staticflickr.com/4135/4878740433_a30677083a_b.jpg",
        "title": "Rice paddy fields, Niger State",
        "creator": "Jeremy Weate",
        "license": "CC BY 2.0",
        "license_url": "https://creativecommons.org/licenses/by/2.0/",
        "source_url": "https://www.flickr.com/photos/jeremyweate/4878740433",
        "alt": "Open cultivated land in Niger State, Nigeria",
        "bias": 0.55,
    },
    {
        "name": "land-terrain-02",
        "url": "https://live.staticflickr.com/4244/34090106253_848099f41a_b.jpg",
        "title": "River Kaduna near Zunguru, savanna",
        "creator": "Mary Gillham Archive Project",
        "license": "CC BY 2.0",
        "license_url": "https://creativecommons.org/licenses/by/2.0/",
        "source_url": "https://www.flickr.com/photos/maryhgillham/34090106253",
        "alt": "Savanna and riverine land near Kaduna, Nigeria",
        "bias": 0.78,
    },
    {
        "name": "land-terrain-03",
        "url": "https://live.staticflickr.com/4452/36805588243_85dc033dca_b.jpg",
        "title": "Cattle file through still green savanna, Bosso",
        "creator": "Mary Gillham Archive Project",
        "license": "CC BY 2.0",
        "license_url": "https://creativecommons.org/licenses/by/2.0/",
        "source_url": "https://www.flickr.com/photos/maryhgillham/36805588243",
        "alt": "Green savanna grassland with mature trees, Bosso, Nigeria",
        "bias": 0.6,
    },
]


def crop_to_ratio(
    image: Image.Image, size: tuple[int, int], vertical_bias: float = 0.5
) -> Image.Image:
    """Crop to the target aspect, then resize. Never distorts.

    `vertical_bias` decides where the crop sits: 0.5 is centred, higher favours
    the lower part of the frame. Landscape photographs here carry a lot of sky,
    and design system §8 is explicit that a land buyer wants to see the edges of
    what they are buying, not a mood. Biasing downward keeps the ground.
    """
    target_w, target_h = size
    target_ratio = target_w / target_h
    width, height = image.size
    ratio = width / height

    if ratio > target_ratio:
        new_width = int(height * target_ratio)
        left = (width - new_width) // 2
        image = image.crop((left, 0, left + new_width, height))
    else:
        new_height = int(width / target_ratio)
        span = height - new_height
        top = max(0, min(span, int(span * vertical_bias * 2)))
        image = image.crop((0, top, width, top + new_height))

    return image.resize(size, Image.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = []

    for source in SOURCES:
        raw = OUT / f"{source['name']}.raw"
        # curl rather than urllib: this machine's Python has no CA bundle.
        subprocess.run(
            ["curl", "-sSL", "--max-time", "60", "-o", str(raw), source["url"]],
            check=True,
        )

        with Image.open(raw) as image:
            processed = crop_to_ratio(
                image.convert("RGB"), CARD, source.get("bias", 0.5)
            )
            path = OUT / f"{source['name']}.jpg"
            processed.save(path, "JPEG", quality=82, optimize=True, progressive=True)

        raw.unlink()

        manifest.append(
            {
                "name": source["name"],
                "file": f"/images/photography/{source['name']}.jpg",
                "width": CARD[0],
                "height": CARD[1],
                "alt": source["alt"],
                "title": source["title"],
                "creator": source["creator"],
                "license": source["license"],
                "licenseUrl": source["license_url"],
                "sourceUrl": source["source_url"],
                "attribution": (
                    f"\"{source['title']}\" by {source['creator']}, "
                    f"licensed under {source['license']}"
                ),
                "sizeBytes": path.stat().st_size,
            }
        )
        print(f"  {source['name']}.jpg  {path.stat().st_size // 1024} KB")

    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")

    # CC BY requires attribution in a manner reasonable to the medium. The site
    # credits each image in place; this file is the collected record.
    credits = pathlib.Path(__file__).resolve().parent.parent / "IMAGE_CREDITS.md"
    lines = [
        "# Image credits",
        "",
        "Stand-in photography used until the client's own photographs arrive.",
        "Every image below is licensed for commercial use and requires attribution.",
        "",
        "None of these are photographs of the actual plots, homes or estates being",
        "sold. Each renders on the site with a visible *Representative image* label.",
        "",
        "| Image | Title | Creator | Licence | Source |",
        "|---|---|---|---|---|",
    ]
    for item in manifest:
        lines.append(
            f"| `{item['name']}` | {item['title']} | {item['creator']} | "
            f"[{item['license']}]({item['licenseUrl']}) | [Flickr]({item['sourceUrl']}) |"
        )
    lines += [
        "",
        "Regenerate with `python3 scripts/fetch_photography.py`.",
        "",
        "Delete this file, `scripts/fetch_photography.py` and",
        "`public/images/photography/` once real photography replaces these.",
        "",
    ]
    credits.write_text("\n".join(lines))

    print(f"\n{len(manifest)} images written to {OUT}")
    print(f"credits written to {credits}")


if __name__ == "__main__":
    main()
