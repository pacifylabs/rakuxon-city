import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { FilterBar, type FilterConfig } from "@/components/listings/filter-bar";
import {
  ListingCard,
  type ListingCardData,
} from "@/components/listings/listing-card";
import { ListingEmptyState } from "@/components/listings/empty-state";
import { Pagination } from "@/components/listings/pagination";
import {
  buildQueryString,
  sortOptions,
  type ListingFilters,
} from "@/lib/listing-query";

/**
 * The shared hub shell for both tracks. The tracks differ only in their filter
 * configuration and their copy — the grid, the pagination, the empty state and
 * the query path are identical, which is the point of the shared `Listing` base.
 */
export function ListingHub({
  track,
  heading,
  supporting,
  basePath,
  filters,
  filterConfig,
  listings,
  total,
  page,
  pageCount,
  filtered,
}: {
  track: "land" | "homes";
  heading: string;
  supporting: string;
  basePath: string;
  filters: ListingFilters;
  filterConfig: FilterConfig[];
  listings: ListingCardData[];
  total: number;
  page: number;
  pageCount: number;
  filtered: boolean;
}) {
  const noun = track === "land" ? "plot" : "home";

  return (
    <Section className="pt-10 lg:pt-16">
      <Container>
        <SectionHeading
          eyebrow={track === "land" ? "Land" : "Homes"}
          heading={heading}
          supporting={supporting}
        />

        <FilterBar
          className="mt-12 lg:mt-16"
          filters={filterConfig}
          sortOptions={Object.entries(sortOptions).map(([value, label]) => ({
            value,
            label,
          }))}
        />

        <p className="mt-6 text-caption text-ink-muted">
          <span className="tabular">{total}</span>{" "}
          {total === 1 ? noun : `${noun}s`}
          {filtered
            ? total === 1
              ? " matches your filters"
              : " match your filters"
            : " listed"}
        </p>

        {listings.length === 0 ? (
          <div className="mt-8">
            <ListingEmptyState
              track={track}
              filtered={filtered}
              clearHref={basePath}
            />
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing, index) => (
                <ScrollReveal key={listing.slug} delayMs={(index % 3) * 60}>
                  <ListingCard listing={listing} className="h-full" />
                </ScrollReveal>
              ))}
            </div>

            <Pagination
              page={page}
              pageCount={pageCount}
              hrefFor={(target) =>
                `${basePath}${buildQueryString(filters, { page: target })}`
              }
            />
          </>
        )}
      </Container>
    </Section>
  );
}
