import "server-only";
import snapshot from "@/data/snapshot.json";
import type { ListingCardData } from "@/components/listings/listing-card";
import {
  LISTINGS_PER_PAGE,
  plotSizeBands,
  priceBands,
  type ListingFilters,
  type SortOption,
} from "@/lib/listing-query";
import type {
  ArticleCategory,
  ArticleStatus,
  BuildStage,
  DocumentType,
  EstateStatus,
  HouseType,
  ListingStatus,
  ListingType,
  PlotUnit,
  TitleType,
} from "@/generated/prisma/enums";

/**
 * The read path used when no DATABASE_URL is configured.
 *
 * The public site is read-only until Phase 7, so a snapshot of the seeded
 * catalogue is enough to serve the whole thing — which is what lets the preview
 * build and deploy on a clean checkout with no database, no Docker and no .env.
 *
 * This mirrors the Prisma queries rather than replacing them. Postgres stays the
 * real path the moment a connection string exists, and `pnpm verify:parity`
 * asserts the two agree so this cannot quietly drift.
 *
 * Content has one source of truth: prisma/seed.ts, via `pnpm snapshot`.
 */

type SnapshotImage = {
  url: string;
  alt: string;
  width: number;
  height: number;
  isStandIn: boolean;
  attribution: string | null;
};

type MediaLink = { position: number; media: SnapshotImage };

/**
 * JSON widens every enum to `string`, so the snapshot is given its real types
 * once here. One cast, at the boundary, rather than a cast at each call site.
 */
type SnapshotListing = {
  id: string;
  slug: string;
  reference: string;
  type: ListingType;
  title: string;
  description: string;
  estateId: string | null;
  estate: {
    slug: string;
    name: string;
    location: string;
    state: string;
  } | null;
  location: string;
  state: string;
  price: string | null;
  priceOnRequest: boolean;
  status: ListingStatus;
  paymentPlanAvailable: boolean;
  paymentPlanTerms: unknown;
  featured: boolean;
  publishedAt: string | null;
  media: MediaLink[];
  landDetail: {
    plotSize: string;
    plotUnit: PlotUnit;
    titleType: TitleType;
    additionalTitleTypes: TitleType[];
    surveyNumber: string | null;
    topography: string | null;
    roadAccess: string | null;
    documents: { type: DocumentType; note: string | null; position: number }[];
  } | null;
  homeDetail: {
    bedrooms: number;
    bathrooms: number;
    houseType: HouseType;
    buildStage: BuildStage;
    handoverDate: string | null;
    builtArea: string;
    landArea: string;
    finishingSpec: string;
    features: string[];
    floorPlan: SnapshotImage | null;
  } | null;
};

type SnapshotEstate = {
  id: string;
  slug: string;
  name: string;
  location: string;
  state: string;
  description: string;
  status: EstateStatus;
  amenities: string[];
  media: MediaLink[];
};

type SnapshotArticle = {
  slug: string;
  title: string;
  category: ArticleCategory;
  excerpt: string;
  body: string;
  status: ArticleStatus;
  publishedAt: string | null;
  coverImage: SnapshotImage | null;
};

type Snapshot = {
  listings: SnapshotListing[];
  estates: SnapshotEstate[];
  articles: SnapshotArticle[];
  testimonials: {
    name: string;
    role: string;
    quote: string;
    published: boolean;
  }[];
  placements: { key: string; media: SnapshotImage }[];
};

const data = snapshot as unknown as Snapshot;

const listings = data.listings;
const estates = data.estates;
const articles = data.articles;
const testimonials = data.testimonials;
const placements = data.placements;

/** Drafts never reach a public surface, the same rule the Prisma path applies. */
const published = listings.filter((listing) => listing.status !== "DRAFT");

function toCard(listing: (typeof listings)[number]): ListingCardData {
  return {
    slug: listing.slug,
    type: listing.type,
    title: listing.title,
    description: listing.description,
    location: listing.location,
    state: listing.state,
    price: listing.price ?? null,
    priceOnRequest: listing.priceOnRequest,
    status: listing.status,
    image: listing.media[0]?.media
      ? {
          url: listing.media[0].media.url,
          alt: listing.media[0].media.alt,
          isStandIn: listing.media[0].media.isStandIn,
          attribution: listing.media[0].media.attribution,
        }
      : null,
    land: listing.landDetail
      ? {
          plotSize: listing.landDetail.plotSize,
          plotUnit: listing.landDetail.plotUnit,
          titleType: listing.landDetail.titleType,
          additionalTitleTypes: listing.landDetail.additionalTitleTypes,
        }
      : null,
    home: listing.homeDetail
      ? {
          bedrooms: listing.homeDetail.bedrooms,
          bathrooms: listing.homeDetail.bathrooms,
          buildStage: listing.homeDetail.buildStage,
        }
      : null,
  };
}

