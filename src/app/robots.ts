import type { MetadataRoute } from "next";
import { absoluteUrl, origin } from "@/lib/seo";

/**
 * Crawl rules.
 *
 * `/admin` and `/api` are disallowed because neither has anything a crawler
 * should reach, and `/admin` will hold authenticated pages from Phase 7.
 * Disallow is not a security control — the admin routes are protected by
 * auth — it just keeps them out of the index.
 *
 * `/primitives` is the internal component gallery. It also sends `noindex`,
 * which is the rule that actually removes it; this only saves the crawl.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/", "/primitives"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: origin(),
  };
}
