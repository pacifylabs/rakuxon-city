import "server-only";
import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import * as fixture from "@/lib/data/fixture";
import type { VideoCardData } from "@/components/video/video-card";
import {
  VIDEOS_PER_PAGE,
  buildVideoWhere,
  type VideoFilters,
} from "@/lib/video-query";

/**
 * Reads for the video tour feature, 06_FEATURE_VIDEO_TOURS.md.
 *
 * Same shape as lib/listings.ts: Prisma when a connection string exists, the
 * bundled snapshot when it does not, and `pnpm verify:parity` asserting the two
 * agree.
 */

const videoSelect = {
  slug: true,
  youtubeId: true,
  title: true,
  description: true,
  kind: true,
  durationSeconds: true,
  isStandIn: true,
  attribution: true,
  poster: { select: { url: true, alt: true } },
  listing: { select: { slug: true, title: true, type: true } },
  estate: { select: { slug: true, name: true } },
} as const;

type VideoRow = {
  slug: string;
  youtubeId: string;
  title: string;
  description: string | null;
  kind: VideoCardData["kind"];
  durationSeconds: number | null;
  isStandIn: boolean;
  attribution: string | null;
  poster: { url: string; alt: string } | null;
  listing: { slug: string; title: string; type: string } | null;
  estate: { slug: string; name: string } | null;
};

/** Every video has exactly one parent; this is where that becomes a link. */
export function toVideoCard(row: VideoRow): VideoCardData {
  const parent = row.listing
    ? {
        href: `/${row.listing.type === "LAND" ? "land" : "homes"}/${row.listing.slug}`,
        name: row.listing.title,
      }
    : row.estate
      ? { href: `/estates/${row.estate.slug}`, name: row.estate.name }
      : null;

  return {
    slug: row.slug,
    youtubeId: row.youtubeId,
    title: row.title,
    description: row.description,
    kind: row.kind,
    durationSeconds: row.durationSeconds,
    poster: row.poster,
    isStandIn: row.isStandIn,
    attribution: row.attribution,
    parent,
  };
}

/**
 * FR-V1.3 — up to four featured videos for the homepage, ordered by sortOrder.
 *
 * The section is hidden entirely below two, but that decision belongs to the
 * component that renders it, not here: a query that silently returns nothing
 * when it found one row is a query that is lying about the data.
 */
export async function getFeaturedVideos(take = 4): Promise<VideoCardData[]> {
  if (!hasDatabase) return fixture.getFeaturedVideos(take);

  const rows = await db.video.findMany({
    where: { featured: true, ...buildVideoWhere({ page: 1 }) },
    select: videoSelect,
    orderBy: { sortOrder: "asc" },
    take,
  });

  return rows.map(toVideoCard);
}

/** FR-V1.1 — the videos attached to one listing. */
export async function getListingVideos(
  listingId: string,
): Promise<VideoCardData[]> {
  if (!hasDatabase) return fixture.getListingVideos(listingId);

  const rows = await db.video.findMany({
    where: { listingId },
    select: videoSelect,
    orderBy: { sortOrder: "asc" },
  });

  return rows.map(toVideoCard);
}

/** FR-V1.2 — the Tours tab on an estate page. */
export async function getEstateVideos(
  estateId: string,
): Promise<VideoCardData[]> {
  if (!hasDatabase) return fixture.getEstateVideos(estateId);

  const rows = await db.video.findMany({
    where: { estateId },
    select: videoSelect,
    orderBy: { sortOrder: "asc" },
  });

  return rows.map(toVideoCard);
}

/** FR-V1.4 — the hub, filterable by kind and estate, paginated at twelve. */
export async function getVideoPage(filters: VideoFilters): Promise<{
  videos: VideoCardData[];
  total: number;
  page: number;
  pageCount: number;
}> {
  if (!hasDatabase) return fixture.getVideoPage(filters);

  const where = buildVideoWhere(filters);

  const query = (page: number) =>
    db.video.findMany({
      where,
      select: videoSelect,
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
      skip: (page - 1) * VIDEOS_PER_PAGE,
      take: VIDEOS_PER_PAGE,
    });

  // Count and rows in parallel, and clamp afterwards — the same shape as
  // getListingPage, and for the same reason: round trips dominate.
  const [total, optimistic] = await Promise.all([
    db.video.count({ where }),
    query(filters.page),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / VIDEOS_PER_PAGE));
  const page = Math.min(filters.page, pageCount);
  const rows = page === filters.page ? optimistic : await query(page);

  return { videos: rows.map(toVideoCard), total, page, pageCount };
}

/** Estates that actually have footage — offering an empty filter is a dead end. */
export async function getVideoFilterOptions() {
  if (!hasDatabase) return fixture.getVideoFilterOptions();

  const estates = await db.estate.findMany({
    where: {
      OR: [
        { videos: { some: {} } },
        { listings: { some: { videos: { some: {} } } } },
      ],
    },
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
  });

  return { estates };
}

/** Slugs for `generateStaticParams` on /tours/[slug]. */
export async function getVideoSlugs(): Promise<string[]> {
  if (!hasDatabase) return fixture.getVideoSlugs();

  const rows = await db.video.findMany({
    where: buildVideoWhere({ page: 1 }),
    select: { slug: true },
  });

  return rows.map((row) => row.slug);
}

/** FR-V1.5 — everything the shareable page needs. */
export async function getVideoDetail(slug: string) {
  if (!hasDatabase) return fixture.getVideoDetail(slug);

  const row = await db.video.findFirst({
    where: { slug, ...buildVideoWhere({ page: 1 }) },
    select: {
      ...videoSelect,
      listing: {
        select: {
          slug: true,
          title: true,
          type: true,
          location: true,
          state: true,
        },
      },
      estate: {
        select: { slug: true, name: true, location: true, state: true },
      },
    },
  });

  if (!row) return null;

  return {
    ...toVideoCard(row),
    context: row.listing
      ? `${row.listing.location}, ${row.listing.state} State`
      : row.estate
        ? `${row.estate.location}, ${row.estate.state} State`
        : null,
  };
}
