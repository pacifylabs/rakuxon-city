import type { Metadata } from "next";
import { env } from "@/lib/env";
import { site } from "@/lib/site";

/**
 * One place that builds page metadata, so a page cannot ship without a
 * canonical or with an Open Graph title that drifted from its `<title>`.
 *
 * Modelled on the sibling rakuxon-care project's `lib/seo.ts`, adjusted for
 * this site: `en-NG` rather than `en-GB`, and an em-dash separator to match
 * the titles already written here.
 */
const SEPARATOR = " — ";

/** Last editorial review, emitted as the `date` meta tag SEO tools look for. */
export const SITE_DATE = "2026-08-30";

/**
 * The share image, at the 1.91:1 that Facebook, LinkedIn and X lay a card out
 * to. The file on disk is exactly 1200×630 — it was a 1274×932 screenshot
 * declared as 1200×630 for a while, and the platforms letterboxed it to fit
 * the numbers rather than the pixels. If the artwork is ever replaced, match
 * these dimensions or change them here too.
 */
const DEFAULT_OG_IMAGE = {
  url: "/images/og.jpg",
  width: 1200,
  height: 630,
  alt: "Rakuxon City — land and homes, with the papers in order",
};

/**
 * The MIME type for an image URL.
 *
 * Every image used to be declared `image/jpeg`, including listing photography
 * that is routinely PNG or WebP. Facebook reads the declared type, so a PNG
 * announced as a JPEG can be dropped from the card. Unknown extensions get no
 * type at all, which the crawlers handle by sniffing.
 */
function imageMimeType(url: string): string | undefined {
  const extension = url.split("?")[0].split(".").pop()?.toLowerCase();
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "avif":
      return "image/avif";
    default:
      return undefined;
  }
}

export function origin(): string {
  /*
   * Routed through the validated `env` module rather than reading
   * `process.env` here directly. That module already guards against the bug
   * that broke the Vercel build: an unset NEXT_PUBLIC_SITE_URL arrives as ""
   * on Vercel, not undefined, which `??` does not catch — so `origin()` was
   * returning "" and `new URL("")` in the root layout's metadataBase threw
   * ERR_INVALID_URL at build time. env.ts now treats "" as unset before
   * applying its default, so `env.NEXT_PUBLIC_SITE_URL` is always a valid URL.
   */
  return env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return `${origin()}${normalised}`;
}

/**
 * Canonical, Open Graph and Twitter metadata for a public page.
 *
 * Titles go through the root template (`%s — Rakuxon City`) unless
 * `absoluteTitle` is given — used on the homepage, so the brand is not
 * repeated twice in one title.
 *
 * Images are normalized to absolute URLs and fall back to the site's default
 * OG image if none are provided, ensuring every page has a preview image.
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle,
  images,
  noIndex,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: string;
  images?: { url: string; width?: number; height?: number; alt?: string }[];
  /** For pages that exist but should not be in the index — see /primitives. */
  noIndex?: boolean;
  /** OpenGraph type - defaults to "website", can be "article" for blog posts */
  type?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(path);
  const ogTitle = absoluteTitle ?? `${title}${SEPARATOR}${site.name}`;

  // Normalize images to absolute URLs and add fallback
  const normalizedImages =
    images && images.length > 0
      ? images.map((img) => ({
          url: absoluteUrl(img.url),
          width: img.width,
          height: img.height,
          alt: img.alt || ogTitle,
          type: imageMimeType(img.url),
        }))
      : [
          {
            url: absoluteUrl(DEFAULT_OG_IMAGE.url),
            width: DEFAULT_OG_IMAGE.width,
            height: DEFAULT_OG_IMAGE.height,
            alt: DEFAULT_OG_IMAGE.alt,
            type: imageMimeType(DEFAULT_OG_IMAGE.url),
          },
        ];

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    // Carried per page, matching the sibling care project: some SEO tooling
    // reads these from the page rather than inheriting them from the layout.
    authors: [{ name: site.name, url: origin() }],
    other: { date: SITE_DATE },
    alternates: { canonical: url },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: ogTitle,
      description,
      url,
      type,
      locale: "en_NG",
      siteName: site.name,
      images: normalizedImages,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: normalizedImages.map((img) => img.url),
      creator: site.xHandle,
      site: site.xHandle,
    },
  };
}

/**
 * JSON-LD is injected with `dangerouslySetInnerHTML`, so the one character
 * that could close the script tag early is escaped. `<` cannot appear in valid
 * JSON outside a string, so escaping it unconditionally is safe.
 */
export function serialiseJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
