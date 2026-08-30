import "server-only";
import { db } from "@/lib/db";

export const MEDIA_PAGE_SIZE = 40;

export type MediaFilters = {
  q?: string;
  standInOnly?: boolean;
  unusedOnly?: boolean;
  page: number;
};

/**
 * Usage count for a media row, summed across every relation that can point
 * at it. There is no single join table — an image can be a listing photo, an
 * estate photo, a floor plan, a land document scan, an article cover, a
 * testimonial portrait, a video poster or a named placement — so "is this in
 * use?" has to ask all eight.
 *
 * This is what makes delete safe: the spec asks for "Delete with usage
 * check", and `MediaPlacement.mediaId` is `onDelete: Restrict`, so deleting a
 * placed image would throw a raw database error rather than a useful message.
 */
const usageCounts = {
  _count: {
    select: {
      listingMedia: true,
      estateMedia: true,
      placements: true,
      floorPlanFor: true,
      landDocuments: true,
      articleCovers: true,
      testimonialFor: true,
      videoPosters: true,
    },
  },
} as const;

export type MediaUsage = {
  listingMedia: number;
  estateMedia: number;
  placements: number;
  floorPlanFor: number;
  landDocuments: number;
  articleCovers: number;
  testimonialFor: number;
  videoPosters: number;
};

export function totalUsage(counts: MediaUsage): number {
  return (
    counts.listingMedia +
    counts.estateMedia +
    counts.placements +
    counts.floorPlanFor +
    counts.landDocuments +
    counts.articleCovers +
    counts.testimonialFor +
    counts.videoPosters
  );
}

export async function listMedia(filters: MediaFilters) {
  const where = {
    ...(filters.standInOnly ? { isStandIn: true } : {}),
    ...(filters.q
      ? {
          OR: [
            { alt: { contains: filters.q, mode: "insensitive" as const } },
            { url: { contains: filters.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  /*
   * `unusedOnly` is the one filter Prisma cannot express — "zero rows across
   * eight different relations" has no `where` form — so it is resolved with a
   * dedicated id query rather than by loading the whole table.
   *
   * This used to `findMany` every media row with all eight counts included,
   * then filter and paginate in JavaScript, which meant the library page grew
   * linearly with the catalogue whether or not the filter was on. Now the
   * unfiltered path pages in the database like every other list, and only the
   * `unusedOnly` path pays for the extra pass.
   */
  if (!filters.unusedOnly) {
    // Concurrent — see the note in queries/listings.ts.
    const requestedPage = Math.max(1, filters.page);
    const [total, rows] = await Promise.all([
      db.media.count({ where }),
      db.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (requestedPage - 1) * MEDIA_PAGE_SIZE,
        take: MEDIA_PAGE_SIZE,
        include: usageCounts,
      }),
    ]);

    const pageCount = Math.max(1, Math.ceil(total / MEDIA_PAGE_SIZE));
    const page = Math.min(requestedPage, pageCount);

    return { rows, total, page, pageCount };
  }

  // Ids only — eight counts per row, but no image payload and no ordering
  // work, then the page itself is fetched by id.
  const candidates = await db.media.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: { id: true, ...usageCounts },
  });

  const unusedIds = candidates
    .filter((row) => totalUsage(row._count) === 0)
    .map((row) => row.id);

  const total = unusedIds.length;
  const pageCount = Math.max(1, Math.ceil(total / MEDIA_PAGE_SIZE));
  const page = Math.min(Math.max(1, filters.page), pageCount);
  const pageIds = unusedIds.slice(
    (page - 1) * MEDIA_PAGE_SIZE,
    page * MEDIA_PAGE_SIZE,
  );

  const rows = await db.media.findMany({
    where: { id: { in: pageIds } },
    orderBy: { createdAt: "desc" },
    include: usageCounts,
  });

  return { rows, total, page, pageCount };
}

export async function getMediaUsage(id: string) {
  return db.media.findUnique({ where: { id }, include: usageCounts });
}

/** The named slots — site.logo, homepage.hero, homepage.collage.N, and so on. */
export async function listPlacements() {
  return db.mediaPlacement.findMany({
    orderBy: { key: "asc" },
    include: { media: true },
  });
}

/** Every image, for a placement picker. Small table; no pagination needed. */
export async function allMediaOptions() {
  return db.media.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, url: true, alt: true, isStandIn: true },
  });
}
