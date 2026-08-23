import type { Metadata } from "next";
import { EnquiryBand } from "@/components/home/enquiry-band";
import { Faq } from "@/components/home/faq";
import { FeaturedEstate } from "@/components/home/featured-estate";
import { Hero } from "@/components/home/hero";
import { InvestorStrip } from "@/components/home/investor-strip";
import { ResourcesTeaser } from "@/components/home/resources-teaser";
import { Spotlight } from "@/components/home/spotlight";
import { Testimonials } from "@/components/home/testimonials";
import { TrustBand } from "@/components/home/trust-band";
import { TwoLane } from "@/components/home/two-lane";
import { VideoTours } from "@/components/home/video-tours";
import {
  getCollageImages,
  getDeliveredEstateCount,
  getFeaturedEstates,
  getRecentArticles,
  getTestimonials,
} from "@/lib/content";
import { getLaneCounts, getSpotlightListings } from "@/lib/listings";
import { getFeaturedVideos } from "@/lib/videos";
import { getPlacement } from "@/lib/media";

const description =
  "Serviced plots and completed homes across Lagos, Ogun and the FCT. Every listing shows its title type and documentation before it shows a price.";

/** The share image is resolved from the `site.ogImage` slot, so it is editable. */
export async function generateMetadata(): Promise<Metadata> {
  const og = await getPlacement("site.ogImage");

  return {
    title: "Rakuxon City — land and homes, with the papers in order",
    description,
    openGraph: {
      title: "Rakuxon City",
      description,
      type: "website",
      images: og
        ? [{ url: og.url, width: og.width, height: og.height, alt: og.alt }]
        : undefined,
    },
  };
}

/**
 * The landing page, per 01_SITE_ARCHITECTURE.md §5.1 and the reference layout.
 * Block order top to bottom is the one specified there; every figure and every
 * listing on this page is read from the database rather than hardcoded.
 */
export default async function HomePage() {
  const [
    counts,
    estates,
    spotlight,
    testimonials,
    articles,
    collage,
    delivered,
    videos,
  ] = await Promise.all([
    getLaneCounts(),
    getFeaturedEstates(2),
    getSpotlightListings(8),
    getTestimonials(),
    getRecentArticles(2),
    getCollageImages(),
    getDeliveredEstateCount(),
    getFeaturedVideos(4),
  ]);

  return (
    <>
      <Hero counts={counts} />
      <FeaturedEstate estates={estates} />
      <TwoLane counts={counts} />
      <TrustBand deliveredEstates={delivered} />
      <Spotlight listings={spotlight} />
      {/* FR-V1.3 — between Spotlight and Testimonials. */}
      <VideoTours videos={videos} />
      <Testimonials testimonials={testimonials} />
      <Faq collage={collage} />
      <ResourcesTeaser articles={articles} />
      <InvestorStrip />
      <EnquiryBand />
    </>
  );
}
