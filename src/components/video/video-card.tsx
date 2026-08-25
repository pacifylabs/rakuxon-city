import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  VideoFacade,
  type VideoFacadeData,
} from "@/components/video/video-facade";
import { cn } from "@/lib/cn";
import { formatDuration, videoKindLabels } from "@/lib/video";
import type { VideoKind } from "@/generated/prisma/enums";

export type VideoCardData = VideoFacadeData & {
  kind: VideoKind;
  description: string | null;
  durationSeconds: number | null;
  /** The listing or estate this belongs to — every video has exactly one. */
  parent: { href: string; name: string } | null;
};

/**
 * 06_FEATURE_VIDEO_TOURS.md §5 — "follows the listing card exactly".
 *
 * Surface fill, hairline border, radius-card, and no shadow. §11 forbids
 * elevation here and spends the homepage's two lifts elsewhere, so a video card
 * sitting beside a listing card must be the same weight or the grid tilts.
 */
export function VideoCard({
  video,
  priority = false,
  className,
}: {
  video: VideoCardData;
  priority?: boolean;
  className?: string;
}) {
  const duration = formatDuration(video.durationSeconds);

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-card border border-line bg-surface",
        className,
      )}
    >
      <VideoFacade
        video={video}
        priority={priority}
        className="rounded-none rounded-t-card border-0"
      >
        <Badge className="pointer-events-none absolute top-3 left-3 bg-accent-tint text-accent-text">
          {videoKindLabels[video.kind]}
        </Badge>

        {duration ? (
          <span className="tabular pointer-events-none absolute right-3 bottom-3 rounded-full bg-charcoal-deep/70 px-2.5 py-1 text-caption text-ivory-light">
            {duration}
          </span>
        ) : null}
      </VideoFacade>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-heading text-foreground">
          {/*
            The heading links to the shareable page rather than playing in
            place: §5 wants a card that can be sent to someone, and a card whose
            only affordance is play cannot be linked to at all.
          */}
          <Link
            href={`/tours/${video.slug}`}
            className="transition-colors hover:text-accent-text focus-visible:ring-2 focus-visible:ring-foreground focus-visible:outline-none"
          >
            {video.title}
          </Link>
        </h3>

        {video.parent ? (
          <p className="mt-2 text-caption text-muted">
            {video.parent.name}
          </p>
        ) : null}
      </div>
    </article>
  );
}
