import "server-only";
import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import * as fixture from "@/lib/data/fixture";

/**
 * Stand-in imagery — openly-licensed photographs of somewhere else — stands in
 * until the client's own photography arrives.
 *
 * These images no longer carry an on-image label. That was removed at the
 * client's instruction; attribution now lives on /credits, linked from the
 * footer, which is how CC BY expects a website to credit. `Media.isStandIn`
 * is still set on every one of these rows, because the admin needs to know
 * which images are placeholders even though the public pages no longer say so.
 *
 * See TODO §2.2 — replacing them with real photography is a launch gate.
 */

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