/** Mirrors buildListingWhere. Kept beside it in review, and parity-tested. */
function matches(listing: (typeof listings)[number], filters: ListingFilters) {
  if (filters.state && listing.state !== filters.state) return false;
  if (filters.estate && listing.estate?.slug !== filters.estate) return false;
  if (filters.status && listing.status !== filters.status) return false;
  if (filters.paymentPlan === "true" && !listing.paymentPlanAvailable)
    return false;

  if (filters.price) {
    // FR-1.5 — a listing with no figure cannot sit inside a price band.
    if (listing.priceOnRequest || listing.price === null) return false;
    const band = priceBands[filters.price];
    const price = Number(listing.price);
    if (price < band.min) return false;
    if (band.max !== null && price >= band.max) return false;
  }

  if (
    filters.titleType &&
    listing.landDetail?.titleType !== filters.titleType
  ) {
    return false;
  }

  if (filters.plotSize) {
    const band = plotSizeBands[filters.plotSize];
    const size = Number(listing.landDetail?.plotSize ?? -1);
    if (size < band.min) return false;
    if (band.max !== null && size >= band.max) return false;
  }

  if (
    filters.bedrooms &&
    (listing.homeDetail?.bedrooms ?? 0) < filters.bedrooms
  ) {
    return false;
  }
  if (
    filters.houseType &&
    listing.homeDetail?.houseType !== filters.houseType
  ) {
    return false;
  }
  if (
    filters.buildStage &&
    listing.homeDetail?.buildStage !== filters.buildStage
  ) {
    return false;
  }

  return true;
}

const publishedAt = (listing: (typeof listings)[number]) =>
  listing.publishedAt ? Date.parse(listing.publishedAt) : 0;

/** Mirrors buildListingOrderBy, including FR-1.5's nulls-last rule. */
function compare(sort: SortOption) {
  return (a: (typeof listings)[number], b: (typeof listings)[number]) => {
    if (sort === "newest") return publishedAt(b) - publishedAt(a);

    const aNull = a.price === null;
    const bNull = b.price === null;
    // Price-on-request sorts last under *both* price sorts, never first.
    if (aNull && bNull) return publishedAt(b) - publishedAt(a);
    if (aNull) return 1;
    if (bNull) return -1;

    const delta = Number(a.price) - Number(b.price);
    if (delta !== 0) return sort === "price-asc" ? delta : -delta;
    return publishedAt(b) - publishedAt(a);
  };
}

const byStatusThenRecent = (
  a: (typeof listings)[number],
  b: (typeof listings)[number],
) =>
  a.status === b.status
    ? publishedAt(b) - publishedAt(a)
    : a.status.localeCompare(b.status);

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------

export function getFeaturedListings(take: number): ListingCardData[] {
  return published
    .filter((listing) => listing.featured)
    .sort(byStatusThenRecent)
    .slice(0, take)
    .map(toCard);
}

export function getSpotlightListings(take: number): ListingCardData[] {
  return [...published]
    .sort((a, b) =>
      a.featured === b.featured
        ? byStatusThenRecent(a, b)
        : Number(b.featured) - Number(a.featured),
    )
    .slice(0, take)
    .map(toCard);
}

export function getLaneCounts() {
  const available = published.filter(
    (listing) => listing.status === "AVAILABLE",
  );
  return {
    land: available.filter((listing) => listing.type === "LAND").length,
    homes: available.filter((listing) => listing.type === "HOME").length,
  };
}

export function getSampleListings(take: number): ListingCardData[] {
  const half = Math.ceil(take / 2);
  const land = listings
    .filter((listing) => listing.type === "LAND")
    .sort((a, b) =>
      (b.landDetail?.titleType ?? "").localeCompare(
        a.landDetail?.titleType ?? "",
      ),
    )
    .slice(0, half);
  const homes = listings
    .filter((listing) => listing.type === "HOME")
    .sort((a, b) => a.reference.localeCompare(b.reference))
    .slice(0, take - half);
  return [...land, ...homes].map(toCard);
}

export function getListingPage(type: ListingType, filters: ListingFilters) {
  const all = published
    .filter((listing) => listing.type === type && matches(listing, filters))
    .sort(compare(filters.sort));

  const pageCount = Math.max(1, Math.ceil(all.length / LISTINGS_PER_PAGE));
  const page = Math.min(filters.page, pageCount);

  return {
    listings: all
      .slice((page - 1) * LISTINGS_PER_PAGE, page * LISTINGS_PER_PAGE)
      .map(toCard),
    total: all.length,
    page,
    pageCount,
  };
}

