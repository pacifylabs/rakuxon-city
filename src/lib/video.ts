import { VideoKind } from "@/generated/prisma/enums";

/**
 * Everything about a YouTube ID that is not a database concern.
 *
 * 06_FEATURE_VIDEO_TOURS.md §3 stores the bare eleven-character ID and never a
 * pasted URL, so every URL the site needs is built here from that ID. That is
 * what makes the privacy host and the no-autoplay rule structural rather than
 * something each call site has to remember.
 */

/** YouTube IDs are exactly eleven characters from a URL-safe alphabet. */
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export function isValidYoutubeId(id: string): boolean {
  return YOUTUBE_ID.test(id);
}

/**
 * The embed URL, built only at the moment a visitor presses play.
 *
 * `youtube-nocookie.com` per §2. No `autoplay=1` in the initial construction —
 * the parameter below starts playback *because the visitor just asked for it*,
 * which is a different thing from a page that plays at you on load.
 */
export function embedUrl(youtubeId: string): string {
  const params = new URLSearchParams({
    // The click that mounted this iframe is the play instruction; without it
    // the visitor has to press play a second time on YouTube's own control.
    autoplay: "1",
    // Keep YouTube's suggested-video wall from taking over at the end.
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });

  return `https://www.youtube-nocookie.com/embed/${youtubeId}?${params}`;
}

/** Where a visitor goes if the embed will not play for them. */
export function watchUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

/**
 * Poster fallback when no custom poster is set.
 *
 * §5 asks for `maxresdefault`, but YouTube only generates that for videos
 * uploaded above 720p — for everything else the URL returns a 120x90 grey
 * placeholder rather than a 404, so it cannot be detected by an error handler
 * and would render as a grey smear inside a 16:9 frame.
 *
 * `hqdefault` exists for every video ever uploaded. It is 480x360 and 4:3, so
 * it is cropped to 16:9 by the facade's object-fit rather than letterboxed.
 * This is the one place the addendum is departed from, and the reason is that
 * its instruction produces a broken poster on a real subset of videos.
 */
export function posterUrl(youtubeId: string): string {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

/** §5 — the kind badge, in the site's words rather than the enum's. */
export const videoKindLabels: Record<VideoKind, string> = {
  DRONE_TOUR: "Drone tour",
  WALKTHROUGH: "Walkthrough",
  ESTATE_OVERVIEW: "Estate overview",
  PROGRESS_UPDATE: "Progress update",
  TESTIMONIAL: "Owner's account",
};

/** Filter options for the /tours hub, in the order a buyer meets them. */
export const videoKindOrder: VideoKind[] = [
  VideoKind.DRONE_TOUR,
  VideoKind.WALKTHROUGH,
  VideoKind.ESTATE_OVERVIEW,
  VideoKind.PROGRESS_UPDATE,
  VideoKind.TESTIMONIAL,
];

/** `3661` → `1:01:01`, `95` → `1:35`. Display only. */
export function formatDuration(seconds: number | null): string | null {
  if (seconds === null || seconds <= 0) return null;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;

  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(rest)}`
    : `${minutes}:${pad(rest)}`;
}
