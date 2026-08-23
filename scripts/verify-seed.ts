/**
 * Asserts the Phase 1 verification conditions from 03_implementation_plan.md:
 * the seed runs clean, a land listing resolves its LandDetail, and price-on-request
 * listings carry `price = null` with `priceOnRequest = true`.
 *
 * Also checks the coverage the seed is supposed to guarantee — every title type,
 * every status, every build stage, at least three POR listings and one survey-only
 * plot — because those are the paths the rest of the site is built to handle and
 * the ones most easily lost in a later seed edit.
 *
 *   pnpm verify:seed
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  BuildStage,
  ListingStatus,
  TitleType,
} from "../src/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set.");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const failures: string[] = [];

function check(label: string, passed: boolean, detail: string) {
  console.log(`${passed ? "PASS" : "FAIL"}  ${label} — ${detail}`);
  if (!passed) failures.push(label);
}

async function main() {
  const land = await prisma.listing.findFirst({
    where: { type: "LAND" },
    include: {
      landDetail: { include: { documents: true } },
      estate: true,
      media: true,
    },
    orderBy: { reference: "asc" },
  });

  check(
    "land listing resolves LandDetail",
    Boolean(land?.landDetail),
    `${land?.reference} → ${land?.landDetail?.titleType}, ${land?.landDetail?.plotSize} ${land?.landDetail?.plotUnit}, ${land?.landDetail?.documents.length} documents, estate "${land?.estate?.name}"`,
  );

  const home = await prisma.listing.findFirst({
    where: { type: "HOME" },
    include: { homeDetail: true },
    orderBy: { reference: "asc" },
  });

  check(
    "home listing resolves HomeDetail",
    Boolean(home?.homeDetail),
    `${home?.reference} → ${home?.homeDetail?.bedrooms} bed, ${home?.homeDetail?.buildStage}`,
  );

  const por = await prisma.listing.findMany({
    where: { priceOnRequest: true },
    select: { reference: true, price: true, priceOnRequest: true },
  });

  check(
    "price-on-request listings carry no figure",
    por.length >= 3 && por.every((l) => l.price === null && l.priceOnRequest),
    `${por.length} listings: ${por.map((l) => `${l.reference} price=${l.price}`).join(", ")}`,
  );

  const surveyOnly = await prisma.listing.findMany({
    where: { landDetail: { titleType: TitleType.SURVEY_ONLY } },
    select: { reference: true },
  });

  check(
    "survey-only plot present",
    surveyOnly.length >= 1,
    surveyOnly.map((l) => l.reference).join(", ") || "none",
  );

  const titleTypes = await prisma.landDetail.groupBy({
    by: ["titleType"],
    _count: true,
  });
  const allTitleTypes = Object.values(TitleType);

  check(
    "every title type represented",
    titleTypes.length === allTitleTypes.length,
    `${titleTypes.length}/${allTitleTypes.length}: ${titleTypes.map((t) => t.titleType).join(", ")}`,
  );

  const statuses = await prisma.listing.groupBy({
    by: ["status"],
    _count: true,
  });
  const allStatuses = Object.values(ListingStatus);

  check(
    "every listing status represented",
    statuses.length === allStatuses.length,
    statuses.map((s) => `${s.status}=${s._count}`).join(", "),
  );

  const stages = await prisma.homeDetail.groupBy({
    by: ["buildStage"],
    _count: true,
  });

  check(
    "every build stage represented",
    stages.length === Object.values(BuildStage).length,
    stages.map((s) => `${s.buildStage}=${s._count}`).join(", "),
  );

  // A draft must never be reachable from a public query.
  const drafts = await prisma.listing.count({
    where: { status: ListingStatus.DRAFT },
  });
  const publishedDrafts = await prisma.listing.count({
    where: { status: ListingStatus.DRAFT, publishedAt: { not: null } },
  });

  check(
    "drafts carry no publishedAt",
    publishedDrafts === 0,
    `${drafts} draft listing(s), ${publishedDrafts} wrongly published`,
  );

  const salesUsers = await prisma.user.findMany({
    where: { role: "SALES" },
    select: { email: true, salesTrack: true },
  });

  check(
    "one sales user per track",
    salesUsers.some((u) => u.salesTrack === "LAND") &&
      salesUsers.some((u) => u.salesTrack === "HOMES"),
    salesUsers.map((u) => `${u.email}=${u.salesTrack}`).join(", "),
  );

  console.log(
    failures.length === 0
      ? "\nAll seed checks passed."
      : `\n${failures.length} check(s) failed: ${failures.join(", ")}`,
  );

  await prisma.$disconnect();
  if (failures.length > 0) process.exit(1);
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
