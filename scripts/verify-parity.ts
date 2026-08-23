/**
 * Asserts the snapshot fallback returns what Postgres returns.
 *
 * Two read paths exist: Prisma when DATABASE_URL is set, and the bundled
 * snapshot when it is not. Two implementations of the same filtering and
 * sorting rules is exactly the shape of thing that drifts silently — a price
 * band that stops excluding price-on-request in one path only, a sort that puts
 * nulls first again.
 *
 * This runs the same queries through both and fails on any difference.
 *
 *   pnpm db:seed && pnpm snapshot && pnpm verify:parity
 *
 * Needs DATABASE_URL, because it has to have Postgres to compare against.
 */

import "dotenv/config";

if (!process.env.DATABASE_URL) {
  console.error(
    "verify:parity needs DATABASE_URL — it compares the fallback against Postgres.",
  );
  process.exit(1);
}

import * as fixture from "../src/lib/data/fixture";
import {
  getEstateListings,
  getFilterOptions,
  getLaneCounts,
  getListingPage,
  getListingSlugs,
  getSpotlightListings,
} from "../src/lib/listings";
import {
  getFeaturedVideos,
  getVideoDetail,
  getVideoFilterOptions,
  getVideoPage,
  getVideoSlugs,
} from "../src/lib/videos";
import { videoFilterSchema, type VideoFilters } from "../src/lib/video-query";
import { VideoKind } from "../src/generated/prisma/enums";
import {
  listingFilterSchema,
  type ListingFilters,
} from "../src/lib/listing-query";
import type { ListingType } from "../src/generated/prisma/enums";

const failures: string[] = [];

function compare(label: string, a: unknown, b: unknown) {
  const left = JSON.stringify(a);
  const right = JSON.stringify(b);
  const same = left === right;
  console.log(`${same ? "PASS" : "FAIL"}  ${label}`);
  if (!same) {
    failures.push(label);
    console.log(`    postgres: ${left?.slice(0, 160)}`);
    console.log(`    snapshot: ${right?.slice(0, 160)}`);
  }
}

const filters = (overrides: Partial<ListingFilters> = {}): ListingFilters => ({
  ...listingFilterSchema.parse({}),
  ...overrides,
});

/** The cases most worth pinning: FR-1.5, every filter dimension, pagination. */
const cases: { label: string; type: ListingType; filters: ListingFilters }[] = [
  { label: "land, defaults", type: "LAND", filters: filters() },
  {
    label: "land, price ascending",
    type: "LAND",
    filters: filters({ sort: "price-asc" }),
  },
  {
    label: "land, price descending",
    type: "LAND",
    filters: filters({ sort: "price-desc" }),
  },
  {
    label: "land, price band 5m-15m",
    type: "LAND",
    filters: filters({ price: "5m-15m" }),
  },
  {
    label: "land, price band under-5m",
    type: "LAND",
    filters: filters({ price: "under-5m" }),
  },
  {
    label: "land, survey-only title",
    type: "LAND",
    filters: filters({ titleType: "SURVEY_ONLY" }),
  },
  {
    label: "land, state Ogun",
    type: "LAND",
    filters: filters({ state: "Ogun" }),
  },
  { label: "land, sold", type: "LAND", filters: filters({ status: "SOLD" }) },
  {
    label: "land, payment plan",
    type: "LAND",
    filters: filters({ paymentPlan: "true" }),
  },
  {
    label: "land, plot size over-600",
    type: "LAND",
    filters: filters({ plotSize: "over-600" }),
  },
  { label: "land, page 2", type: "LAND", filters: filters({ page: 2 }) },
  { label: "homes, defaults", type: "HOME", filters: filters() },
  {
    label: "homes, 4+ bedrooms",
    type: "HOME",
    filters: filters({ bedrooms: 4 }),
  },
  {
    label: "homes, off plan",
    type: "HOME",
    filters: filters({ buildStage: "OFF_PLAN" }),
  },
  {
    label: "homes, detached",
    type: "HOME",
    filters: filters({ houseType: "DETACHED" }),
  },
  {
    label: "homes, price descending",
    type: "HOME",
    filters: filters({ sort: "price-desc" }),
  },
  // Search runs through two hand-written implementations — a Prisma OR and an
  // array filter — which is exactly where the two paths would drift unnoticed.
  {
    label: "land, search by estate name",
    type: "LAND",
    filters: filters({ q: "Emerald" }),
  },
  {
    label: "land, search by location",
    type: "LAND",
    filters: filters({ q: "Ikorodu" }),
  },
  {
    label: "land, search by reference",
    type: "LAND",
    filters: filters({ q: "RXC-LND-0018" }),
  },
  {
    label: "land, search is case-insensitive",
    type: "LAND",
    filters: filters({ q: "eMeRaLd" }),
  },
  {
    label: "land, search matching nothing",
    type: "LAND",
    filters: filters({ q: "zzzzz" }),
  },
  {
    label: "land, search combined with a filter",
    type: "LAND",
    filters: filters({ q: "Emerald", titleType: "C_OF_O" }),
  },
  {
    label: "homes, search by town",
    type: "HOME",
    filters: filters({ q: "Lugbe" }),
  },
];

