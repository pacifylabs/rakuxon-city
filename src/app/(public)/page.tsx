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
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { faqJsonLd } from "@/lib/schema";
import { questions } from "@/components/home/faq";

const description =
  "Serviced plots and completed homes across Lagos, Ogun and the FCT. Every listing shows its title type and documentation before it shows a price.";

/** The share image is resolved from the `site.ogImage` slot, so it is editable. */
export async function generateMetadata(): Promise<Metadata> {
  const og = await getPlacement("site.ogImage");

  return pageMetadata({
    // Absolute: the root template would otherwise append the brand a second
    // time to a title that already carries it.
    title: "Rakuxon City",
    absoluteTitle: "Rakuxon City — land and homes, with the papers in order",
    description,
    path: "/",
    images: og
      ? [{ 
          url: og.url, 
          width: og.width, 
          height: og.height, 
          alt: og.alt || "Rakuxon City — land and homes, with the papers in order"
        }]
      : undefined,
  });
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
    // One list, three estates, feeding both the hero and the block below it.
    getFeaturedEstates(3),
    getSpotlightListings(8),
    getTestimonials(),
    getRecentArticles(2),
    getCollageImages(),
    getDeliveredEstateCount(),
    getFeaturedVideos(4),
  ]);

  /**
   * The estate rows, shaped for the hero. Slide order follows estate order.
   * Only slug/name/image travel now — 07_FEATURE_HERO.md's content block
   * doesn't carry a labelled estate caption the way the old hero did, so the
   * rest of the estate row was dropped rather than passed and left unused.
   */
  const heroSlides = estates.map((estate) => ({
    slug: estate.slug,
    name: estate.name,
    image: estate.image
      ? { url: estate.image.url, alt: estate.image.alt }
      : null,
  }));

  return (
    <>
      {/* FR-5.x — the accordion below is real Q&A, so it is eligible for
          FAQ markup, built from the same array the accordion renders. */}
      <JsonLd data={faqJsonLd(questions)} />

      <Hero slides={heroSlides} />
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
