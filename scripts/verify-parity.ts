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
  console.log(`All ${cases.length + 7} parity checks passed.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
