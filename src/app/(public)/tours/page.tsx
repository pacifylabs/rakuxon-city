import Link from "next/link";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Pagination } from "@/components/listings/pagination";
import { FilterBar } from "@/components/listings/filter-bar";
import { VideoCard } from "@/components/video/video-card";
import { getVideoFilterOptions, getVideoPage } from "@/lib/videos";
import {
  buildVideoQueryString,
  hasActiveVideoFilters,
  parseVideoFilters,
} from "@/lib/video-query";
import { videoKindLabels, videoKindOrder } from "@/lib/video";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Video tours",
  description:
    "Drone tours, walkthroughs and estate overviews of the plots and homes we sell across Lagos, Ogun and the FCT.",
  path: "/tours",
});

/** FR-V1.4 — every video, filterable by kind and estate, paginated at twelve. */
export default async function ToursPage({ searchParams }: PageProps<"/tours">) {
  const filters = parseVideoFilters(await searchParams);

  const [{ videos, total, page, pageCount }, options] = await Promise.all([
    getVideoPage(filters),
    getVideoFilterOptions(),
  ]);

  const filtered = hasActiveVideoFilters(filters);

  return (
    <Section className="pt-10 lg:pt-16">
      <Container>
        <SectionHeading
          eyebrow="Video tours"
          heading="See the place, not just the paperwork"
          supporting="A drone pass over a plot's boundaries does work photographs cannot. Every tour below is tied to a listing or an estate you can enquire about."
        />

        <FilterBar
          className="mt-12 lg:mt-16"
          filters={[
            {
              key: "kind",
              label: "Type",
              options: videoKindOrder.map((kind) => ({
                value: kind,
                label: videoKindLabels[kind],
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
          ]}
        />

        <p className="mt-6 text-caption text-muted">
          <span className="tabular">{total}</span>{" "}
          {total === 1 ? "tour" : "tours"}
          {filtered
            ? total === 1
              ? " matches your filters"
              : " match your filters"
            : " published"}
        </p>

        {videos.length === 0 ? (
          <div className="mt-8 rounded-card border border-line bg-surface p-8 lg:p-12">
            <p className="text-heading text-foreground">No tours match that</p>
            <p className="mt-4 max-w-[52ch] text-body text-muted">
              We film as estates reach each stage, so the library is thinner
              than the listing count. Clearing the filters shows everything
              published so far.
            </p>
            <Link
              href="/tours"
              className="mt-6 inline-block text-body text-accent-text underline underline-offset-4 hover:text-foreground"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((video, index) => (
                <ScrollReveal key={video.slug} delayMs={(index % 3) * 60}>
                  <VideoCard
                    video={video}
                    priority={index === 0}
                    className="h-full"
                  />
                </ScrollReveal>
              ))}
            </div>

            <Pagination
              page={page}
              pageCount={pageCount}
              hrefFor={(target) =>
                `/tours${buildVideoQueryString(filters, { page: target })}`
              }
            />
          </>
        )}
      </Container>
    </Section>
  );
}
