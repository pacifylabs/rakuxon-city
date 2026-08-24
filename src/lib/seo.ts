import type { Metadata } from "next";
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

export function origin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
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
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle,
  images,
  noIndex,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: string;
  images?: { url: string; width?: number; height?: number; alt?: string }[];
  /** For pages that exist but should not be in the index — see /primitives. */
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const ogTitle = absoluteTitle ?? `${title}${SEPARATOR}${site.name}`;

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    alternates: { canonical: url },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: ogTitle,
      description,
      url,
      type: "website",
      locale: "en_NG",
      siteName: site.name,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      ...(images ? { images: images.map((image) => image.url) } : {}),
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
