"use client";

import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { VideoFacade } from "@/components/video/video-facade";
import type { VideoCardData } from "@/components/video/video-card";
import { cn } from "@/lib/cn";
import { formatDuration, posterUrl, videoKindLabels } from "@/lib/video";

/**
 * FR-V1.1 — the video block on a listing or estate detail page.
 *
 * One primary player, and a thumbnail strip beneath it when there is more than
 * one video. Selecting from the strip returns the primary player to its poster
 * rather than starting playback: the visitor asked to *see* a different video,
 * not to play it, and §2's "never autoplay" holds for the second video as
 * firmly as for the first.
 *
 * That reset is what also satisfies FR-V1.6 here — the facade is keyed on the
 * selected slug, so switching unmounts the previous iframe outright rather than
 * swapping its `src`.
 */
export function VideoBlock({
  videos,
  className,
}: {
  videos: VideoCardData[];
  className?: string;
}) {
  const [selected, setSelected] = useState(0);

  if (videos.length === 0) return null;

  const current = videos[selected] ?? videos[0];
  const duration = formatDuration(current.durationSeconds);

  return (
    <section className={cn("", className)} aria-labelledby="video-tour">
      <h2 id="video-tour" className="text-heading text-foreground">
        Video tour
      </h2>

      <div className="mt-6">
        <VideoFacade key={current.slug} video={current}>
          <Badge className="pointer-events-none absolute top-3 left-3 bg-accent-tint text-accent-text">
            {videoKindLabels[current.kind]}
          </Badge>

          {duration ? (
            <span className="tabular pointer-events-none absolute right-3 bottom-3 rounded-full bg-charcoal-deep/70 px-2.5 py-1 text-caption text-ivory-light">
              {duration}
            </span>
          ) : null}
        </VideoFacade>
      </div>

      <div className="mt-4">
        <p className="text-body text-foreground">{current.title}</p>
        {current.description ? (
          <p className="mt-2 max-w-[62ch] text-body text-muted">
            {current.description}
          </p>
        ) : null}
      </div>

      {videos.length > 1 ? (
        <ul
          className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          aria-label="Other videos for this listing"
        >
          {videos.map((video, index) => {
            const isCurrent = index === selected;

            return (
              <li key={video.slug}>
                <button
                  type="button"
                  onClick={() => setSelected(index)}
                  aria-current={isCurrent ? "true" : undefined}
                  className={cn(
                    "group block w-full cursor-pointer text-left",
                    "focus-visible:ring-2 focus-visible:ring-foreground focus-visible:outline-none",
                  )}
                >
                  <span
                    className={cn(
                      "relative block aspect-video overflow-hidden rounded-control border",
                      isCurrent
                        ? "border-foreground"
                        : "border-line group-hover:border-muted",
                    )}
                  >
                    <Image
                      src={video.poster?.url ?? posterUrl(video.youtubeId)}
                      alt=""
                      fill
                      sizes="180px"
                      className={cn(
                        "object-cover transition-opacity",
                        isCurrent ? "opacity-100" : "opacity-80",
                      )}
                    />
                  </span>
                  <span
                    className={cn(
                      "mt-2 block text-caption",
                      isCurrent ? "text-accent-text" : "text-muted",
                    )}
                  >
                    {videoKindLabels[video.kind]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