const videoFilters = (overrides: Partial<VideoFilters> = {}): VideoFilters => ({
  ...videoFilterSchema.parse({}),
  ...overrides,
});

const videoCases: { label: string; filters: VideoFilters }[] = [
  { label: "videos, defaults", filters: videoFilters() },
  {
    label: "videos, drone tours",
    filters: videoFilters({ kind: VideoKind.DRONE_TOUR }),
  },
  {
    label: "videos, walkthroughs",
    filters: videoFilters({ kind: VideoKind.WALKTHROUGH }),
  },
  {
    // The estate filter matches a video's own estate *or* its listing's estate,
    // which is the rule most likely to be implemented differently twice.
    label: "videos, by estate",
    filters: videoFilters({ estate: "emerald-ridge" }),
  },
  { label: "videos, page 2", filters: videoFilters({ page: 2 }) },
];

async function main() {
  for (const testCase of cases) {
    const fromDb = await getListingPage(testCase.type, testCase.filters);
    const fromSnapshot = fixture.getListingPage(
      testCase.type,
      testCase.filters,
    );
    compare(
      testCase.label,
      {
        total: fromDb.total,
        pageCount: fromDb.pageCount,
        slugs: fromDb.listings.map((l) => l.slug),
      },
      {
        total: fromSnapshot.total,
        pageCount: fromSnapshot.pageCount,
        slugs: fromSnapshot.listings.map((l) => l.slug),
      },
    );
  }

  compare("lane counts", await getLaneCounts(), fixture.getLaneCounts());

  for (const type of ["LAND", "HOME"] as ListingType[]) {
    compare(
      `filter options, ${type}`,
      await getFilterOptions(type),
      fixture.getFilterOptions(type),
    );
    compare(
      `slugs, ${type}`,
      (await getListingSlugs(type)).slice().sort(),
      fixture.getListingSlugs(type).slice().sort(),
    );
  }

  compare(
    "spotlight",
    (await getSpotlightListings(8)).map((l) => l.slug),
    fixture.getSpotlightListings(8).map((l) => l.slug),
  );

  const estate = fixture.getEstateDetail("emerald-ridge");
  if (estate) {
    const fromDb = await getEstateListings(estate.id);
    const fromSnapshot = fixture.getEstateListings(estate.id);
    compare(
      "estate listings, emerald-ridge",
      {
        land: fromDb.land.map((l) => l.slug),
        homes: fromDb.homes.map((l) => l.slug),
      },
      {
        land: fromSnapshot.land.map((l) => l.slug),
        homes: fromSnapshot.homes.map((l) => l.slug),
      },
    );
  }

  for (const testCase of videoCases) {
    const fromDb = await getVideoPage(testCase.filters);
    const fromSnapshot = fixture.getVideoPage(testCase.filters);
    compare(
      testCase.label,
      {
        total: fromDb.total,
        pageCount: fromDb.pageCount,
        slugs: fromDb.videos.map((video) => video.slug),
      },
      {
        total: fromSnapshot.total,
        pageCount: fromSnapshot.pageCount,
        slugs: fromSnapshot.videos.map((video) => video.slug),
      },
    );
  }

  compare(
    "featured videos",
    (await getFeaturedVideos(4)).map((video) => video.slug),
    fixture.getFeaturedVideos(4).map((video) => video.slug),
  );

  compare(
    "video filter options",
    await getVideoFilterOptions(),
    fixture.getVideoFilterOptions(),
  );

  compare(
    "video slugs",
    (await getVideoSlugs()).slice().sort(),
    fixture.getVideoSlugs().slice().sort(),
  );

  compare(
    "video detail, emerald-ridge-estate-overview",
    await getVideoDetail("emerald-ridge-estate-overview"),
    fixture.getVideoDetail("emerald-ridge-estate-overview"),
  );

  console.log();
  if (failures.length > 0) {
    console.log(
      `${failures.length} difference(s) between Postgres and the snapshot: ${failures.join(", ")}`,
    );
    console.log(
      "Re-run `pnpm snapshot`, or fix lib/data/fixture.ts to match the Prisma query.",
    );
    process.exit(1);
  }
  console.log(
    `All ${cases.length + videoCases.length + 11} parity checks passed.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
