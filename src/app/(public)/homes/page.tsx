import type { Metadata } from "next";
import { ListingHub } from "@/components/listings/listing-hub";
import {
  getFilterOptions,
  getListingPage,
  getTrackSummary,
} from "@/lib/listings";
import {
  hasActiveFilters,
  parseListingFilters,
  priceBands,
} from "@/lib/listing-query";
import { BuildStage, HouseType, ListingStatus } from "@/generated/prisma/enums";

export const metadata: Metadata = {
  title: "Homes for sale — Rakuxon City",
  description:
    "Completed and in-build houses across Lagos, Ogun and the FCT, with finishing specification and handover date stated up front.",
};

const houseTypeLabels: Record<HouseType, string> = {
  DETACHED: "Detached",
  SEMI_DETACHED: "Semi-detached",
  TERRACE: "Terrace",
  BUNGALOW: "Bungalow",
  DUPLEX: "Duplex",
  APARTMENT: "Apartment",
};

const buildStageLabels: Record<BuildStage, string> = {
  OFF_PLAN: "Off plan",
  UNDER_CONSTRUCTION: "Under construction",
  COMPLETED: "Completed",
};

export default async function HomesHubPage({
  searchParams,
}: PageProps<"/homes">) {
  const filters = parseListingFilters(await searchParams);

  const [{ listings, total, page, pageCount }, options, summary] =
    await Promise.all([
      getListingPage("HOME", filters),
      getFilterOptions("HOME"),
      getTrackSummary("HOME"),
    ]);

  return (
    <ListingHub
      track="homes"
      basePath="/homes"
      heading="Houses you can walk before you commit"
      supporting="Completed units, houses under construction, and off-plan builds. Each one states its build stage, its finishing specification and when it hands over."
      filters={filters}
      filtered={hasActiveFilters(filters)}
      trackTotal={summary.total}
      availableTotal={summary.available}
      estateTotal={summary.estates}
      filterConfig={[
        {
          key: "bedrooms",
          primary: true,
          label: "Bedrooms",
          options: [2, 3, 4, 5].map((n) => ({
            value: String(n),
            label: `${n}+ bedrooms`,
          })),
        },
        {
          key: "houseType",
          label: "House type",
          options: Object.values(HouseType).map((value) => ({
            value,
            label: houseTypeLabels[value],
          })),
        },
        {
          key: "buildStage",
          label: "Build stage",
          options: Object.values(BuildStage).map((value) => ({
            value,
            label: buildStageLabels[value],
          })),
        },
        {
          key: "estate",
          label: "Estate",
          options: options.estates.map((estate) => ({
            value: estate.slug,
            label: estate.name,
          })),
        },
        {
          key: "price",
          primary: true,
          label: "Price",
          options: Object.entries(priceBands).map(([value, band]) => ({
            value,
            label: band.label,
          })),
        },
        {
          key: "status",
          label: "Status",
          options: [
            { value: ListingStatus.AVAILABLE, label: "Available" },
            { value: ListingStatus.RESERVED, label: "Reserved" },
            { value: ListingStatus.SOLD, label: "Sold" },
          ],
        },
      ]}
      listings={listings}
      total={total}
      page={page}
      pageCount={pageCount}
    />
  );
}
