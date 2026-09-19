import "server-only";
import { randomInt } from "node:crypto";
import type { PrismaClient } from "@/generated/prisma/client";
import { ListingType } from "@/generated/prisma/enums";
import { slugify } from "@/lib/admin/slugify";

export function generateListerReference(type: ListingType): string {
  const tag = type === ListingType.LAND ? "LND" : "HME";
  return `RXC-${tag}-${randomInt(1000, 9999)}`;
}

/** Collision-safe slug from the listing title. */
export async function uniqueListerSlug(
  db: Pick<PrismaClient, "listing">,
  title: string,
): Promise<string> {
  const base = slugify(title) || "listing";
  for (let attempt = 0; attempt < 8; attempt++) {
    const suffix = attempt === 0 ? "" : `-${randomInt(100, 9999)}`;
    const slug = `${base}${suffix}`.slice(0, 120);
    const taken = await db.listing.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!taken) return slug;
  }
  return `${base}-${Date.now()}`.slice(0, 120);
}
