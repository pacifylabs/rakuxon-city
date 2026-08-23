/**
 * Development seed — 03_implementation_plan.md Phase 1.5.
 *
 * The landing page renders from these records rather than placeholder arrays,
 * so the shape of real inventory (mixed pricing, weak title documentation, sold
 * stock, draft stock) is visible from the first render instead of surfacing
 * later as a bug.
 *
 * Deliberately included because they are the paths most easily forgotten:
 *   - three price-on-request listings (FR-1.5)
 *   - one survey-only plot, which renders the honest neutral ribbon (§7)
 *   - one sold and one draft listing, to prove they behave differently
 *
 * Re-runnable: it clears what it owns first.
 *
 *   pnpm db:seed
 */

import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { randomBytes, scryptSync } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  ArticleCategory,
  ArticleStatus,
  BuildStage,
  EstateStatus,
  HouseType,
  ListingStatus,
  ListingType,
  PlotUnit,
  SalesTrack,
  TitleType,
  UserRole,
} from "../src/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env first.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

/**
 * scrypt from node:crypto rather than bcrypt or argon2: auth is Phase 7 and the
 * plan says install nothing for it yet. Format is self-describing so Phase 7 can
 * verify these hashes or re-hash them on first login.
 */
function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(plain, salt, 64).toString("hex");
  return `scrypt$16384$8$1$${salt}$${derived}`;
}

/** Placeholder imagery — see scripts/generate_placeholders.py. */
function placeholder(
  name: string,
  ratio: "hero" | "card" | "portrait" | "wide",
) {
  const dimensions = {
    hero: { width: 1200, height: 675 },
    card: { width: 800, height: 600 },
    portrait: { width: 600, height: 800 },
    wide: { width: 1000, height: 625 },
  }[ratio];

  return {
    url: `/images/placeholders/${name}.png`,
    ...dimensions,
    mimeType: "image/png",
    sizeBytes: 6000,
    isStandIn: true,
  };
}

/**
 * Openly-licensed Nigerian terrain photography, standing in for land listings
 * until the client's own photographs arrive. See scripts/fetch_photography.py.
 *
 * Still stand-ins: they are real photographs, but not of the actual plot, so
 * they carry the same `isStandIn` flag and the same visible label. The
 * attribution is stored on the row because CC BY requires it and a credit that
 * lives only in a script is a credit waiting to be lost.
 */
const photography: {
  name: string;
  file: string;
  width: number;
  height: number;
  alt: string;
  attribution: string;
  sourceUrl: string;
}[] = JSON.parse(
  readFileSync(
    join(process.cwd(), "public", "images", "photography", "manifest.json"),
    "utf8",
  ),
);

function terrainPhoto(index: number) {
  const item = photography[index % photography.length];
  return {
    url: item.file,
    alt: item.alt,
    width: item.width,
    height: item.height,
    mimeType: "image/jpeg",
    sizeBytes: 120_000,
    isStandIn: true,
    attribution: item.attribution,
    sourceUrl: item.sourceUrl,
  };
}