export function getFilterOptions(type: ListingType) {
  const inTrack = published.filter((listing) => listing.type === type);
  return {
    states: [...new Set(inTrack.map((listing) => listing.state))].sort(),
    estates: estates
      .filter((estate) =>
        inTrack.some((listing) => listing.estate?.slug === estate.slug),
      )
      .map((estate) => ({ slug: estate.slug, name: estate.name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export function getListingSlugs(type: ListingType): string[] {
  return published
    .filter((listing) => listing.type === type)
    .map((listing) => listing.slug);
}

export function getRelatedListings(
  listingId: string,
  type: ListingType,
  estateId: string | null,
  location: string,
): ListingCardData[] {
  const pool = published.filter(
    (listing) => listing.id !== listingId && listing.type === type,
  );

  const fromEstate = estateId
    ? pool
        .filter((listing) => listing.estateId === estateId)
        .sort(byStatusThenRecent)
    : [];

  if (fromEstate.length >= 3) return fromEstate.slice(0, 3).map(toCard);

  const fromLocation = pool
    .filter(
      (listing) =>
        listing.location === location &&
        (!estateId || listing.estateId !== estateId),
    )
    .sort(byStatusThenRecent)
    .slice(0, 3 - fromEstate.length);

  return [...fromEstate, ...fromLocation].map(toCard);
}

export function getListingDetail(slug: string) {
  const listing = published.find((entry) => entry.slug === slug);
  if (!listing) return null;

  return {
    ...listing,
    handoverDate: listing.homeDetail?.handoverDate ?? null,
    homeDetail: listing.homeDetail
      ? {
          ...listing.homeDetail,
          handoverDate: listing.homeDetail.handoverDate
            ? new Date(listing.homeDetail.handoverDate)
            : null,
        }
      : null,
  };
}

export function getEstateListings(estateId: string) {
  const inEstate = published
    .filter((listing) => listing.estateId === estateId)
    .sort(byStatusThenRecent)
    .map(toCard);

  return {
    land: inEstate.filter((listing) => listing.type === "LAND"),
    homes: inEstate.filter((listing) => listing.type === "HOME"),
  };
}

// ---------------------------------------------------------------------------
// Estates, articles, testimonials, placements
// ---------------------------------------------------------------------------

function estateShape(estate: (typeof estates)[number]) {
  return {
    slug: estate.slug,
    name: estate.name,
    location: estate.location,
    state: estate.state,
    description: estate.description,
    status: estate.status,
    amenities: estate.amenities,
    availableCount: published.filter(
      (listing) =>
        listing.estateId === estate.id && listing.status === "AVAILABLE",
    ).length,
    listingCount: published.filter((listing) => listing.estateId === estate.id)
      .length,
    image: estate.media[0]?.media ?? null,
  };
}

export function getEstates() {
  return estates.map(estateShape);
}

export function getFeaturedEstates(take: number) {
  return estates.slice(0, take).map(estateShape);
}

export function getDeliveredEstateCount() {
  return estates.filter((estate) => estate.status === "DELIVERED").length;
}

export function getEstateSlugs(): string[] {
  return estates.map((estate) => estate.slug);
}

export function getEstateDetail(slug: string) {
  const estate = estates.find((entry) => entry.slug === slug);
  if (!estate) return null;
  return {
    id: estate.id,
    slug: estate.slug,
    name: estate.name,
    location: estate.location,
    state: estate.state,
    description: estate.description,
    status: estate.status,
    amenities: estate.amenities,
    media: estate.media,
  };
}

function articleShape(article: (typeof articles)[number]) {
  return {
    ...article,
    publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
  };
}

export function getArticles() {
  return articles.filter((a) => a.status === "PUBLISHED").map(articleShape);
}

export function getRecentArticles(take: number) {
  return getArticles()
    .sort(
      (a, b) =>
        (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0),
    )
    .slice(0, take);
}

export function getArticleSlugs(): string[] {
  return articles.filter((a) => a.status === "PUBLISHED").map((a) => a.slug);
}

export function getArticle(slug: string) {
  const article = articles.find(
    (entry) => entry.slug === slug && entry.status === "PUBLISHED",
  );
  return article ? articleShape(article) : null;
}

export function getTestimonials(take: number) {
  return testimonials
    .filter((testimonial) => testimonial.published)
    .slice(0, take)
    .map(({ name, role, quote }) => ({ name, role, quote }));
}

export function getPlacements(keys: string[]) {
  return new Map(
    placements
      .filter((placement) => keys.includes(placement.key))
      .map((placement) => [placement.key, placement.media as SnapshotImage]),
  );
}

export function getCollageImages() {
  const found = getPlacements([
    "homepage.collage.1",
    "homepage.collage.2",
    "homepage.collage.3",
  ]);
  return ["homepage.collage.1", "homepage.collage.2", "homepage.collage.3"]
    .map((key) => found.get(key))
    .filter((media) => media !== undefined);
}
