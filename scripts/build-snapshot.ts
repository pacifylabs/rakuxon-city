/**
 * Writes src/data/snapshot.json — the catalogue the site serves when no
 * DATABASE_URL is configured.
 *
 * The public site is read-only until Phase 7, so a snapshot is enough to run
 * the whole thing: `pnpm build && pnpm start` on a clean checkout, with no .env,
 * no Docker and no Postgres. That is what makes the preview deployable anywhere.
 *
 * Content still has exactly one source of truth — `prisma/seed.ts`. This reads
 * the seeded database and serialises it; it never invents anything.
 *
 *   pnpm db:seed && pnpm snapshot
 *
 * Re-run it whenever the seed changes, or the fallback drifts from the schema.
 */

import "dotenv/config";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is required to *build* a snapshot. It is not required to use one.",
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

/** Decimal and Date do not survive JSON; everything crosses as a string. */
function serialise<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, val) =>
      val && typeof val === "object" && "toFixed" in val ? val.toString() : val,
    ),
  );
}

async function main() {
  const [listings, estates, articles, testimonials, videos, placements] =
    await Promise.all([
      prisma.listing.findMany({
        orderBy: { reference: "asc" },
        include: {
          estate: {
            select: { slug: true, name: true, location: true, state: true },
          },
          media: {
            orderBy: { position: "asc" },
            select: {
              position: true,
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
          landDetail: {
            include: { documents: { orderBy: { position: "asc" } } },
          },
          homeDetail: {
            include: {
              floorPlan: {
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
      }),
      prisma.estate.findMany({
        orderBy: [{ status: "asc" }, { name: "asc" }],
        include: {
          media: {
            orderBy: { position: "asc" },
            select: {
              position: true,
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
      }),
      prisma.article.findMany({
        orderBy: [{ category: "asc" }, { publishedAt: "desc" }],
        include: {
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
      }),
      prisma.testimonial.findMany({ orderBy: { position: "asc" } }),
      prisma.video.findMany({
        orderBy: { sortOrder: "asc" },
        include: {
          // Exactly the fields lib/videos.ts selects. Carrying width and
          // height as well made the snapshot return a wider object than
          // Postgres, which `pnpm verify:parity` flagged.
          poster: { select: { url: true, alt: true } },
          listing: {
            select: {
              id: true,
              slug: true,
              title: true,
              type: true,
              status: true,
              location: true,
              state: true,
              estate: { select: { slug: true } },
            },
          },
          estate: {
            select: {
              id: true,
              slug: true,
              name: true,
              location: true,
              state: true,
            },
          },
        },
      }),
      prisma.mediaPlacement.findMany({
        orderBy: { key: "asc" },
        include: {
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
      }),
    ]);

  const snapshot = serialise({
    generatedAt: new Date().toISOString(),
    listings,
    estates,
    articles,
    testimonials,
    videos,
    placements,
  });

  const dir = join(process.cwd(), "src", "data");
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "snapshot.json"),
    `${JSON.stringify(snapshot, null, 2)}\n`,
  );

  console.log(
    [
      "Snapshot written to src/data/snapshot.json",
      `  listings      ${listings.length}`,
      `  estates       ${estates.length}`,
      `  articles      ${articles.length}`,
      `  testimonials  ${testimonials.length}`,
      `  videos        ${videos.length}`,
      `  placements    ${placements.length}`,
    ].join("\n"),
  );

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
