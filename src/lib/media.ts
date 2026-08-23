import "server-only";
import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import * as fixture from "@/lib/data/fixture";

/**
 * Stand-in imagery — openly-licensed photographs of somewhere else — stands
 * in until the client's own photography arrives.
 *
 * Anything rendering one shows a visible label, in the same caption slot where
 * design system §8 puts "Artist's impression". That matters more here than on
 * most sites: a listing states a survey number and a title type, so a visitor
 * has every reason to believe the photograph above it is the plot itself. It is
 * not, and the page says so.
 *
 * The flag lives on the `Media` row rather than being inferred from the URL, so
 * clearing it is what removes the label — one image at a time, as real
 * photography lands, without a code change.
 */
export type StandInContext = "plot" | "property" | "generic";

export function standInLabel(context: StandInContext): string {
  switch (context) {
    case "plot":
      return "Representative image — not the actual plot";
    case "property":
      return "Representative image — not the actual property";
    default:
      return "Representative image";
  }
}

/**
 * Named image slots for page furniture — the hero, the FAQ collage, the logo,
 * the share image. Resolved by key so an admin can swap the row behind a slot
 * without anything in the code matching on a filename.
 */
export async function getPlacements(keys: string[]) {
  if (!hasDatabase) return fixture.getPlacements(keys);
  const rows = await db.mediaPlacement.findMany({
    where: { key: { in: keys } },
    select: {
      key: true,
      media: {
        select: {
          url: true,
          alt: true,
          width: true,
          height: true,
          isStandIn: true,
          attribution: true,
        },
      },
    },
  });

  return new Map(rows.map((row) => [row.key, row.media]));
}

export async function getPlacement(key: string) {
  return (await getPlacements([key])).get(key) ?? null;
}
