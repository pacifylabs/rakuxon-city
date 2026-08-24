import type { MetadataRoute } from "next";
import { getArticleSlugs, getEstateSlugs } from "@/lib/content";
import { getListingSlugs } from "@/lib/listings";
import { getVideoSlugs } from "@/lib/videos";
import { absoluteUrl } from "@/lib/seo";
import { ListingType } from "@/generated/prisma/enums";

/**
 * Every public URL, built from the same queries the pages use.
 *
 * Drafts are excluded because the slug helpers already exclude them — a draft
 * listing has no page, so listing it here would advertise a 404. `/primitives`
 * is absent deliberately: it is an internal component gallery, and it also
 * carries `noindex`.
 *
 * `changeFrequency` and `priority` are advisory and widely ignored, but they
 * cost nothing and they do express the shape of the site accurately: listings
 * move, guides do not.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [land, homes, estates, articles, videos] = await Promise.all([
    getListingSlugs(ListingType.LAND),
    getListingSlugs(ListingType.HOME),
    getEstateSlugs(),
    getArticleSlugs(),
    getVideoSlugs(),
  ]);

  const now = new Date();

  const staticPages: {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }[] = [
    { path: "/", priority: 1, changeFrequency: "daily" },
    { path: "/land", priority: 0.9, changeFrequency: "daily" },
    { path: "/homes", priority: 0.9, changeFrequency: "daily" },
    { path: "/estates", priority: 0.8, changeFrequency: "weekly" },
    { path: "/tours", priority: 0.7, changeFrequency: "weekly" },
    { path: "/resources", priority: 0.7, changeFrequency: "weekly" },
    { path: "/about", priority: 0.5, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
    { path: "/invest", priority: 0.4, changeFrequency: "monthly" },
    { path: "/credits", priority: 0.2, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  ];

  // Next normalises the root canonical to the bare origin, so the sitemap
  // uses the same form. Two spellings of the homepage URL across canonical and
  // sitemap is the kind of thing that reads as duplicate content.
  const entry = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  ) => ({
    url: path === "/" ? absoluteUrl("/").replace(/\/$/, "") : absoluteUrl(path),
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    ...staticPages.map((page) =>
      entry(page.path, page.priority, page.changeFrequency),
    ),
    ...land.map((slug) => entry(`/land/${slug}`, 0.8, "weekly" as const)),
    ...homes.map((slug) => entry(`/homes/${slug}`, 0.8, "weekly" as const)),
    ...estates.map((slug) => entry(`/estates/${slug}`, 0.7, "weekly" as const)),
    ...articles.map((slug) =>
      entry(`/resources/${slug}`, 0.6, "monthly" as const),
    ),
    ...videos.map((slug) => entry(`/tours/${slug}`, 0.5, "monthly" as const)),
  ];
}
