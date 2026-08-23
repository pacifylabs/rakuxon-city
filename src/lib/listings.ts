import "server-only";
import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import * as fixture from "@/lib/data/fixture";
import type { ListingCardData } from "@/components/listings/listing-card";
import { ListingStatus, ListingType } from "@/generated/prisma/enums";
import {
  LISTINGS_PER_PAGE,
  buildListingOrderBy,
  buildListingWhere,
  type ListingFilters,
} from "@/lib/listing-query";

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
  landDetail: {
    select: {
      plotSize: true,
      plotUnit: true,
      titleType: true,
      additionalTitleTypes: true,
    },
  },
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
  media: {
    media: {
      url: string;
      alt: string;
      isStandIn: boolean;
      attribution: string | null;
    };
  }[];
  landDetail: {
    plotSize: { toString(): string };
    plotUnit: NonNullable<ListingCardData["land"]>["plotUnit"];
    titleType: NonNullable<ListingCardData["land"]>["titleType"];
    additionalTitleTypes: NonNullable<
      ListingCardData["land"]
    >["additionalTitleTypes"];
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
          additionalTitleTypes: row.landDetail.additionalTitleTypes,
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
  if (!hasDatabase) return fixture.getFeaturedListings(take);
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
  if (!hasDatabase) return fixture.getSpotlightListings(take);
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
  if (!hasDatabase) return fixture.getLaneCounts();
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
  if (!hasDatabase) return fixture.getSampleListings(take);
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

/**
 * A page of listings for a hub, filtered and sorted entirely in the database.
 * The where/orderBy come from lib/listing-query, so price-on-request behaves
 * identically here, on the estate pages, and anywhere else that lists stock.
 */
export async function getListingPage(
  type: ListingType,
  filters: ListingFilters,
): Promise<{
  listings: ListingCardData[];
  total: number;
  page: number;
  pageCount: number;
}> {
  if (!hasDatabase) return fixture.getListingPage(type, filters);

  const where = buildListingWhere(type, filters);
  const orderBy = buildListingOrderBy(filters.sort);

  const query = (page: number) =>
    db.listing.findMany({
      where,
      orderBy: [...orderBy],
      select: listingCardSelect,
      skip: (page - 1) * LISTINGS_PER_PAGE,
      take: LISTINGS_PER_PAGE,
    });

  // The count and the rows go out together rather than one after the other.
  // Every round trip here is a full network hop — measured at roughly a second
  // per page when the database sits on another continent from the app — and
  // the count is only *needed* first in the rare case where the requested page
  // is out of range.
  const [total, optimistic] = await Promise.all([
    db.listing.count({ where }),
    query(filters.page),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / LISTINGS_PER_PAGE));
  const page = Math.min(filters.page, pageCount);

  // Asking for page 5 of a one-page result returns an empty set, which renders
  // the "nothing matches your filters" state over a result set that is not
  // empty at all — a stale link or a hand-edited URL is enough to trigger it.
  // Only that case pays for a second query.
  const rows = page === filters.page ? optimistic : await query(page);

  return { listings: rows.map(toCard), total, page, pageCount };
}

/**
 * Filter options built from stock that actually exists. Offering a state or an
 * estate with nothing in it produces an empty result the visitor blames on the
 * site rather than on the inventory.
 */
export async function getFilterOptions(type: ListingType) {
  if (!hasDatabase) return fixture.getFilterOptions(type);
  const [states, estates] = await Promise.all([
    db.listing.findMany({
      where: { type, status: { not: ListingStatus.DRAFT } },
      distinct: ["state"],
      select: { state: true },
      orderBy: { state: "asc" },
    }),
    db.estate.findMany({
      where: {
        listings: { some: { type, status: { not: ListingStatus.DRAFT } } },
      },
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return { states: states.map((row) => row.state), estates };
}

/** Slugs for `generateStaticParams`. Drafts are excluded, so they cannot be prerendered. */
export async function getListingSlugs(type: ListingType): Promise<string[]> {
  if (!hasDatabase) return fixture.getListingSlugs(type);
  const rows = await db.listing.findMany({
    where: { type, status: { not: ListingStatus.DRAFT } },
    select: { slug: true },
  });

  return rows.map((row) => row.slug);
}

/** FR-1.10 — three related listings from the same estate, falling back to location. */
export async function getRelatedListings(
  listingId: string,
  type: ListingType,
  estateId: string | null,
  location: string,
): Promise<ListingCardData[]> {
  if (!hasDatabase)
    return fixture.getRelatedListings(listingId, type, estateId, location);

  const shared = {
    id: { not: listingId },
    type,
    status: { not: ListingStatus.DRAFT },
  };

  const fromEstate = estateId
    ? await db.listing.findMany({
        where: { ...shared, estateId },
        select: listingCardSelect,
        orderBy: [{ status: "asc" }, { publishedAt: "desc" }],
        take: 3,
      })
    : [];

  if (fromEstate.length === 3) return fromEstate.map(toCard);

  const fromLocation = await db.listing.findMany({
    where: {
      ...shared,
      location,
      ...(estateId ? { NOT: { estateId } } : {}),
    },
    select: listingCardSelect,
    orderBy: [{ status: "asc" }, { publishedAt: "desc" }],
    take: 3 - fromEstate.length,
  });

  return [...fromEstate, ...fromLocation].map(toCard);
}

/** Everything a detail page needs, in one query. */
export async function getListingDetail(slug: string) {
  if (!hasDatabase) return fixture.getListingDetail(slug);
  return db.listing.findFirst({
    where: { slug, status: { not: ListingStatus.DRAFT } },
    select: {
      id: true,
      slug: true,
      reference: true,
      type: true,
      title: true,
      description: true,
      location: true,
      state: true,
      price: true,
      priceOnRequest: true,
      status: true,
      paymentPlanAvailable: true,
      paymentPlanTerms: true,
      estateId: true,
      estate: {
        select: { slug: true, name: true, location: true, state: true },
      },
      media: {
        orderBy: { position: "asc" },
        select: {
          media: {
            select: { url: true, alt: true, width: true, height: true },
          },
        },
      },
      landDetail: {
        select: {
          plotSize: true,
          plotUnit: true,
          titleType: true,
          additionalTitleTypes: true,
          surveyNumber: true,
          topography: true,
          roadAccess: true,
          documents: {
            orderBy: { position: "asc" },
            select: { type: true, note: true },
          },
        },
      },
      homeDetail: {
        select: {
          bedrooms: true,
          bathrooms: true,
          houseType: true,
          buildStage: true,
          handoverDate: true,
          builtArea: true,
          landArea: true,
          finishingSpec: true,
          features: true,
          floorPlan: {
            select: { url: true, alt: true, width: true, height: true },
          },
        },
      },
    },
  });
}

/** Available stock inside one estate, split by track for the detail page tabs. */
export async function getEstateListings(estateId: string) {
  if (!hasDatabase) return fixture.getEstateListings(estateId);
  const rows = await db.listing.findMany({
    where: { estateId, status: { not: ListingStatus.DRAFT } },
    select: listingCardSelect,
    orderBy: [{ status: "asc" }, { publishedAt: "desc" }],
  });

  const listings = rows.map(toCard);

  return {
    land: listings.filter((listing) => listing.type === ListingType.LAND),
    homes: listings.filter((listing) => listing.type === ListingType.HOME),
  };
}

/**
 * Whole-track figures for a hub heading.
 *
 * Deliberately NOT filtered. These sit beside the heading, above the filter
 * chips, and a number that moved when a chip was pressed would read as part of
 * the result set rather than as a fact about the inventory.
 */
export async function getTrackSummary(type: ListingType): Promise<{
  total: number;
  available: number;
  estates: number;
}> {
  if (!hasDatabase) return fixture.getTrackSummary(type);

  const [total, available, estates] = await Promise.all([
    db.listing.count({ where: { ...publiclyVisible, type } }),
    db.listing.count({
      where: { ...publiclyVisible, type, status: ListingStatus.AVAILABLE },
    }),
    db.estate.count({
      where: { listings: { some: { ...publiclyVisible, type } } },
    }),
  ]);

  return { total, available, estates };
}
