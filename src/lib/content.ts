import "server-only";
import { db } from "@/lib/db";
import { ArticleStatus, EstateStatus } from "@/generated/prisma/enums";

/**
 * The featured estate block: one lead estate carrying the large image, plus a
 * secondary card. Active estates lead — a delivered one is portfolio evidence
 * rather than something a visitor can buy into today.
 */
export async function getFeaturedEstates(take = 2) {
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
            select: { url: true, alt: true, width: true, height: true },
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
  return db.estate.count({ where: { status: EstateStatus.DELIVERED } });
}

/** The resources teaser — the two most recent published articles. */
export async function getRecentArticles(take = 2) {
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
      coverImage: { select: { url: true, alt: true } },
    },
  });
}

export async function getTestimonials(take = 6) {
  return db.testimonial.findMany({
    where: { published: true },
    orderBy: { position: "asc" },
    take,
    select: { name: true, role: true, quote: true },
  });
}

/** Collage tiles for the FAQ block. Drawn from the media library, not hardcoded paths. */
export async function getCollageImages() {
  return db.media.findMany({
    where: { url: { startsWith: "/images/placeholders/collage-" } },
    orderBy: { url: "asc" },
    select: { url: true, alt: true, width: true, height: true },
  });
}
