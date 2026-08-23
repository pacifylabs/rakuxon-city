"use client";

import Image from "next/image";
import { useCallback, useId, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { embedUrl, isValidYoutubeId, posterUrl, watchUrl } from "@/lib/video";

/**
 * 06_FEATURE_VIDEO_TOURS.md §2 — the facade.
 *
 * A YouTube iframe costs 500KB–1MB before anyone presses play, which would
 * breach the LCP budget in 02_PRD.md §6 on its own. So nothing here renders an
 * iframe until a visitor asks for one: the initial DOM is an image, a button
 * and no third-party code at all.
 *
 * FR-V1.6 also requires that no page ever holds two iframes at once. That has
 * to be coordinated between components that know nothing about each other, and
 * a context provider would only hold if every page remembered to mount it. The
 * module-level store below cannot be forgotten — importing the facade is what
 * subscribes it.
 */

let activeVideo: string | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getActive() {
  return activeVideo;
}

/** The server has no active video; without this the store throws on render. */
function getServerActive(): string | null {
  return null;
}

function setActive(id: string | null) {
  activeVideo = id;
  for (const listener of listeners) listener();
}

export type VideoFacadeData = {
  slug: string;
  youtubeId: string;
  title: string;
  /** A custom poster from the media library. Falls back to YouTube's own. */
  poster: { url: string; alt: string } | null;
  /** Rendered as a "Placeholder" caption naming the channel. */
  isStandIn: boolean;
  attribution: string | null;
};

export function VideoFacade({
  video,
  /** The first video on a page can afford to fetch its poster eagerly. */
  priority = false,
  className,
  children,
}: {
  video: VideoFacadeData;
  priority?: boolean;
  className?: string;
  /** Badges and duration, positioned over the poster by the caller. */
  children?: React.ReactNode;
}) {
  const instanceId = useId();
  const active = useSyncExternalStore(subscribe, getActive, getServerActive);
  const isPlaying = active === instanceId;
  const [posterFailed, setPosterFailed] = useState(false);

  const play = useCallback(() => setActive(instanceId), [instanceId]);

  // FR-V1.8. A malformed ID is caught before a request is ever made; a
  // well-formed ID pointing at a deleted or private video is caught by its
  // thumbnail 404ing, which is the only signal available without calling
  // YouTube's oEmbed endpoint on every render.
  if (!isValidYoutubeId(video.youtubeId) || posterFailed) {
    return (
      <VideoUnavailable
        title={video.title}
        youtubeId={
          isValidYoutubeId(video.youtubeId) ? video.youtubeId : undefined
        }
        className={className}
      />
    );
  }

  // A custom poster is preferred by §5. Where none exists we fall back to
  // YouTube's thumbnail *through next/image*, which fetches it on the server
  // and serves it from this origin — so a visitor who never presses play is
  // still not announced to Google, which is most of the point of a facade.
  const poster = video.poster ?? {
    url: posterUrl(video.youtubeId),
    alt: `Video thumbnail: ${video.title}`,
  };

  return (
    <div
      className={cn(
        "relative aspect-video overflow-hidden rounded-card bg-deep",
        className,
      )}
    >
      {isPlaying ? (
        <iframe
          // Keyed on the id so switching videos remounts rather than reuses.
          key={video.youtubeId}
          src={embedUrl(video.youtubeId)}
          title={video.title}
          // FR-V1.7 — the injected iframe carries its own title.
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          loading="eager"
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <>
          <Image
            src={poster.url}
            alt={poster.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority={priority}
            onError={() => setPosterFailed(true)}
            // YouTube's hqdefault is 4:3; cropping to 16:9 beats letterboxing.
            className="object-cover"
          />

          {/*
            One button covering the whole poster: FR-V1.7 wants this reachable
            and activatable by keyboard, and a 56px target floating over a
            separately-clickable image gives a keyboard user two stops for one
            action. The visible circle is drawn inside it.
          */}
          <button
            type="button"
            onClick={play}
            aria-label={`Play video: ${video.title}`}
            className={cn(
              "group absolute inset-0 flex cursor-pointer items-center justify-center",
              "focus-visible:ring-2 focus-visible:ring-canvas focus-visible:outline-none focus-visible:ring-inset",
            )}
          >
            {/*
              §5 — a 56px accent circle with a white triangle. Never YouTube's
              red button: it reads as a third-party widget dropped onto the page
              rather than as part of the site, and it fights the sage palette.
            */}
            <span
              aria-hidden="true"
              className={cn(
                "flex size-14 items-center justify-center rounded-full bg-accent transition-transform duration-200",
                "motion-safe:group-hover:scale-105 motion-safe:group-focus-visible:scale-105",
              )}
            >
              <svg
                viewBox="0 0 24 24"
                className="ml-0.5 size-6 fill-white"
                focusable="false"
              >
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </span>
          </button>

          {children}

          {video.isStandIn ? (
            <p
              className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-canvas/90 px-3 py-1 text-caption text-ink-secondary"
              title={
                video.attribution
                  ? `Video by ${video.attribution} on YouTube`
                  : undefined
              }
            >
              {/*
                "Placeholder" covers the whole card deliberately: the poster is
                a stand-in photograph rather than a frame from the video, and
                the video itself belongs to the channel named after it. Saying
                "Placeholder video" alone would leave the substituted image
                unaccounted for.
              */}
              Placeholder
              {video.attribution ? ` — video by ${video.attribution}` : ""}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

/**
 * FR-V1.8 — the removed-or-private case.
 *
 * A client managing their own channel will delete or privatise a video sooner
 * or later, and the embed for a missing video is a black box reading "Video
 * unavailable" in YouTube's own styling. This renders instead of the facade
 * when the ID is not a well-formed one; the runtime case, where a valid ID
 * points at something withdrawn, is caught by the same component because a
 * withdrawn video has no thumbnail and the poster fails to load.
 */
export function VideoUnavailable({
  title,
  youtubeId,
  className,
}: {
  title: string;
  youtubeId?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex aspect-video flex-col items-center justify-center gap-3 rounded-card border border-hairline bg-status-sold-bg px-6 text-center",
        className,
      )}
    >
      <p className="text-body text-ink-secondary">This video is unavailable.</p>
      <p className="max-w-[42ch] text-caption text-ink-muted">
        {title} has been removed or made private by its owner. Everything else
        on this page is unaffected.
      </p>
      {youtubeId ? (
        <a
          href={watchUrl(youtubeId)}
          rel="noreferrer noopener"
          target="_blank"
          className="text-caption text-accent underline underline-offset-4 hover:text-accent-hover"
        >
          Try it on YouTube
        </a>
      ) : null}
    </div>
  );
}