async function clear() {
  // Order matters: children before parents, and the join tables before both.
  await prisma.mediaPlacement.deleteMany();
  await prisma.internalNote.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.investorEnquiry.deleteMany();
  await prisma.statusChange.deleteMany();
  await prisma.landDocument.deleteMany();
  await prisma.landDetail.deleteMany();
  await prisma.homeDetail.deleteMany();
  await prisma.listingMedia.deleteMany();
  await prisma.estateMedia.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.estate.deleteMany();
  await prisma.article.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.importBatch.deleteMany();
  await prisma.media.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await clear();

  // -------------------------------------------------------------------------
  // Staff
  // -------------------------------------------------------------------------

  const [admin, landSales, homesSales] = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@rakuxoncity.com",
        name: "Adaeze Nwosu",
        role: UserRole.ADMIN,
        passwordHash: hashPassword("ChangeMeBeforeLaunch1"),
      },
    }),
    prisma.user.create({
      data: {
        email: "land@rakuxoncity.com",
        name: "Ibrahim Bello",
        role: UserRole.SALES,
        salesTrack: SalesTrack.LAND,
        passwordHash: hashPassword("ChangeMeBeforeLaunch2"),
      },
    }),
    prisma.user.create({
      data: {
        email: "homes@rakuxoncity.com",
        name: "Chidinma Okafor",
        role: UserRole.SALES,
        salesTrack: SalesTrack.HOMES,
        passwordHash: hashPassword("ChangeMeBeforeLaunch3"),
      },
    }),
  ]);

  // -------------------------------------------------------------------------
  // Page furniture — the hero frame and the collage behind the FAQ panel.
  // Held in the media library like everything else, so swapping in the client's
  // photography is a data change rather than a code change.
  // -------------------------------------------------------------------------

  const hero = await prisma.media.create({
    data: {
      ...placeholder("hero-estate", "hero"),
      alt: "Wide establishing shot across a Rakuxon City estate",
    },
  });

  const collage = await Promise.all(
    [
      { name: "collage-1", ratio: "portrait" as const, alt: "Plot boundary and access road" },
      { name: "collage-2", ratio: "card" as const, alt: "Completed home exterior" },
      { name: "collage-3", ratio: "portrait" as const, alt: "Estate street view" },
    ].map((item) =>
      prisma.media.create({
        data: { ...placeholder(item.name, item.ratio), alt: item.alt },
      }),
    ),
  );

  // The logo is the client's own artwork, not a stand-in.
  const logo = await prisma.media.create({
    data: {
      url: "/logo.png",
      alt: "Rakuxon City",
      width: 2172,
      height: 724,
      mimeType: "image/png",
      sizeBytes: 502_823,
      isStandIn: false,
    },
  });

  // Named slots, so page furniture is editable from the admin without anyone
  // having to match on a filename. Phase 7 renders this table as a screen.
  await prisma.mediaPlacement.createMany({
    data: [
      {
        key: "site.logo",
        mediaId: logo.id,
        label: "Site logo",
        guidance: "Wide mark, transparent background. Renders at 32px tall in the header.",
      },
      {
        key: "site.ogImage",
        mediaId: hero.id,
        label: "Social share image",
        guidance: "16:9. Shown when a link to the site is shared.",
      },
      {
        key: "homepage.hero",
        mediaId: hero.id,
        label: "Homepage hero image",
        guidance: "16:9. A wide establishing shot across an estate.",
      },
      {
        key: "homepage.collage.1",
        mediaId: collage[0].id,
        label: "FAQ collage — left",
        guidance: "3:4 portrait. Plot boundary and access road.",
      },
      {
        key: "homepage.collage.2",
        mediaId: collage[1].id,
        label: "FAQ collage — centre",
        guidance: "4:3. A completed home exterior.",
      },
      {
        key: "homepage.collage.3",
        mediaId: collage[2].id,
        label: "FAQ collage — right",
        guidance: "3:4 portrait. An estate street view.",
      },
    ],
  });

  // -------------------------------------------------------------------------
  // Estates
  // -------------------------------------------------------------------------

  const estateSeeds = [
    {
      slug: "emerald-ridge",
      name: "Emerald Ridge Estate",
      location: "Ibeju-Lekki",
      state: "Lagos",
      latitude: 6.4698,
      longitude: 3.9137,
      status: EstateStatus.ACTIVE,
      description:
        "Two hundred and forty serviced plots on the Lekki–Epe corridor, fifteen minutes from the Lekki Deep Sea Port. Perimeter walled, with the internal road network and drainage completed ahead of allocation.",
      amenities: [
        "Perimeter fencing and gatehouse",
        "Tarred internal road network",
        "Drainage and culverts",
        "24-hour security",
        "Borehole and treatment plant",
        "Street lighting",
        "Recreation park",
      ],
      image: "estate-emerald-ridge",
      alt: "Aerial view of Emerald Ridge Estate showing the completed road network and plot boundaries",
    },
    {
      slug: "cornerstone-gardens",
      name: "Cornerstone Gardens",
      location: "Mowe-Ofada",
      state: "Ogun",
      latitude: 6.8156,
      longitude: 3.4419,
      status: EstateStatus.ACTIVE,
      description:
        "An entry-point estate on the Lagos–Ibadan expressway for buyers building their first home. Plots are sold with a structured payment plan and a fixed development window.",
      amenities: [
        "Perimeter fencing",
        "Graded access roads",
        "Estate gatehouse",
        "Drainage",
        "Green buffer zone",
      ],
      image: "estate-cornerstone-gardens",
      alt: "Wide establishing shot of Cornerstone Gardens showing terrain and access road",
    },
    {
      slug: "sabon-lugbe-court",
      name: "Sabon Lugbe Court",
      location: "Lugbe",
      state: "FCT Abuja",
      latitude: 8.9756,
      longitude: 7.3986,
      status: EstateStatus.DELIVERED,
      description:
        "A delivered residential court of forty-eight units in Lugbe, handed over in 2024. Remaining stock is resale and a small number of unallocated plots held back at the northern boundary.",
      amenities: [
        "Completed and handed over",
        "Paved roads and walkways",
        "Estate management in place",
        "Standby power",
        "Children's play area",
      ],
      image: "estate-sabon-lugbe-court",
      alt: "Street view within Sabon Lugbe Court showing delivered units",
    },
  ];

  const estates: Record<string, string> = {};

  for (const seed of estateSeeds) {
    const media = await prisma.media.create({
      data: { ...placeholder(seed.image, "wide"), alt: seed.alt },
    });

    const estate = await prisma.estate.create({
      data: {
        slug: seed.slug,
        name: seed.name,
        location: seed.location,
        state: seed.state,
        latitude: seed.latitude,
        longitude: seed.longitude,
        description: seed.description,
        amenities: seed.amenities,
        status: seed.status,
        media: { create: { mediaId: media.id, position: 0 } },
      },
    });

    estates[seed.slug] = estate.id;
  }

  // -------------------------------------------------------------------------
  // Land listings — every title type, every status, including the awkward ones
  // -------------------------------------------------------------------------

  type LandSeed = {
    reference: string;
    slug: string;
    title: string;
    description: string;
    estate: string;
    location: string;
    state: string;
    price: number | null;
    priceOnRequest?: boolean;
    status: ListingStatus;
    featured?: boolean;
    plotSize: number;
    plotUnit: PlotUnit;
    titleType: TitleType;
    surveyNumber: string | null;
    topography: string;
    roadAccess: string;
    documents: string[];
    paymentPlan?: {
      depositPercent: number;
      durationMonths: number;
      frequency: string;
      notes?: string;
    };
    image: string;
    alt: string;
  };

  const landSeeds: LandSeed[] = [
    {
      reference: "RXC-LND-0001",
      slug: "emerald-ridge-plot-a14",
      title: "Plot A14, Emerald Ridge",
      description:
        "A 500 square metre residential plot on the first row inside the estate gate, fully dry and sand-filled, with the access road tarred to the boundary. Registered survey and a Certificate of Occupancy already issued in the estate's name.",
      estate: "emerald-ridge",
      location: "Ibeju-Lekki",
      state: "Lagos",
      price: 18_500_000,
      status: ListingStatus.AVAILABLE,
      featured: true,
      plotSize: 500,
      plotUnit: PlotUnit.SQM,
      titleType: TitleType.C_OF_O,
      surveyNumber: "LS/D/LA2231",
      topography: "Dry, level, sand-filled",
      roadAccess: "Tarred road to plot boundary",
      documents: [
        "Certificate of Occupancy",
        "Registered survey plan",
        "Deed of assignment",
        "Estate layout approval",
      ],
      paymentPlan: {
        depositPercent: 30,
        durationMonths: 12,
        frequency: "monthly",
        notes: "Allocation on completion of the final instalment.",
      },
      image: "land-01",
      alt: "Wide establishing shot of Plot A14 showing boundary markers and the tarred access road",
    },
    {
      reference: "RXC-LND-0002",
      slug: "emerald-ridge-corner-block-c",
      title: "Corner block C, Emerald Ridge",
      description:
        "A 1,000 square metre double-frontage corner block at the junction of the estate's two main roads. Suited to a larger private build or a small terrace development. Pricing is handled directly because terms vary with intended use.",
      estate: "emerald-ridge",
      location: "Ibeju-Lekki",
      state: "Lagos",
      price: null,
      priceOnRequest: true,
      status: ListingStatus.AVAILABLE,
      plotSize: 1000,
      plotUnit: PlotUnit.SQM,
      titleType: TitleType.C_OF_O,
      surveyNumber: "LS/D/LA2244",
      topography: "Dry, level",
      roadAccess: "Double frontage, both roads tarred",
      documents: [
        "Certificate of Occupancy",
        "Registered survey plan",
        "Estate layout approval",
      ],
      image: "land-02",
      alt: "Corner block showing both road frontages and boundary extent",
    },
    {
      reference: "RXC-LND-0003",
      slug: "emerald-ridge-plot-b07",
      title: "Plot B07, Emerald Ridge",
      description:
        "Five hundred square metres on the second row, backing onto the estate green buffer. Governor's consent obtained on the parent title and perfected for this plot.",
      estate: "emerald-ridge",
      location: "Ibeju-Lekki",
      state: "Lagos",
      price: 12_750_000,
      status: ListingStatus.AVAILABLE,
      plotSize: 500,
      plotUnit: PlotUnit.SQM,
      titleType: TitleType.GOVERNORS_CONSENT,
      surveyNumber: "LS/D/LA2258",
      topography: "Dry, gentle slope",
      roadAccess: "Tarred road, 9m right of way",
      documents: [
        "Governor's consent",
        "Registered survey plan",
        "Deed of assignment",
      ],
      paymentPlan: {
        depositPercent: 25,
        durationMonths: 18,
        frequency: "monthly",
      },
      image: "land-03",
      alt: "Plot B07 seen from the access road with the green buffer behind",
    },
    {
      reference: "RXC-LND-0004",
      slug: "emerald-ridge-plot-d22",
      title: "Plot D22, Emerald Ridge",
      description:
        "A 450 square metre plot currently under reservation. Gazetted land, with the estate's excision published in the Lagos State gazette.",
      estate: "emerald-ridge",
      location: "Ibeju-Lekki",
      state: "Lagos",
      price: 9_400_000,
      status: ListingStatus.RESERVED,
      plotSize: 450,
      plotUnit: PlotUnit.SQM,
      titleType: TitleType.GAZETTE,
      surveyNumber: "LS/D/LA2271",
      topography: "Dry, level",
      roadAccess: "Graded road, tarring scheduled",
      documents: ["Gazette publication", "Registered survey plan"],
      image: "land-04",
      alt: "Plot D22 showing boundary pillars and neighbouring development",
    },
    {
      reference: "RXC-LND-0005",
      slug: "cornerstone-gardens-plot-14",
      title: "Plot 14, Cornerstone Gardens",
      description:
        "Five hundred square metres off the Lagos–Ibadan expressway, sold with a deed of assignment registered against the estate's parent title. Popular with first-time builders.",
      estate: "cornerstone-gardens",
      location: "Mowe-Ofada",
      state: "Ogun",
      price: 6_200_000,
      status: ListingStatus.AVAILABLE,
      plotSize: 500,
      plotUnit: PlotUnit.SQM,
      titleType: TitleType.DEED_OF_ASSIGNMENT,
      surveyNumber: "OG/2199/2023",
      topography: "Dry, level",
      roadAccess: "Graded estate road",
      documents: [
        "Deed of assignment",
        "Registered survey plan",
        "Estate layout approval",
      ],
      paymentPlan: {
        depositPercent: 20,
        durationMonths: 24,
        frequency: "monthly",
        notes: "No interest applied within the plan window.",
      },
      image: "land-05",
      alt: "Plot 14 with boundary markers and surrounding graded road",
    },
    {
      reference: "RXC-LND-0006",
      slug: "cornerstone-gardens-plot-31",
      title: "Plot 31, Cornerstone Gardens",
      description:
        "A 464 square metre plot on excised land, with the excision confirmed and the survey registered. The most affordable stock currently held in the estate.",
      estate: "cornerstone-gardens",
      location: "Mowe-Ofada",
      state: "Ogun",
      price: 4_850_000,
      status: ListingStatus.AVAILABLE,
      plotSize: 464,
      plotUnit: PlotUnit.SQM,
      titleType: TitleType.EXCISION,
      surveyNumber: "OG/2204/2023",
      topography: "Dry, slight incline",
      roadAccess: "Graded estate road",
      documents: ["Excision certificate", "Registered survey plan"],
      paymentPlan: {
        depositPercent: 20,
        durationMonths: 18,
        frequency: "monthly",
      },
      image: "land-06",
      alt: "Plot 31 showing terrain and incline toward the estate boundary",
    },
    {
      reference: "RXC-LND-0007",
      slug: "cornerstone-gardens-plot-47",
      title: "Plot 47, Cornerstone Gardens",
      description:
        "Five hundred square metres at the northern edge of the estate. This plot is sold on a registered survey only — the excision covering this section has been applied for but not yet granted, and the price reflects that. Read the documentation panel before enquiring.",
      estate: "cornerstone-gardens",
      location: "Mowe-Ofada",
      state: "Ogun",
      price: 3_100_000,
      status: ListingStatus.AVAILABLE,
      plotSize: 500,
      plotUnit: PlotUnit.SQM,
      titleType: TitleType.SURVEY_ONLY,
      surveyNumber: "OG/2288/2024",
      topography: "Dry, level",
      roadAccess: "Graded road, unpaved",
      documents: ["Registered survey plan", "Purchase receipt"],
      image: "land-07",
      alt: "Plot 47 at the northern estate boundary showing the unpaved approach",
    },
    {
      reference: "RXC-LND-0008",
      slug: "cornerstone-gardens-plot-09",
      title: "Plot 09, Cornerstone Gardens",
      description:
        "Sold in March. Kept visible because stock that moves is the clearest signal a buyer has that an estate is real.",
      estate: "cornerstone-gardens",
      location: "Mowe-Ofada",
      state: "Ogun",
      price: 5_600_000,
      status: ListingStatus.SOLD,
      plotSize: 500,
      plotUnit: PlotUnit.SQM,
      titleType: TitleType.GAZETTE,
      surveyNumber: "OG/2101/2023",
      topography: "Dry, level",
      roadAccess: "Graded estate road",
      documents: ["Gazette publication", "Registered survey plan"],
      image: "land-08",
      alt: "Plot 09 as photographed before sale",
    },
    {
      reference: "RXC-LND-0009",
      slug: "sabon-lugbe-plot-n03",
      title: "Plot N03, Sabon Lugbe Court",
      description:
        "Six hundred square metres held back at the northern boundary of a delivered estate, with a Certificate of Occupancy already in place and every service connected to the plot line.",
      estate: "sabon-lugbe-court",
      location: "Lugbe",
      state: "FCT Abuja",
      price: 26_000_000,
      status: ListingStatus.AVAILABLE,
      featured: true,
      plotSize: 600,
      plotUnit: PlotUnit.SQM,
      titleType: TitleType.C_OF_O,
      surveyNumber: "FCT/ABJ/LUG/0912",
      topography: "Dry, level",
      roadAccess: "Paved road, services at boundary",
      documents: [
        "Certificate of Occupancy",
        "Registered survey plan",
        "Deed of assignment",
        "Service connection certificate",
      ],
      image: "land-09",
      alt: "Plot N03 within the delivered estate showing paved road and service points",
    },
    {
      reference: "RXC-LND-0010",
      slug: "sabon-lugbe-two-plot-parcel",
      title: "Two-plot parcel, Sabon Lugbe Court",
      description:
        "Two adjoining plots at the estate's northern boundary, offered together for a single build or a pair of semi-detached units. Terms depend on the intended development, so pricing is discussed directly.",
      estate: "sabon-lugbe-court",
      location: "Lugbe",
      state: "FCT Abuja",
      price: null,
      priceOnRequest: true,
      status: ListingStatus.AVAILABLE,
      plotSize: 2,
      plotUnit: PlotUnit.PLOTS,
      titleType: TitleType.GOVERNORS_CONSENT,
      surveyNumber: "FCT/ABJ/LUG/0918",
      topography: "Dry, level",
      roadAccess: "Paved road frontage",
      documents: ["Governor's consent", "Registered survey plan"],
      image: "land-10",
      alt: "The two-plot parcel photographed across its full frontage",
    },
    {
      reference: "RXC-LND-0011",
      slug: "sabon-lugbe-plot-n07",
      title: "Plot N07, Sabon Lugbe Court",
      description:
        "Six hundred square metres awaiting final documentation review before publication. Held as a draft so it cannot reach the public site until the title paperwork has been signed off.",
      estate: "sabon-lugbe-court",
      location: "Lugbe",
      state: "FCT Abuja",
      price: 15_000_000,
      status: ListingStatus.DRAFT,
      plotSize: 600,
      plotUnit: PlotUnit.SQM,
      titleType: TitleType.DEED_OF_ASSIGNMENT,
      surveyNumber: null,
      topography: "Dry, level",
      roadAccess: "Paved road frontage",
      documents: ["Deed of assignment"],
      image: "land-11",
      alt: "Plot N07 pending documentation review",
    },
    {
      reference: "RXC-LND-0012",
      slug: "emerald-ridge-plot-a02",
      title: "Plot A02, Emerald Ridge",
      description:
        "Sold in January to a returning buyer. Excised land with the survey registered and the deed executed at handover.",
      estate: "emerald-ridge",
      location: "Ibeju-Lekki",
      state: "Lagos",
      price: 7_300_000,
      status: ListingStatus.SOLD,
      plotSize: 500,
      plotUnit: PlotUnit.SQM,
      titleType: TitleType.EXCISION,
      surveyNumber: "LS/D/LA2109",
      topography: "Dry, level",
      roadAccess: "Tarred road",
      documents: [
        "Excision certificate",
        "Registered survey plan",
        "Deed of assignment",
      ],
      image: "land-12",
      alt: "Plot A02 as photographed before sale",
    },
  ];

  for (const [landIndex, seed] of landSeeds.entries()) {
    // Land gets real Nigerian terrain photography; homes keep the designed
    // placeholders, because no usable Nigerian residential exteriors exist in
    // the open-licensed pool. See TODO.md.
    const media = await prisma.media.create({
      data: terrainPhoto(landIndex),
    });

    const listing = await prisma.listing.create({
      data: {
        slug: seed.slug,
        reference: seed.reference,
        type: ListingType.LAND,
        title: seed.title,
        description: seed.description,
        estateId: estates[seed.estate],
        location: seed.location,
        state: seed.state,
        price: seed.price,
        priceOnRequest: seed.priceOnRequest ?? false,
        status: seed.status,
        paymentPlanAvailable: Boolean(seed.paymentPlan),
        paymentPlanTerms: seed.paymentPlan ?? undefined,
        featured: seed.featured ?? false,
        publishedAt: seed.status === ListingStatus.DRAFT ? null : new Date(),
        media: { create: { mediaId: media.id, position: 0 } },
        landDetail: {
          create: {
            plotSize: seed.plotSize,
            plotUnit: seed.plotUnit,
            titleType: seed.titleType,
            surveyNumber: seed.surveyNumber,
            topography: seed.topography,
            roadAccess: seed.roadAccess,
            documents: {
              create: seed.documents.map((label, position) => ({
                label,
                position,
              })),
            },
          },
        },
      },
    });

    if (seed.status !== ListingStatus.DRAFT) {
      await prisma.statusChange.create({
        data: {
          listingId: listing.id,
          fromStatus: ListingStatus.DRAFT,
          toStatus: seed.status,
          changedByUserId: landSales.id,
        },
      });
    }
  }

  // -------------------------------------------------------------------------
  // Home listings — across every build stage
  // -------------------------------------------------------------------------

  type HomeSeed = {
    reference: string;
    slug: string;
    title: string;
    description: string;
    estate: string;
    location: string;
    state: string;
    price: number | null;
    priceOnRequest?: boolean;
    status: ListingStatus;
    featured?: boolean;
    bedrooms: number;
    bathrooms: number;
    houseType: HouseType;
    buildStage: BuildStage;
    handoverDate: Date | null;
    builtArea: number;
    landArea: number;
    finishingSpec: string;
    features: string[];
    paymentPlan?: {
      depositPercent: number;
      durationMonths: number;
      frequency: string;
      notes?: string;
    };
    image: string;
    alt: string;
  };

  const homeSeeds: HomeSeed[] = [
    {
      reference: "RXC-HME-0001",
      slug: "emerald-ridge-4-bed-detached",
      title: "Four-bedroom detached house, Emerald Ridge",
      description:
        "A completed four-bedroom detached house on a 500 square metre plot, finished and ready for occupation. All rooms en-suite, with a detached boys' quarters and a fitted kitchen.",
      estate: "emerald-ridge",
      location: "Ibeju-Lekki",
      state: "Lagos",
      price: 185_000_000,
      status: ListingStatus.AVAILABLE,
      featured: true,
      bedrooms: 4,
      bathrooms: 5,
      houseType: HouseType.DETACHED,
      buildStage: BuildStage.COMPLETED,
      handoverDate: null,
      builtArea: 320,
      landArea: 500,
      finishingSpec:
        "Porcelain tiling throughout, fitted kitchen with island, POP ceilings, aluminium roofing sheets, inverter-ready wiring, borehole and treatment.",
      features: [
        "All rooms en-suite",
        "Detached boys' quarters",
        "Fitted kitchen",
        "Inverter-ready",
        "Parking for three cars",
      ],
      image: "home-01",
      alt: "Exterior of the completed four-bedroom detached house from the street",
    },
    {
      reference: "RXC-HME-0002",
      slug: "emerald-ridge-3-bed-terrace",
      title: "Three-bedroom terrace, Emerald Ridge",
      description:
        "A three-bedroom terrace unit in the estate's second phase, currently at roofing stage with handover scheduled for the second quarter of next year.",
      estate: "emerald-ridge",
      location: "Ibeju-Lekki",
      state: "Lagos",
      price: 96_500_000,
      status: ListingStatus.AVAILABLE,
      bedrooms: 3,
      bathrooms: 4,
      houseType: HouseType.TERRACE,
      buildStage: BuildStage.UNDER_CONSTRUCTION,
      handoverDate: new Date("2027-06-30"),
      builtArea: 210,
      landArea: 250,
      finishingSpec:
        "Porcelain tiling, fitted kitchen, POP ceilings, solar-ready roof, shared estate treatment plant.",
      features: [
        "All rooms en-suite",
        "Private terrace",
        "Solar-ready",
        "Estate treatment plant",
      ],
      paymentPlan: {
        depositPercent: 40,
        durationMonths: 12,
        frequency: "monthly",
        notes: "Balance due at handover.",
      },
      image: "home-02",
      alt: "Terrace block under construction at roofing stage",
    },
    {
      reference: "RXC-HME-0003",
      slug: "emerald-ridge-5-bed-off-plan",
      title: "Five-bedroom detached house, Emerald Ridge",
      description:
        "An off-plan five-bedroom detached house on the estate's premium row, available to a buyer who wants input on the finishing schedule. Because the specification is agreed per buyer, pricing is discussed directly.",
      estate: "emerald-ridge",
      location: "Ibeju-Lekki",
      state: "Lagos",
      price: null,
      priceOnRequest: true,
      status: ListingStatus.AVAILABLE,
      bedrooms: 5,
      bathrooms: 6,
      houseType: HouseType.DETACHED,
      buildStage: BuildStage.OFF_PLAN,
      handoverDate: new Date("2028-03-31"),
      builtArea: 420,
      landArea: 700,
      finishingSpec:
        "Finishing schedule agreed with the buyer before construction begins. Base specification matches the completed four-bedroom units.",
      features: [
        "Buyer input on finishing",
        "All rooms en-suite",
        "Family lounge",
        "Boys' quarters",
        "Private garden",
      ],
      image: "home-03",
      alt: "Artist's impression of the five-bedroom detached house",
    },
    {
      reference: "RXC-HME-0004",
      slug: "cornerstone-gardens-3-bed-bungalow",
      title: "Three-bedroom bungalow, Cornerstone Gardens",
      description:
        "A completed three-bedroom bungalow on 450 square metres, built as the estate's show unit and now released for sale.",
      estate: "cornerstone-gardens",
      location: "Mowe-Ofada",
      state: "Ogun",
      price: 58_000_000,
      status: ListingStatus.AVAILABLE,
      bedrooms: 3,
      bathrooms: 3,
      houseType: HouseType.BUNGALOW,
      buildStage: BuildStage.COMPLETED,
      handoverDate: null,
      builtArea: 165,
      landArea: 450,
      finishingSpec:
        "Ceramic tiling, fitted kitchen, POP ceilings, aluminium roofing, borehole.",
      features: [
        "Two rooms en-suite",
        "Fitted kitchen",
        "Walled compound",
        "Borehole",
      ],
      paymentPlan: {
        depositPercent: 30,
        durationMonths: 18,
        frequency: "monthly",
      },
      image: "home-04",
      alt: "Exterior of the completed three-bedroom bungalow",
    },
    {
      reference: "RXC-HME-0005",
      slug: "cornerstone-gardens-4-bed-semi-detached",
      title: "Four-bedroom semi-detached house, Cornerstone Gardens",
      description:
        "A four-bedroom semi-detached unit at block stage, with handover scheduled for the fourth quarter of next year. Structured payment plan available across the build period.",
      estate: "cornerstone-gardens",
      location: "Mowe-Ofada",
      state: "Ogun",
      price: 74_000_000,
      status: ListingStatus.AVAILABLE,
      bedrooms: 4,
      bathrooms: 4,
      houseType: HouseType.SEMI_DETACHED,
      buildStage: BuildStage.UNDER_CONSTRUCTION,
      handoverDate: new Date("2027-11-30"),
      builtArea: 240,
      landArea: 300,
      finishingSpec:
        "Ceramic tiling, fitted kitchen, POP ceilings, aluminium roofing, prepaid metering.",
      features: [
        "Three rooms en-suite",
        "Shared wall, private compound",
        "Prepaid metering",
      ],
      paymentPlan: {
        depositPercent: 35,
        durationMonths: 15,
        frequency: "monthly",
      },
      image: "home-05",
      alt: "Semi-detached pair under construction at block stage",
    },
    {
      reference: "RXC-HME-0006",
      slug: "sabon-lugbe-2-bed-apartment",
      title: "Two-bedroom apartment, Sabon Lugbe Court",
      description:
        "A completed two-bedroom apartment in a delivered estate with management already in place. Suited to a first purchase or a rental holding.",
      estate: "sabon-lugbe-court",
      location: "Lugbe",
      state: "FCT Abuja",
      price: 42_000_000,
      status: ListingStatus.AVAILABLE,
      bedrooms: 2,
      bathrooms: 3,
      houseType: HouseType.APARTMENT,
      buildStage: BuildStage.COMPLETED,
      handoverDate: null,
      builtArea: 95,
      landArea: 95,
      finishingSpec:
        "Ceramic tiling, fitted kitchen, POP ceilings, standby estate generator, allocated parking.",
      features: [
        "Both rooms en-suite",
        "Allocated parking",
        "Estate management",
        "Standby power",
      ],
      image: "home-06",
      alt: "Apartment block exterior within the delivered court",
    },
    {
      reference: "RXC-HME-0007",
      slug: "sabon-lugbe-4-bed-duplex",
      title: "Four-bedroom duplex, Sabon Lugbe Court",
      description:
        "An off-plan four-bedroom duplex on the estate's last remaining corner plot, with construction beginning once the plot is allocated.",
      estate: "sabon-lugbe-court",
      location: "Lugbe",
      state: "FCT Abuja",
      price: 148_000_000,
      status: ListingStatus.AVAILABLE,
      featured: true,
      bedrooms: 4,
      bathrooms: 5,
      houseType: HouseType.DUPLEX,
      buildStage: BuildStage.OFF_PLAN,
      handoverDate: new Date("2028-01-31"),
      builtArea: 310,
      landArea: 500,
      finishingSpec:
        "Porcelain tiling, fitted kitchen with island, POP ceilings, inverter-ready wiring, standby generator provision.",
      features: [
        "All rooms en-suite",
        "Family lounge",
        "Boys' quarters",
        "Corner plot",
      ],
      paymentPlan: {
        depositPercent: 40,
        durationMonths: 18,
        frequency: "monthly",
        notes: "Balance due at handover.",
      },
      image: "home-07",
      alt: "Artist's impression of the four-bedroom duplex on the corner plot",
    },
    {
      reference: "RXC-HME-0008",
      slug: "sabon-lugbe-3-bed-terrace",
      title: "Three-bedroom terrace, Sabon Lugbe Court",
      description:
        "Sold in February. A three-bedroom terrace in the delivered court, listed here as evidence of what the estate has handed over.",
      estate: "sabon-lugbe-court",
      location: "Lugbe",
      state: "FCT Abuja",
      price: 88_000_000,
      status: ListingStatus.SOLD,
      bedrooms: 3,
      bathrooms: 4,
      houseType: HouseType.TERRACE,
      buildStage: BuildStage.COMPLETED,
      handoverDate: null,
      builtArea: 195,
      landArea: 220,
      finishingSpec:
        "Ceramic tiling, fitted kitchen, POP ceilings, estate standby power.",
      features: ["All rooms en-suite", "Private terrace", "Estate management"],
      image: "home-08",
      alt: "Terrace unit as photographed before sale",
    },
  ];

  for (const seed of homeSeeds) {
    const media = await prisma.media.create({
      data: { ...placeholder(seed.image, "card"), alt: seed.alt },
    });

    const listing = await prisma.listing.create({
      data: {
        slug: seed.slug,
        reference: seed.reference,
        type: ListingType.HOME,
        title: seed.title,
        description: seed.description,
        estateId: estates[seed.estate],
        location: seed.location,
        state: seed.state,
        price: seed.price,
        priceOnRequest: seed.priceOnRequest ?? false,
        status: seed.status,
        paymentPlanAvailable: Boolean(seed.paymentPlan),
        paymentPlanTerms: seed.paymentPlan ?? undefined,
        featured: seed.featured ?? false,
        publishedAt: new Date(),
        media: { create: { mediaId: media.id, position: 0 } },
        homeDetail: {
          create: {
            bedrooms: seed.bedrooms,
            bathrooms: seed.bathrooms,
            houseType: seed.houseType,
            buildStage: seed.buildStage,
            handoverDate: seed.handoverDate,
            builtArea: seed.builtArea,
            landArea: seed.landArea,
            finishingSpec: seed.finishingSpec,
            features: seed.features,
          },
        },
      },
    });

    await prisma.statusChange.create({
      data: {
        listingId: listing.id,
        fromStatus: ListingStatus.DRAFT,
        toStatus: seed.status,
        changedByUserId: homesSales.id,
      },
    });
  }

  // -------------------------------------------------------------------------
  // Articles — one per category. Conversion work, not blog filler.
  // -------------------------------------------------------------------------

  const articleSeeds = [
    {
      slug: "what-a-certificate-of-occupancy-actually-proves",
      title: "What a Certificate of Occupancy actually proves",
      category: ArticleCategory.TITLE_AND_DOCUMENTATION,
      excerpt:
        "A C of O is the strongest title most Nigerian buyers will encounter, and it still does not answer every question. Here is what it covers, what it does not, and what to ask for alongside it.",
      image: "article-1",
    },
    {
      slug: "how-to-verify-a-plot-before-you-pay",
      title: "How to verify a plot before you pay for it",
      category: ArticleCategory.BUYING_PROCESS,
      excerpt:
        "The searches, the site visit, and the questions that separate a genuine allocation from a story. None of it is expensive, and all of it is cheaper than the alternative.",
      image: "article-2",
    },
    {
      slug: "reading-a-land-payment-plan",
      title: "Reading a land payment plan without getting caught out",
      category: ArticleCategory.PAYMENT_PLANS,
      excerpt:
        "Deposit, duration, and what happens if you miss an instalment. The three terms that decide whether a plan is workable, and the clauses worth reading twice.",
      image: "article-3",
    },
    {
      slug: "what-estate-service-charges-cover",
      title: "What service charges cover in a managed estate",
      category: ArticleCategory.ESTATE_LIVING,
      excerpt:
        "Security, drainage, road maintenance and power. What a service charge is buying, how it is usually set, and what to check before you commit to one.",
      image: "article-4",
    },
  ];

  for (const [index, seed] of articleSeeds.entries()) {
    const cover = await prisma.media.create({
      data: {
        ...placeholder(seed.image, "card"),
        alt: `Cover image for "${seed.title}"`,
      },
    });

    await prisma.article.create({
      data: {
        slug: seed.slug,
        title: seed.title,
        category: seed.category,
        excerpt: seed.excerpt,
        // Full article bodies arrive with the client's copy at the Phase 8
        // content gate; the excerpt is what the homepage teaser renders.
        body: `${seed.excerpt}\n\nFull article copy pending client sign-off.`,
        coverImageId: cover.id,
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(Date.now() - index * 86_400_000 * 9),
      },
    });
  }

  // -------------------------------------------------------------------------
  // Testimonials — no avatar imagery seeded. Design system §11 allows real
  // buyer photographs only, so the component falls back to initials until the
  // client supplies them.
  // -------------------------------------------------------------------------

  await prisma.testimonial.createMany({
    data: [
      {
        name: "Tunde Adeyemi",
        role: "Bought a plot at Emerald Ridge",
        quote:
          "I had been shown three other estates where nobody could produce a survey on the day. Here the documents were on the table before I asked, and the plot I walked was the plot on the plan.",
        position: 0,
      },
      {
        name: "Ngozi Eze",
        role: "Bought a home at Sabon Lugbe Court",
        quote:
          "We paid over fourteen months and moved in the week after the final instalment cleared. No renegotiation, no extra charges at handover.",
        position: 1,
      },
      {
        name: "Yusuf Danjuma",
        role: "Bought two plots at Cornerstone Gardens",
        quote:
          "They told me plainly which plots had excision granted and which did not, and priced them differently. That is the first time anyone has done that with me.",
        position: 2,
      },
    ],
  });

  // -------------------------------------------------------------------------

  const [listings, por, surveyOnly, articles, testimonials] = await Promise.all(
    [
      prisma.listing.count(),
      prisma.listing.count({ where: { priceOnRequest: true } }),
      prisma.listing.count({
        where: { landDetail: { titleType: TitleType.SURVEY_ONLY } },
      }),
      prisma.article.count(),
      prisma.testimonial.count(),
    ],
  );

  console.log(
    [
      "Seed complete:",
      `  users          3 (admin ${admin.email}, land ${landSales.email}, homes ${homesSales.email})`,
      `  estates        ${estateSeeds.length}`,
      `  listings       ${listings} (${landSeeds.length} land, ${homeSeeds.length} homes)`,
      `  price on req.  ${por}`,
      `  survey only    ${surveyOnly}`,
      `  articles       ${articles}`,
      `  testimonials   ${testimonials}`,
    ].join("\n"),
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
