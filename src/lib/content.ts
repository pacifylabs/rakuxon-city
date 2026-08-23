import "server-only";
import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import * as fixture from "@/lib/data/fixture";
import { getPlacements } from "@/lib/media";
import { ArticleStatus, EstateStatus } from "@/generated/prisma/enums";

/**
 * The featured estate block: one lead estate carrying the large image, plus a
 * secondary card. Active estates lead — a delivered one is portfolio evidence
 * rather than something a visitor can buy into today.
 */
export async function getFeaturedEstates(take = 2) {
  if (!hasDatabase) return fixture.getFeaturedEstates(take);
  const estates = await db.estate.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    take,
    select: {
      slug: true,
      name: true,
      location: true,
      state: true,
      description: true,
      status: true,
      amenities: true,
      media: {
        orderBy: { position: "asc" },
        take: 1,
        select: {
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
      },
      _count: { select: { listings: { where: { status: { not: "DRAFT" } } } } },
    },
  });

  return estates.map((estate) => ({
    slug: estate.slug,
    name: estate.name,
    location: estate.location,
    state: estate.state,
    description: estate.description,
    status: estate.status,
    amenities: estate.amenities,
    listingCount: estate._count.listings,
    image: estate.media[0]?.media ?? null,
  }));
}

export async function getDeliveredEstateCount() {
  if (!hasDatabase) return fixture.getDeliveredEstateCount();
  return db.estate.count({ where: { status: EstateStatus.DELIVERED } });
}

/** The resources teaser — the two most recent published articles. */
export async function getRecentArticles(take = 2) {
  if (!hasDatabase) return fixture.getRecentArticles(take);
  return db.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    orderBy: { publishedAt: "desc" },
    take,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      category: true,
      publishedAt: true,
      coverImage: {
        select: { url: true, alt: true, isStandIn: true, attribution: true },
      },
    },
  });
}

export async function getTestimonials(take = 6) {
  if (!hasDatabase) return fixture.getTestimonials(take);
  return db.testimonial.findMany({
    where: { published: true },
    orderBy: { position: "asc" },
    take,
    select: { name: true, role: true, quote: true },
  });
}

/**
 * Collage tiles for the FAQ block, resolved through named placements.
 *
 * These were previously found by matching on a URL prefix, which would have
 * broken the first time an admin uploaded a replacement under a different
 * filename. The slot key is stable; the row behind it is not.
 */
export async function getCollageImages() {
  if (!hasDatabase) return fixture.getCollageImages();
  const placements = await getPlacements([
    "homepage.collage.1",
    "homepage.collage.2",
    "homepage.collage.3",
  ]);

  return ["homepage.collage.1", "homepage.collage.2", "homepage.collage.3"]
    .map((key) => placements.get(key))
    .filter((media) => media !== undefined);
}

/** Every estate, for the index. Active first — delivered ones are portfolio evidence. */
export async function getEstates() {
  if (!hasDatabase) return fixture.getEstates();
  const estates = await db.estate.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
    select: {
      slug: true,
      name: true,
      location: true,
      state: true,
      description: true,
      status: true,
      amenities: true,
      media: {
        orderBy: { position: "asc" },
        take: 1,
        select: {
          media: {
            select: {
              url: true,
              alt: true,
              isStandIn: true,
              attribution: true,
            },
          },
        },
      },
      /*
       * The statuses, not two `_count`s. Prisma counts a relation once per
       * query, so "available" and "all published" cannot both be `_count`
       * entries on `listings`. Pulling the statuses gets both from one query
       * without an N+1, and estates are few enough that the rows are trivial.
       */
      listings: {
        where: { status: { not: "DRAFT" } },
        select: { status: true },
      },
    },
  });

  /*
   * Built explicitly rather than spread.
   *
   * Spreading the row leaked `_count` and `media` into the return type, so this
   * function and its snapshot twin resolved to a union of two different shapes
   * and `listingCount` was reachable on neither. Both paths now return the same
   * object, which is what lets lib/data/fixture.ts stand in for this one.
   */
  return estates.map((estate) => ({
    slug: estate.slug,
    name: estate.name,
    location: estate.location,
    state: estate.state,
    description: estate.description,
    status: estate.status,
    amenities: estate.amenities,
    availableCount: estate.listings.filter(
      (listing) => listing.status === "AVAILABLE",
    ).length,
    listingCount: estate.listings.length,
    image: estate.media[0]?.media ?? null,
  }));
}

export async function getEstateSlugs(): Promise<string[]> {
  if (!hasDatabase) return fixture.getEstateSlugs();
  const rows = await db.estate.findMany({ select: { slug: true } });
  return rows.map((row) => row.slug);
}

export async function getEstateDetail(slug: string) {
  if (!hasDatabase) return fixture.getEstateDetail(slug);
  return db.estate.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      location: true,
      state: true,
      description: true,
      status: true,
      amenities: true,
      media: {
        orderBy: { position: "asc" },
        select: {
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
      },
    },
  });
}

/** Published articles for the resources index, newest first within each category. */
export async function getArticles() {
  if (!hasDatabase) return fixture.getArticles();
  return db.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    orderBy: [{ category: "asc" }, { publishedAt: "desc" }],
    select: {
      slug: true,
      title: true,
      excerpt: true,
      category: true,
      publishedAt: true,
      coverImage: {
        select: { url: true, alt: true, isStandIn: true, attribution: true },
      },
    },
  });
}

export async function getArticleSlugs(): Promise<string[]> {
  if (!hasDatabase) return fixture.getArticleSlugs();
  const rows = await db.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    select: { slug: true },
  });
  return rows.map((row) => row.slug);
}

export async function getArticle(slug: string) {
  if (!hasDatabase) return fixture.getArticle(slug);
  return db.article.findFirst({
    where: { slug, status: ArticleStatus.PUBLISHED },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      body: true,
      category: true,
      publishedAt: true,
      coverImage: {
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
}
