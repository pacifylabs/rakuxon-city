/**
 * Where an image is going, and what that requires of it.
 *
 * 04_DESIGN_SYSTEM.md §8 fixes the ratios the site actually renders: 4:3 on
 * cards, 16:9 for hero and video posters, 3:4 for the portrait collage tiles.
 * Until now the library accepted anything, which is how a 5000×800 panorama
 * ends up cropped to an unreadable strip on a listing card — `object-cover`
 * hides the mistake at upload and reveals it on the public site.
 *
 * So an upload picks its purpose and is measured against it. The tolerance is
 * deliberately loose (±8%): a photograph cropped by hand in Preview lands a
 * few pixels off a clean ratio, and rejecting that would be pedantry. What it
 * catches is the genuinely wrong shape.
 *
 * `minWidth` matters more than the ratio on a retina screen — a 600px image
 * in a 600px slot is soft on every modern display, so each preset asks for
 * roughly twice its largest rendered width.
 */
export type MediaPurpose =
  | "card"
  | "hero"
  | "portrait"
  | "document"
  | "avatar";

export type MediaPreset = {
  value: MediaPurpose;
  label: string;
  hint: string;
  /** width ÷ height, or null where any shape is acceptable. */
  ratio: number | null;
  minWidth: number;
  minHeight: number;
};

export const MEDIA_PRESETS: MediaPreset[] = [
  {
    value: "card",
    label: "Listing or estate photo (4:3)",
    hint: "The main photography on cards and galleries. 1600×1200 or larger.",
    ratio: 4 / 3,
    minWidth: 1600,
    minHeight: 1200,
  },
  {
    value: "hero",
    label: "Hero or video poster (16:9)",
    hint: "Full-width bands and video posters. 1920×1080 or larger.",
    ratio: 16 / 9,
    minWidth: 1920,
    minHeight: 1080,
  },
  {
    value: "portrait",
    label: "Portrait collage tile (3:4)",
    hint: "The tall tiles in the homepage collage. 1200×1600 or larger.",
    ratio: 3 / 4,
    minWidth: 1200,
    minHeight: 1600,
  },
  {
    value: "document",
    label: "Document scan (any shape)",
    hint: "A survey plan or certificate. Legibility matters more than shape.",
    ratio: null,
    minWidth: 1000,
    minHeight: 1000,
  },
  {
    value: "avatar",
    label: "Portrait headshot (1:1)",
    hint: "Testimonial and staff photographs. 600×600 or larger.",
    ratio: 1,
    minWidth: 600,
    minHeight: 600,
  },
];

/** ±8% — loose enough for a hand crop, tight enough to catch a wrong shape. */
const RATIO_TOLERANCE = 0.08;

export function presetFor(value: string): MediaPreset | null {
  return MEDIA_PRESETS.find((preset) => preset.value === value) ?? null;
}

export function checkDimensions(
  preset: MediaPreset,
  width: number,
  height: number,
): string | null {
  if (width < preset.minWidth || height < preset.minHeight) {
    return `That image is ${width}×${height}. A ${preset.label.toLowerCase()} needs at least ${preset.minWidth}×${preset.minHeight}, or it will look soft on a high-resolution screen.`;
  }

  if (preset.ratio !== null) {
    const actual = width / height;
    const drift = Math.abs(actual - preset.ratio) / preset.ratio;
    if (drift > RATIO_TOLERANCE) {
      const target = ratioLabel(preset.ratio);
      return `That image is ${width}×${height}, which is not close enough to ${target}. Crop it to ${target} first — otherwise the site will crop it for you, and not where you would have chosen.`;
    }
  }

  return null;
}

function ratioLabel(ratio: number): string {
  if (Math.abs(ratio - 4 / 3) < 0.01) return "4:3";
  if (Math.abs(ratio - 16 / 9) < 0.01) return "16:9";
  if (Math.abs(ratio - 3 / 4) < 0.01) return "3:4";
  if (Math.abs(ratio - 1) < 0.01) return "1:1";
  return ratio.toFixed(2);
}
