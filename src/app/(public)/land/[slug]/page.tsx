import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/listings/breadcrumbs";
import { EnquiryPanel } from "@/components/listings/enquiry-panel";
import { FactList } from "@/components/listings/fact-list";
import { LocationBlock } from "@/components/listings/location-block";
import { PaymentPlan } from "@/components/listings/payment-plan";
import { RelatedListings } from "@/components/listings/related-listings";
import { TitleRibbon } from "@/components/listings/title-ribbon";
import { ArrowGlyph } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { Gallery } from "@/components/ui/gallery";
import { formatArea } from "@/lib/format";
import {
  getListingDetail,
  getListingSlugs,
  getRelatedListings,
} from "@/lib/listings";
import Link from "next/link";

/** ISR — listings change through the admin dashboard, not on every request. */
export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getListingSlugs("LAND");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/land/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingDetail(slug);
  if (!listing) return { title: "Plot not found — Rakuxon City" };

  return {
    title: `${listing.title} — Rakuxon City`,
    description: listing.description.slice(0, 155),
  };
}

export default async function PlotDetailPage({
  params,
}: PageProps<"/land/[slug]">) {
  const { slug } = await params;
  const listing = await getListingDetail(slug);

  if (!listing || listing.type !== "LAND" || !listing.landDetail) notFound();

  const land = listing.landDetail;
  const related = await getRelatedListings(
    listing.id,
    "LAND",
    listing.estateId,
    listing.location,
  );

  const images = listing.media.map((entry) => entry.media);

  return (
    <>
      <Section className="pb-0 lg:pb-0">
        <Container>
          <Breadcrumbs
            trail={[
              { label: "Home", href: "/" },
              { label: "Land", href: "/land" },
              { label: listing.title },
            ]}
          />

          <h1 className="mt-6 max-w-[22ch] text-display-m text-ink">
            {listing.title}
          </h1>
          <p className="mt-3 text-body text-ink-secondary">
            {listing.location}, {listing.state} State
            {listing.estate ? ` · ${listing.estate.name}` : ""}
          </p>

          <Gallery images={images} className="mt-10" />
        </Container>
      </Section>

      {/*
        §7 — the ribbon sits directly beneath the gallery, before the
        description and before the price. Full-bleed on purpose: it is the one
        element on the page allowed to command this much attention.
      */}
      <TitleRibbon
        className="mt-12 lg:mt-16"
        titleType={land.titleType}
        surveyNumber={land.surveyNumber}
        documents={land.documents}
      />

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-7">
              <h2 className="text-heading text-ink">About this plot</h2>
              <p className="mt-5 max-w-[62ch] text-body-l text-ink-secondary">
                {listing.description}
              </p>

              <FactList
                facts={[
                  {
                    label: "Plot size",
                    value: formatArea(land.plotSize.toString(), land.plotUnit),
                    tabular: true,
                  },
                  {
                    label: "Survey number",
                    value: land.surveyNumber ?? "Not recorded",
                    tabular: Boolean(land.surveyNumber),
                  },
                  {
                    label: "Topography",
                    value: land.topography ?? "Not recorded",
                  },
                  {
                    label: "Road access",
                    value: land.roadAccess ?? "Not recorded",
                  },
                ]}
              />

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
                action="Enquire about this plot"
              />
            </div>
          </div>
        </Container>
      </Section>

      <RelatedListings listings={related} track="land" />
    </>
  );
}
