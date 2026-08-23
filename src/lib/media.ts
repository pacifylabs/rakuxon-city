/**
 * Placeholder imagery stands in until the client's photography arrives at the
 * Phase 8 content gate. Anything rendering one says so on the image itself,
 * where §8 puts the "Artist's impression" label — a placeholder is never passed
 * off as a photograph of the actual plot.
 *
 * TODO: real photography — delete this module and scripts/generate_placeholders.py
 * once public/images/placeholders is empty.
 */
const PLACEHOLDER_PREFIX = "/images/placeholders/";

export function isPlaceholder(url: string): boolean {
  return url.startsWith(PLACEHOLDER_PREFIX);
}
