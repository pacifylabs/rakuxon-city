import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/listings/breadcrumbs";
import { EnquiryPanel } from "@/components/listings/enquiry-panel";
import { FactList } from "@/components/listings/fact-list";
import { LocationBlock } from "@/components/listings/location-block";
import { PaymentPlan } from "@/components/listings/payment-plan";
import { RelatedListings } from "@/components/listings/related-listings";
import { BuildStageBadge } from "@/components/ui/badge";
import { ArrowGlyph } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { Gallery } from "@/components/ui/gallery";
import { VideoBlock } from "@/components/video/video-block";
import { VideoStructuredData } from "@/components/video/video-structured-data";
import { getListingVideos } from "@/lib/videos";
import { env } from "@/lib/env";
import { formatArea, formatHandover } from "@/lib/format";
import {
  getListingDetail,
  getListingSlugs,
  getRelatedListings,
} from "@/lib/listings";
import type { HouseType } from "@/generated/prisma/enums";

export const revalidate = 3600;

const houseTypeLabels: Record<HouseType, string> = {
  DETACHED: "Detached house",
  SEMI_DETACHED: "Semi-detached house",
  TERRACE: "Terrace",
  BUNGALOW: "Bungalow",
  DUPLEX: "Duplex",
  APARTMENT: "Apartment",
};

export async function generateStaticParams() {
  const slugs = await getListingSlugs("HOME");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/homes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingDetail(slug);
  if (!listing) return { title: "Home not found — Rakuxon City" };

  return {
    title: `${listing.title} — Rakuxon City`,
    description: listing.description.slice(0, 155),
  };
}

export default async function HouseDetailPage({
  params,
}: PageProps<"/homes/[slug]">) {
  const { slug } = await params;
  const listing = await getListingDetail(slug);

  if (!listing || listing.type !== "HOME" || !listing.homeDetail) notFound();

  const home = listing.homeDetail;
  const [related, videos] = await Promise.all([
    getRelatedListings(listing.id, "HOME", listing.estateId, listing.location),
    getListingVideos(listing.id),
  ]);

  const images = listing.media.map((entry) => entry.media);
  const offPlan = home.buildStage === "OFF_PLAN";

  return (
    <>
      <Section className="pb-0 lg:pb-0">
        <Container>
          <Breadcrumbs
            trail={[
              { label: "Home", href: "/" },
              { label: "Homes", href: "/homes" },
              { label: listing.title },
            ]}
          />

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <BuildStageBadge buildStage={home.buildStage} />
            {home.handoverDate ? (
              <p className="text-caption text-ink-muted">
                Handover {formatHandover(home.handoverDate)}
              </p>
            ) : null}
          </div>

          <h1 className="mt-4 max-w-[22ch] text-display-m text-ink">
            {listing.title}
          </h1>
          <p className="mt-3 text-body text-ink-secondary">
            {listing.location}, {listing.state} State
            {listing.estate ? ` · ${listing.estate.name}` : ""}
          </p>

          <Gallery images={images} className="mt-10" />

          {/* FR-V1.1 — beneath the gallery on home pages. */}
          {videos.length > 0 ? (
            <VideoBlock videos={videos} className="mt-12" />
          ) : null}

          <VideoStructuredData
            videos={videos}
            siteUrl={env.NEXT_PUBLIC_SITE_URL}
          />

          {offPlan ? (
            // §8 — non-negotiable on off-plan listings.
            <p className="mt-3 text-caption text-ink-muted">
              Imagery is an artist&rsquo;s impression. This house is not yet
              built.
            </p>
          ) : null}
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-7">
              <h2 className="text-heading text-ink">About this home</h2>
              <p className="mt-5 max-w-[62ch] text-body-l text-ink-secondary">
                {listing.description}
              </p>

              <FactList
                facts={[
                  {
                    label: "Bedrooms",
                    value: String(home.bedrooms),
                    tabular: true,
                  },
                  {
                    label: "Bathrooms",
                    value: String(home.bathrooms),
                    tabular: true,
                  },
                  {
                    label: "House type",
                    value: houseTypeLabels[home.houseType],
                  },
                  {
                    label: "Build stage",
                    value:
                      home.buildStage === "OFF_PLAN"
                        ? "Off plan"
                        : home.buildStage === "UNDER_CONSTRUCTION"
                          ? "Under construction"
                          : "Completed",
                  },
                  {
                    label: "Built area",
                    value: formatArea(home.builtArea.toString(), "SQM"),
                    tabular: true,
                  },
                  {
                    label: "Land area",
                    value: formatArea(home.landArea.toString(), "SQM"),
                    tabular: true,
                  },
                  {
                    label: "Expected handover",
                    value: home.handoverDate
                      ? formatHandover(home.handoverDate)
                      : "Ready now",
                  },
                ]}
              />

              <div className="mt-10">
                <h2 className="text-heading text-ink">
                  Finishing specification
                </h2>
                <p className="mt-4 max-w-[62ch] text-body text-ink-secondary">
                  {home.finishingSpec}
                </p>

                {home.features.length > 0 ? (
                  <ul className="mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                    {home.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-body text-ink-secondary"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              {home.floorPlan ? (
                <div className="mt-10">
                  <h2 className="text-heading text-ink">Floor plan</h2>
                  <Gallery images={[home.floorPlan]} className="mt-4" />
                </div>
              ) : (
                <p className="mt-10 text-caption text-ink-muted">
                  {/* TODO: real figures — floor plans arrive with the client's drawings. */}
                  The floor plan for this unit is available on request.
                </p>
              )}

              <div className="mt-10 grid gap-6">
                {listing.paymentPlanAvailable ? (
                  <PaymentPlan
                    terms={listing.paymentPlanTerms}
                    price={listing.price?.toString() ?? null}
                  />
                ) : null}

                <LocationBlock
                  location={listing.location}
                  state={listing.state}
                  estateName={listing.estate?.name}
                />

                {listing.estate ? (
                  <Link
                    href={`/estates/${listing.estate.slug}`}
                    className="inline-flex items-center gap-2 text-body text-accent transition-colors hover:text-accent-hover"
                  >
                    See everything in {listing.estate.name}
                    <ArrowGlyph />
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="lg:col-span-5">
              <EnquiryPanel
                reference={listing.reference}
                price={listing.price?.toString() ?? null}
                priceOnRequest={listing.priceOnRequest}
                status={listing.status}
                action="Book an inspection"
              />
            </div>
          </div>
        </Container>
      </Section>

      <RelatedListings listings={related} track="homes" />
    </>
  );
}
