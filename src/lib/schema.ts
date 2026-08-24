import { absoluteUrl, origin } from "@/lib/seo";
import { site } from "@/lib/site";

/**
 * JSON-LD builders.
 *
 * Every value here is either a real fact from `lib/site.ts` or read from the
 * database. Nothing is invented to fill a recommended field — structured data
 * that overstates is worse than structured data that is merely thin, because
 * a search engine will surface it as though the site asserted it.
 *
 * Notably absent: `address`. `RealEstateAgent` would prefer a PostalAddress,
 * but no Nigerian office address has ever been published for this brand. The
 * areas served are given instead, which is true.
 */

/** The organisation behind the site. Rendered once, in the root layout. */
export function organisationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${origin()}/#organisation`,
    name: site.name,
    url: origin(),
    email: site.email,
    telephone: site.phone.e164,
    logo: absoluteUrl("/logo.png"),
    image: absoluteUrl("/logo.png"),
    description:
      "Serviced plots and completed homes across Lagos, Ogun and the FCT, sold with the title type and documentation published on every listing.",
    areaServed: site.regionsServed.map((region) => ({
      "@type": "AdministrativeArea",
      name: region,
    })),
    sameAs: site.socials.map((social) => social.href),
  };
}

/** Enables the sitelinks search box, and names the site for search engines. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${origin()}/#website`,
    name: site.name,
    url: origin(),
    inLanguage: "en-NG",
    publisher: { "@id": `${origin()}/#organisation` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${origin()}/land?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * A listing. `RealEstateListing` is the correct type for a property offered
 * for sale, and it carries the offer inline.
 *
 * FR-1.5 reaches here too: a price-on-request listing must not emit a price of
 * zero or null. It emits an offer with availability and no price, which is an
 * accurate statement that the figure is not published.
 */
export function listingJsonLd(listing: {
  slug: string;
  title: string;
  description: string;
  location: string;
  state: string;
  price: string | null;
  priceOnRequest: boolean;
  status: string;
  type: string;
  images: { url: string }[];
  land?: { plotSize: string; plotUnit: string } | null;
  home?: { bedrooms: number; bathrooms: number } | null;
}) {
  const path = `/${listing.type === "LAND" ? "land" : "homes"}/${listing.slug}`;

  const availability =
    listing.status === "AVAILABLE"
      ? "https://schema.org/InStock"
      : listing.status === "RESERVED"
        ? "https://schema.org/PreOrder"
        : "https://schema.org/SoldOut";

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${absoluteUrl(path)}#listing`,
    url: absoluteUrl(path),
    name: listing.title,
    description: listing.description,
    datePosted: undefined,
    image: listing.images.map((image) => absoluteUrl(image.url)),
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.location,
      addressRegion: listing.state,
      addressCountry: "NG",
    },
    offers: {
      "@type": "Offer",
      availability,
      priceCurrency: "NGN",
      // Omitted entirely when the price is on request — see FR-1.5.
      ...(listing.priceOnRequest || listing.price === null
        ? {}
        : { price: listing.price }),
      seller: { "@id": `${origin()}/#organisation` },
    },
    ...(listing.land
      ? {
          floorSize: {
            "@type": "QuantitativeValue",
            value: Number(listing.land.plotSize),
            unitCode: listing.land.plotUnit === "SQM" ? "MTK" : "HAR",
          },
        }
      : {}),
    ...(listing.home
      ? {
          numberOfBedrooms: listing.home.bedrooms,
          numberOfBathroomsTotal: listing.home.bathrooms,
        }
      : {}),
  };
}

/** An article, for the buyer guides. */
export function articleJsonLd(article: {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string | Date | null;
  coverImage: { url: string } | null;
}) {
  const path = `/resources/${article.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${absoluteUrl(path)}#article`,
    headline: article.title,
    description: article.excerpt,
    url: absoluteUrl(path),
    ...(article.coverImage
      ? { image: [absoluteUrl(article.coverImage.url)] }
      : {}),
    ...(article.publishedAt
      ? { datePublished: new Date(article.publishedAt).toISOString() }
      : {}),
    author: { "@id": `${origin()}/#organisation` },
    publisher: { "@id": `${origin()}/#organisation` },
    isAccessibleForFree: true,
  };
}

/**
 * Breadcrumbs.
 *
 * The visible breadcrumb trail was removed at the client's request (TODO
 * §1.14) in favour of an active state on the primary nav. The structured
 * version stays: it is what produces the trail shown under a search result,
 * and losing that would cost real click-through for no visual gain.
 */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: absoluteUrl(entry.path),
    })),
  };
}

/** FAQ markup for the homepage accordion, which is real Q&A. */
export function faqJsonLd(entries: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}
