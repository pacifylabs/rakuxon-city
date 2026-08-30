import "server-only";
import { db } from "@/lib/db";

/**
 * Estate reads.
 *
 * Kept out of `actions/estates.ts` deliberately: every export from a
 * `"use server"` module becomes a callable POST endpoint, so a plain data
 * query living there would be needlessly reachable from the network. Reads
 * belong in a `server-only` module that can only be imported, not invoked.
 */
export async function listEstatesForAdmin() {
  return db.estate.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      location: true,
      state: true,
      status: true,
      amenities: true,
      _count: { select: { listings: true } },
    },
  });
}

export async function getEstateForEdit(id: string) {
  return db.estate.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      name: true,
      location: true,
      state: true,
      description: true,
      status: true,
      amenities: true,
      latitude: true,
      longitude: true,
    },
  });
}
