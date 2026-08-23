import "server-only";
import { db } from "@/lib/db";
import type { ListingCardData } from "@/components/listings/listing-card";
import { ListingStatus, ListingType } from "@/generated/prisma/enums";

/**
 * The shape every listing card needs, selected in one place so a card rendered
 * on the homepage, a hub, or an estate page is fed identically.
 */
const listingCardSelect = {
  slug: true,
  type: true,
  title: true,
  description: true,
  location: true,
  state: true,
  price: true,
  priceOnRequest: true,
  status: true,
  media: {
    orderBy: { position: "asc" },
    take: 1,
    select: { media: { select: { url: true, alt: true } } },
  },
  landDetail: { select: { plotSize: true, plotUnit: true, titleType: true } },
  homeDetail: { select: { bedrooms: true, bathrooms: true, buildStage: true } },
} as const;

type ListingCardRow = {
  slug: string;
  type: ListingType;
  title: string;
  description: string;
  location: string;
  state: string;
  price: { toString(): string } | null;
  priceOnRequest: boolean;
  status: ListingStatus;
  media: { media: { url: string; alt: string } }[];
  landDetail: {
    plotSize: { toString(): string };
    plotUnit: ListingCardData["land"] extends null
      ? never
      : NonNullable<ListingCardData["land"]>["plotUnit"];
    titleType: NonNullable<ListingCardData["land"]>["titleType"];
  } | null;
  homeDetail: NonNullable<ListingCardData["home"]> | null;
};

/** Prisma `Decimal` never crosses into a component — it is stringified here. */
function toCard(row: ListingCardRow): ListingCardData {
  return {
    slug: row.slug,
    type: row.type,
    title: row.title,
    description: row.description,
    location: row.location,
    state: row.state,
    price: row.price === null ? null : row.price.toString(),
    priceOnRequest: row.priceOnRequest,
    status: row.status,
    image: row.media[0]?.media ?? null,
    land: row.landDetail
      ? {
          plotSize: row.landDetail.plotSize.toString(),
          plotUnit: row.landDetail.plotUnit,
          titleType: row.landDetail.titleType,
        }
      : null,
    home: row.homeDetail,
  };
}

/**
 * Drafts never reach a public surface. Every public query goes through this
 * filter rather than restating `status != draft` and eventually forgetting to.
 */
const publiclyVisible = {
  status: { not: ListingStatus.DRAFT },
} as const;

/** Featured stock, mixed across both tracks so a visitor who won't choose a lane still sees inventory. */
export async function getFeaturedListings(
  take = 6,
): Promise<ListingCardData[]> {
  const rows = await db.listing.findMany({
    where: { ...publiclyVisible, featured: true },
    select: listingCardSelect,
    orderBy: [{ status: "asc" }, { publishedAt: "desc" }],
    take,
  });

  return rows.map(toCard);
}

/**
 * The spotlight carousel. Mixes tracks deliberately, and leads with available
 * stock so the first card a visitor sees is one they can actually enquire about.
 */
export async function getSpotlightListings(
  take = 8,
): Promise<ListingCardData[]> {
  const rows = await db.listing.findMany({
    where: { ...publiclyVisible },
    select: listingCardSelect,
    orderBy: [{ featured: "desc" }, { status: "asc" }, { publishedAt: "desc" }],
    take,
  });

  return rows.map(toCard);
}

/**
 * Live counts for the two-lane block. Read from the database rather than
 * hardcoded, so the figure a visitor sees is the stock that exists.
 */
export async function getLaneCounts(): Promise<{
  land: number;
  homes: number;
}> {
  const [land, homes] = await Promise.all([
    db.listing.count({
      where: {
        ...publiclyVisible,
        type: ListingType.LAND,
        status: ListingStatus.AVAILABLE,
      },
    }),
    db.listing.count({
      where: {
        ...publiclyVisible,
        type: ListingType.HOME,
        status: ListingStatus.AVAILABLE,
      },
    }),
  ]);

  return { land, homes };
}

/**
 * A mixed sample for the primitives page. Deliberately interleaved: a sample
 * drawn in reference order returns homes only, which hides the title ribbon —
 * the one component most worth eyeballing.
 */
export async function getSampleListings(take = 6): Promise<ListingCardData[]> {
  const half = Math.ceil(take / 2);

  const [land, homes] = await Promise.all([
    db.listing.findMany({
      where: { type: ListingType.LAND },
      select: listingCardSelect,
      // Descending by title type leads with the survey-only plot, which is the
      // ribbon state most worth checking by eye.
      orderBy: { landDetail: { titleType: "desc" } },
      take: half,
    }),
    db.listing.findMany({
      where: { type: ListingType.HOME },
      select: listingCardSelect,
      orderBy: { reference: "asc" },
      take: take - half,
    }),
  ]);

  return [...land, ...homes].map(toCard);
}
