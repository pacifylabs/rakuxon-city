import "server-only";
import { z } from "zod";
import {
  BuildStage,
  HouseType,
  ListingStatus,
  ListingType,
  TitleType,
} from "@/generated/prisma/enums";

/**
 * The one place listing filters, sorting and pagination are turned into a
 * Prisma query. Both hubs go through it, and Phase 5's estate pages will too.
 *
 * FR-1.5 lives here and nowhere else. Price-on-request is a first-class case in
 * this market, not an edge case, and it has two consequences that are easy to
 * implement inconsistently across pages:
 *
 *   1. A POR listing is excluded from a price-band filter. It has no figure, so
 *      claiming it falls inside ₦5m–₦10m would be a lie either way.
 *   2. A POR listing sorts last under *both* price sorts — not first under
 *      ascending because null sorts low, which is what a naive ORDER BY gives.
 *
 * Writing it once is the difference between that holding everywhere and holding
 * on whichever page someone remembered.
 */

export const LISTINGS_PER_PAGE = 12;

/** Bands in naira. Chosen to straddle the real spread of Nigerian plot and house prices. */
export const priceBands = {
  "under-5m": { label: "Under ₦5m", min: 0, max: 5_000_000 },
  "5m-15m": { label: "₦5m – ₦15m", min: 5_000_000, max: 15_000_000 },
  "15m-50m": { label: "₦15m – ₦50m", min: 15_000_000, max: 50_000_000 },
  "50m-150m": { label: "₦50m – ₦150m", min: 50_000_000, max: 150_000_000 },
  "over-150m": { label: "Over ₦150m", min: 150_000_000, max: null },
} as const;

export type PriceBand = keyof typeof priceBands;

export const plotSizeBands = {
  "under-300": { label: "Under 300 sqm", min: 0, max: 300 },
  "300-600": { label: "300 – 600 sqm", min: 300, max: 600 },
  "over-600": { label: "Over 600 sqm", min: 600, max: null },
} as const;

export type PlotSizeBand = keyof typeof plotSizeBands;

export const sortOptions = {
  newest: "Newest",
  "price-asc": "Price, low to high",
  "price-desc": "Price, high to low",
} as const;

export type SortOption = keyof typeof sortOptions;

/** A blank string from an empty select is "no filter", not an invalid value. */
const optional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    schema.optional(),
  );

export const listingFilterSchema = z.object({
  /**
   * Free-text search. Matches the things a buyer actually types — the listing
   * name, where it is, and the reference code sales quote on the phone — and
   * deliberately not the description, so "five minutes from the gated estate"
   * never surfaces on a search for "gated".
   */
  q: optional(z.string().trim().max(80)),
  state: optional(z.string().max(60)),
  estate: optional(z.string().max(120)),
  price: optional(
    z.enum(Object.keys(priceBands) as [PriceBand, ...PriceBand[]]),
  ),
  status: optional(
    z.enum([
      ListingStatus.AVAILABLE,
      ListingStatus.RESERVED,
      ListingStatus.SOLD,
    ]),
  ),
  paymentPlan: optional(z.enum(["true"])),
  sort: z.preprocess(
    (value) => (value === "" || value === undefined ? "newest" : value),
    z
      .enum(Object.keys(sortOptions) as [SortOption, ...SortOption[]])
      .catch("newest"),
  ),
  page: z.preprocess(
    (value) => (value === "" || value === undefined ? 1 : Number(value)),
    z.number().int().min(1).catch(1),
  ),

  // Land only
  titleType: optional(z.enum(TitleType)),
  plotSize: optional(
    z.enum(Object.keys(plotSizeBands) as [PlotSizeBand, ...PlotSizeBand[]]),
  ),

  // Homes only
  bedrooms: optional(z.coerce.number().int().min(1).max(20)),
  houseType: optional(z.enum(HouseType)),
  buildStage: optional(z.enum(BuildStage)),
});

export type ListingFilters = z.infer<typeof listingFilterSchema>;

/**
 * Search params arrive untrusted from the URL. Anything unrecognised is dropped
 * rather than rejected — a stale or hand-edited link should still return
 * listings, not an error page.
 */
