import type { VideoCardData } from "@/components/video/video-card";
import { posterUrl, watchUrl } from "@/lib/video";

/**
 * FR-V1.9 — `VideoObject` markup for each video on a page.
 *
 * NOTE: the requirement says "alongside the existing `RealEstateListing`
 * markup". There is no `RealEstateListing` markup on this site yet — no page
 * emits structured data of any kind. That belongs to the listing pages rather
 * than to this addendum, so it is flagged rather than quietly built here.
 *
 * `contentUrl` deliberately points at YouTube rather than at an mp4: the video
 * is hosted there, and claiming otherwise would be a lie to a crawler.
 */
export function VideoStructuredData({
  videos,
  siteUrl,
}: {
  videos: VideoCardData[];
  /** Absolute URLs are required here; relative ones are silently dropped. */
  siteUrl: string;
}) {
  if (videos.length === 0) return null;

  const payload = videos.map((video) => ({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description ?? video.title,
    thumbnailUrl: video.poster
      ? new URL(video.poster.url, siteUrl).toString()
      : posterUrl(video.youtubeId),
    embedUrl: `https://www.youtube-nocookie.com/embed/${video.youtubeId}`,
    contentUrl: watchUrl(video.youtubeId),
    url: new URL(`/tours/${video.slug}`, siteUrl).toString(),
  }));

  return (
    <script
      type="application/ld+json"
      // Structured data has no non-script representation; this is the one place
      // a script tag is the correct answer rather than a workaround.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
