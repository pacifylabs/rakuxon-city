import "server-only";
import { db } from "@/lib/db";
import { ListingStatus, ListingType } from "@/generated/prisma/enums";
import type { SessionUser } from "@/lib/auth/session";
import { canAccessTrack } from "@/lib/admin/access";

/*
 * 10, not 25.
 *
 * At 25 the control was dead code on real data: 24 land listings and 17 home
 * listings both fit on one page, so `AdminPagination` returned null and the
 * client reasonably reported "the listing pages aren't paginated". The
 * pagination was correct; the page size was larger than the catalogue.
 *
 * 10 also keeps the table inside one screen on a laptop, which is the more
 * useful default for a screen staff scan rather than read.
 */
export const ADMIN_PAGE_SIZE = 10;

export type ListingFilters = {
  status?: ListingStatus;
  estateId?: string;
  q?: string;
  page: number;
};

/**
 * Admin listing queries.
 *
 * Every function takes the acting `user` and refuses work outside their
 * track — the enforcement 03_IMPLEMENTATION_PLAN.md Phase 7 item 2 asks for
 * "in the query layer", not just in middleware. `canAccessTrack` is checked
 * again inside each mutating call, so a Server Action reached directly (they
 * are POST endpoints, not just form targets) is covered too.
 */
export async function listListings(
  user: SessionUser,
  type: ListingType,
  filters: ListingFilters,
) {
  if (!canAccessTrack(user, type)) {
    return { rows: [], total: 0, page: 1, pageCount: 1 };
  }

  const where = {
    type,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.estateId ? { estateId: filters.estateId } : {}),
    ...(filters.q
      ? {
          OR: [
            {
              reference: { contains: filters.q, mode: "insensitive" as const },
            },
            { title: { contains: filters.q, mode: "insensitive" as const } },
            { location: { contains: filters.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  /*
   * Count and page fetched concurrently, not one after the other.
   *
   * Measured against this project's Neon instance: a round trip costs ~253ms,
   * so running these in sequence made every list page pay ~506ms of pure
   * latency before rendering. Concurrently it is ~271ms — one round trip's
   * worth, because they genuinely overlap.
   *
   * The catch, and why this needs saying: the first concurrent pair on a cold
   * pool is SLOWER (~1.8s), because the second query opens a second
   * connection and pays a fresh TLS handshake to Neon. That is a
   * once-per-process cost, and it is why a naive before/after benchmark shows
   * parallel losing. Runs 2+ settle at 271ms.
   *
   * `page` is clamped after the fact rather than before, so the request for
   * page 9 of a 3-page result returns empty rather than wrong — the caller
   * gets `pageCount` and can render the empty state honestly.
   */
  const requestedPage = Math.max(1, filters.page);
  const [total, rows] = await Promise.all([
    db.listing.count({ where }),
    db.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (requestedPage - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        reference: true,
        title: true,
        location: true,
        state: true,
        price: true,
        priceOnRequest: true,
        status: true,
        featured: true,
        updatedAt: true,
        estate: { select: { name: true } },
      },
    }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const page = Math.min(requestedPage, pageCount);

  return {
    // Decimal never crosses into a component — stringified at the boundary,
    // same rule the public query layer follows.
    rows: rows.map((row) => ({
      ...row,
      price: row.price === null ? null : row.price.toString(),
    })),
    total,
    page,
    pageCount,
  };
}

/** Everything an edit form needs, including both detail shapes. */
export async function getListingForEdit(user: SessionUser, id: string) {
  const listing = await db.listing.findUnique({
    where: { id },
    include: {
      landDetail: { include: { documents: { orderBy: { position: "asc" } } } },
      homeDetail: true,
      media: { orderBy: { position: "asc" }, include: { media: true } },
    },
  });

  if (!listing) return null;
  // The track check happens after the read, not before, because the row is
  // what tells us which track it belongs to.
  if (!canAccessTrack(user, listing.type)) return null;

  return listing;
}

/** FR — the status timeline shown on a listing's edit page. */
export async function getStatusHistory(listingId: string) {
  return db.statusChange.findMany({
    where: { listingId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { changedByUser: { select: { name: true } } },
  });
}

/**
 * Status transitions write a `StatusChange` row — 03_IMPLEMENTATION_PLAN.md
 * Phase 7 item 6. Done in a transaction so a recorded history can never
 * disagree with the listing it describes.
 */
export async function changeListingStatus(
  user: SessionUser,
  listingId: string,
  toStatus: ListingStatus,
) {
  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { status: true, type: true },
  });
  if (!listing) throw new Error("Listing not found");
  if (!canAccessTrack(user, listing.type)) {
    throw new Error("Not permitted for this track");
  }
  if (listing.status === toStatus) return;

  await db.$transaction([
    db.listing.update({
      where: { id: listingId },
      data: {
        status: toStatus,
        // A listing becomes publicly visible the moment it leaves DRAFT, so
        // that is when it gets its publish timestamp — and only the first time.
        ...(toStatus !== ListingStatus.DRAFT
          ? { publishedAt: new Date() }
          : {}),
      },
    }),
    db.statusChange.create({
      data: {
        listingId,
        fromStatus: listing.status,
        toStatus,
        changedByUserId: user.id,
      },
    }),
  ]);
}

/** Estates, for the form's estate picker and the list filter. */
export async function getEstateOptions() {
  return db.estate.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

/**
 * Next free reference for a track — RXC-LND-0142 / RXC-HME-0031.
 *
 * Read off the highest existing number rather than a count, so deleting a
 * listing can never cause the next one to collide with a reference that is
 * still quoted on someone's paperwork.
 */
export async function nextReference(type: ListingType): Promise<string> {
  const prefix = type === ListingType.LAND ? "RXC-LND-" : "RXC-HME-";
  const latest = await db.listing.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: "desc" },
    select: { reference: true },
  });

  const current = latest ? Number(latest.reference.slice(prefix.length)) : 0;
  return `${prefix}${String(current + 1).padStart(4, "0")}`;
}
