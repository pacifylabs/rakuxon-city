#!/usr/bin/env python3
"""Fetch the stand-in photography and crop it to the design system's ratios.

Sources live in scripts/photography-sources.json, found through Openverse.

LICENCE GUARD — read before adding a source.

Every image here is cropped and resized, which makes a derivative work. That
rules out two licences Openverse happily returns under its "commercial use"
filter:

  * CC BY-ND forbids distributing a modified version at all.
  * CC BY-SA would push its share-alike terms onto the cropped file.

Only CC BY, CC0 and Public Domain Mark are accepted, and `main` refuses to run
if anything else appears in the source list. Attribution travels into the Media
row and out to IMAGE_CREDITS.md, so a credit cannot be lost by editing the seed.

None of these photograph the actual plots, homes or estates being sold. Every
one renders behind a visible "Representative image" label, driven by
`Media.isStandIn` rather than by a filename.

    python3 scripts/fetch_photography.py

Output lands in public/images/photography/ with a manifest alongside it.
"""

from __future__ import annotations

import json
import pathlib
import subprocess
import sys

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "images" / "photography"
SOURCES = ROOT / "scripts" / "photography-sources.json"

ALLOWED_LICENCES = {"CC BY 2.0", "CC BY 4.0", "CC0 1.0", "Public Domain Mark"}

# The aspect ratios design system §8 calls for.
RATIOS = {
    "hero": (1200, 675),      # 16:9
    "card": (900, 675),       # 4:3
    "portrait": (675, 900),    # 3:4
    "wide": (1000, 625),      # estate feature
}


def crop_to_ratio(
    image: Image.Image, size: tuple[int, int], vertical_bias: float = 0.5
) -> Image.Image:
    """Crop to the target aspect, then resize. Never distorts.

    `vertical_bias` decides where the crop sits: 0.5 is centred, higher favours
    the lower part of the frame. Landscape photographs carry a lot of sky, and
    §8 is explicit that a land buyer wants to see the edges of what they are
    buying, not a mood.
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
    sources = json.loads(SOURCES.read_text())

    unsafe = [s for s in sources if s["license"] not in ALLOWED_LICENCES]
    if unsafe:
        for source in unsafe:
            print(
                f"REFUSED {source['name']}: {source['license']} forbids or "
                f"encumbers the cropped derivative we publish",
                file=sys.stderr,
            )
        raise SystemExit("Unsafe licence in the source list — see the guard above.")

    OUT.mkdir(parents=True, exist_ok=True)
    manifest = []

    for source in sources:
        raw = OUT / f"{source['name']}.raw"
        # curl rather than urllib: this machine's Python has no CA bundle.
        subprocess.run(
            ["curl", "-sSL", "--max-time", "60", "-o", str(raw), source["url"]],
            check=True,
        )

        size = RATIOS[source["ratio"]]
        with Image.open(raw) as image:
            processed = crop_to_ratio(
                image.convert("RGB"), size, source.get("bias", 0.5)
            )
            path = OUT / f"{source['name']}.jpg"
            processed.save(path, "JPEG", quality=72, optimize=True, progressive=True)

        raw.unlink()

        attribution = (
            f"\"{source['title']}\" by {source['creator']}, "
            f"licensed under {source['license']}"
            if source.get("attribution_required", True)
            else None
        )

        manifest.append(
            {
                "name": source["name"],
                "file": f"/images/photography/{source['name']}.jpg",
                "width": size[0],
                "height": size[1],
                "alt": source["alt"],
                "title": source["title"],
                "creator": source["creator"],
                "license": source["license"],
                "licenseUrl": source["license_url"],
                "sourceUrl": source["source_url"],
                "attribution": attribution,
                "sizeBytes": path.stat().st_size,
            }
        )
        print(
            f"  {source['name']:<28} {path.stat().st_size // 1024:>4} KB  {source['license']}"
        )

    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")

    # CC BY requires attribution in a manner reasonable to the medium. The site
    # credits each image in place; this file is the collected record.
    lines = [
        "# Image credits",
        "",
        "Stand-in photography used until the client's own photographs arrive.",
        "",
        "None of these photograph the actual plots, homes or estates being sold.",
        "Each renders on the site behind a visible *Representative image* label.",
        "",
        "Every image is cropped and resized, which makes a derivative work, so only",
        "CC BY, CC0 and Public Domain Mark are used. `scripts/fetch_photography.py`",
        "refuses to run against a BY-ND or BY-SA source.",
        "",
        "| Image | Title | Creator | Licence | Source |",
        "|---|---|---|---|---|",
    ]
    for item in manifest:
        credit = item["creator"] if item["attribution"] else "—"
        lines.append(
            f"| `{item['name']}` | {item['title']} | {credit} | "
            f"[{item['license']}]({item['licenseUrl']}) | [source]({item['sourceUrl']}) |"
        )
    lines += [
        "",
        f"{len(manifest)} images. Regenerate with `python3 scripts/fetch_photography.py`.",
        "",
        "Delete this file, `scripts/fetch_photography.py`,",
        "`scripts/photography-sources.json` and `public/images/photography/`",
        "once the client's own photography replaces these.",
        "",
    ]
    (ROOT / "IMAGE_CREDITS.md").write_text("\n".join(lines))

    print(f"\n{len(manifest)} images written to {OUT}")


if __name__ == "__main__":
    main()
