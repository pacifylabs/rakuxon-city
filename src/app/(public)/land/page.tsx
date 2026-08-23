import type { Metadata } from "next";
import { ListingHub } from "@/components/listings/listing-hub";
import { titleTypeLabel } from "@/components/ui/badge";
import { getFilterOptions, getListingPage } from "@/lib/listings";
import {
  hasActiveFilters,
  parseListingFilters,
  plotSizeBands,
  priceBands,
} from "@/lib/listing-query";
import { ListingStatus, TitleType } from "@/generated/prisma/enums";

export const metadata: Metadata = {
  title: "Land for sale — Rakuxon City",
  description:
    "Serviced plots across Lagos, Ogun and the FCT, each listed with its title type, survey number and documentation.",
};

export default async function LandHubPage({
  searchParams,
}: PageProps<"/land">) {
  const filters = parseListingFilters(await searchParams);

  const [{ listings, total, page, pageCount }, options] = await Promise.all([
    getListingPage("LAND", filters),
    getFilterOptions("LAND"),
  ]);

  return (
    <ListingHub
      track="land"
      basePath="/land"
      heading="Plots with the paperwork on the table"
      supporting="Every plot below carries its title type, its survey number and the documents we hold. Where the position is weaker than a buyer would like, it says so."
      filters={filters}
      filtered={hasActiveFilters(filters)}
      filterConfig={[
        {
          key: "titleType",
          label: "Title type",
          options: Object.values(TitleType).map((value) => ({
            value,
            label: titleTypeLabel(value),
          })),
        },
        {
          key: "state",
          label: "State",
          options: options.states.map((state) => ({
            value: state,
            label: state,
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
          key: "plotSize",
          label: "Plot size",
          options: Object.entries(plotSizeBands).map(([value, band]) => ({
            value,
            label: band.label,
          })),
        },
        {
          key: "price",
          label: "Price",
          options: Object.entries(priceBands).map(([value, band]) => ({
            value,
            label: band.label,
          })),
        },
        {
          key: "paymentPlan",
          label: "Payment plan",
          options: [{ value: "true", label: "Payment plan available" }],
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