export function parseListingFilters(
  searchParams: Record<string, string | string[] | undefined>,
): ListingFilters {
  const flat = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

  const parsed = listingFilterSchema.safeParse(flat);
  return parsed.success ? parsed.data : listingFilterSchema.parse({});
}

/** Drafts never reach a public surface, whatever the URL asks for. */
function baseWhere(type: ListingType) {
  return { type, status: { not: ListingStatus.DRAFT } };
}

export function buildListingWhere(type: ListingType, filters: ListingFilters) {
  const where: Record<string, unknown> = { ...baseWhere(type) };
  const and: Record<string, unknown>[] = [];

  if (filters.q) {
    // Postgres `contains` with `mode: "insensitive"` rather than full-text
    // search: the corpus is small, the fields are short, and a partial word
    // like "emer" should still find Emerald Ridge, which `to_tsquery` would
    // not do without a prefix operator and a tsvector column to match it on.
    const term = filters.q;
    and.push({
      OR: [
        { title: { contains: term, mode: "insensitive" } },
        { location: { contains: term, mode: "insensitive" } },
        { state: { contains: term, mode: "insensitive" } },
        { reference: { contains: term, mode: "insensitive" } },
        { estate: { name: { contains: term, mode: "insensitive" } } },
      ],
    });
  }

  if (filters.state) where.state = filters.state;
  if (filters.estate) where.estate = { slug: filters.estate };
  if (filters.status) where.status = filters.status;
  if (filters.paymentPlan === "true") where.paymentPlanAvailable = true;

  if (filters.price) {
    const band = priceBands[filters.price];
    // FR-1.5, consequence 1 — a listing with no figure cannot sit in a band.
    and.push({
      priceOnRequest: false,
      price:
        band.max === null ? { gte: band.min } : { gte: band.min, lt: band.max },
    });
  }

  if (filters.titleType)
    and.push({ landDetail: { titleType: filters.titleType } });

  if (filters.plotSize) {
    const band = plotSizeBands[filters.plotSize];
    and.push({
      landDetail: {
        plotSize:
          band.max === null
            ? { gte: band.min }
            : { gte: band.min, lt: band.max },
      },
    });
  }

  if (filters.bedrooms)
    and.push({ homeDetail: { bedrooms: { gte: filters.bedrooms } } });
  if (filters.houseType)
    and.push({ homeDetail: { houseType: filters.houseType } });
  if (filters.buildStage)
    and.push({ homeDetail: { buildStage: filters.buildStage } });

  // FR-1.2 — filters combine with AND.
  if (and.length > 0) where.AND = and;

  return where;
}

export function buildListingOrderBy(sort: SortOption) {
  switch (sort) {
    case "price-asc":
      // FR-1.5, consequence 2. Without `nulls: "last"` Postgres sorts NULL low
      // and every price-on-request listing leads the ascending page.
      return [
        { price: { sort: "asc", nulls: "last" } },
        { publishedAt: "desc" },
      ] as const;
    case "price-desc":
      return [
        { price: { sort: "desc", nulls: "last" } },
        { publishedAt: "desc" },
      ] as const;
    default:
      return [{ publishedAt: "desc" }] as const;
  }
}

/** True when anything narrowing is applied — drives the empty state's copy. */
export function hasActiveFilters(filters: ListingFilters): boolean {
  return Boolean(
    filters.q ||
    filters.state ||
    filters.estate ||
    filters.price ||
    filters.status ||
    filters.paymentPlan ||
    filters.titleType ||
    filters.plotSize ||
    filters.bedrooms ||
    filters.houseType ||
    filters.buildStage,
  );
}

/** Rebuilds the query string, dropping defaults so shared URLs stay readable. */
export function buildQueryString(
  filters: Partial<ListingFilters>,
  changes: Record<string, string | number | undefined>,
): string {
  const params = new URLSearchParams();

  const merged: Record<string, unknown> = { ...filters, ...changes };

  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || value === "" || value === null) continue;
    if (key === "sort" && value === "newest") continue;
    if (key === "page" && Number(value) === 1) continue;
    params.set(key, String(value));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}
