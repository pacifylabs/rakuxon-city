import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

let fail = 0;
const check = (label: string, ok: boolean, detail = "") => {
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  ${detail}` : ""}`,
  );
  if (!ok) fail++;
};

async function main() {
  const enquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      track: true,
      listingId: true,
      consentGivenAt: true,
      ipAddress: true,
      listing: { select: { type: true } },
      assignedTo: { select: { name: true, salesTrack: true } },
    },
  });

  const landOnes = enquiries.filter((e) => e.listing?.type === "LAND");
  const homeOnes = enquiries.filter((e) => e.listing?.type === "HOME");
  const generals = enquiries.filter((e) => e.listingId === null);

  check(
    "land enquiries carry track LAND",
    landOnes.length > 0 && landOnes.every((e) => e.track === "LAND"),
  );
  check(
    "land enquiries assign to a LAND or BOTH user",
    landOnes.length > 0 &&
      landOnes.every(
        (e) =>
          e.assignedTo &&
          (e.assignedTo.salesTrack === "LAND" ||
            e.assignedTo.salesTrack === "BOTH"),
      ),
    landOnes[0]?.assignedTo?.name ?? "none",
  );
  check(
    "homes enquiries carry track HOMES",
    homeOnes.length > 0 && homeOnes.every((e) => e.track === "HOMES"),
  );
  check(
    "homes enquiries assign to a HOMES or BOTH user",
    homeOnes.length > 0 &&
      homeOnes.every(
        (e) =>
          e.assignedTo &&
          (e.assignedTo.salesTrack === "HOMES" ||
            e.assignedTo.salesTrack === "BOTH"),
      ),
    homeOnes[0]?.assignedTo?.name ?? "none",
  );
  check(
    "no land enquiry reached a homes-only desk",
    !landOnes.some((e) => e.assignedTo?.salesTrack === "HOMES"),
  );
  check(
    "no homes enquiry reached a land-only desk",
    !homeOnes.some((e) => e.assignedTo?.salesTrack === "LAND"),
  );
  check(
    "general enquiries stay untracked and unassigned (FR-3.3)",
    generals.length > 0 &&
      generals.every((e) => e.track === null && e.assignedTo === null),
  );
  check(
    "consent is timestamped on every enquiry (FR-3.5)",
    enquiries.every((e) => e.consentGivenAt instanceof Date),
  );
  check(
    "the client IP is recorded for abuse investigation",
    enquiries.some((e) => e.ipAddress !== null),
  );

  // FR-4.4 — the lanes must not touch.
  const investors = await prisma.investorEnquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { email: true, capitalBand: true, consentGivenAt: true },
  });
  check(
    "investor enquiries were written",
    investors.length > 0,
    `${investors.length} row(s)`,
  );

  const investorEmails = new Set(investors.map((i) => i.email));
  const leaked = await prisma.enquiry.findMany({
    where: { email: { in: [...investorEmails] } },
    select: { id: true },
  });
  check(
    "no investor enquiry reached the Enquiry table (FR-4.4)",
    leaked.length === 0,
    leaked.length ? `${leaked.length} leaked!` : "",
  );
  check(
    "investor consent is timestamped",
    investors.every((i) => i.consentGivenAt instanceof Date),
  );

  console.log(
    fail === 0 ? "\nAll routing checks passed." : `\n${fail} failure(s).`,
  );
  await prisma.$disconnect();
  process.exit(fail ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
