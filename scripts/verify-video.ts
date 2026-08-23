/**
 * Guards the video feature's non-negotiables.
 *
 * 06_FEATURE_VIDEO_TOURS.md §2 calls the facade "not an optimisation to revisit
 * later". The trouble with a rule like that is that it is invisible in review —
 * an `<iframe>` added to a card looks perfectly ordinary in a diff, and nothing
 * fails until someone runs Lighthouse on a phone months later.
 *
 * So the rules are asserted here instead of trusted:
 *
 *   - no iframe is rendered anywhere except inside the facade
 *   - the embed host is youtube-nocookie.com
 *   - nothing autoplays except in response to a click
 *   - the play control is never YouTube red
 *   - every seeded ID is a well-formed YouTube ID
 *
 *   pnpm verify:video
 *
 * Needs no database — it reads the source and the bundled snapshot.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { embedUrl, isValidYoutubeId, posterUrl } from "../src/lib/video";
import snapshot from "../src/data/snapshot.json";

const failures: string[] = [];

function check(label: string, condition: boolean, detail = "") {
  console.log(`${condition ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!condition) failures.push(label);
}

/** Every .tsx under src, so a new component cannot quietly opt out. */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return path.endsWith(".tsx") ? [path] : [];
  });
}

const FACADE = "src/components/video/video-facade.tsx";

function main() {
  const files = sourceFiles("src");

  // --- The facade is the only place an iframe may be constructed ------------
  const withIframe = files.filter((file) =>
    /<iframe[\s>]/.test(readFileSync(file, "utf8")),
  );
  check(
    "only the facade renders an iframe",
    withIframe.length === 1 && withIframe[0] === FACADE,
    withIframe.join(", ") || "none",
  );

  // --- Host and parameters --------------------------------------------------
  const embed = embedUrl("dQw4w9WgXcQ");
  check(
    "embeds use youtube-nocookie.com",
    new URL(embed).hostname === "www.youtube-nocookie.com",
    new URL(embed).hostname,
  );
  check(
    "embeds are built, never pasted",
    !/youtube\.com\/embed/.test(readFileSync(FACADE, "utf8")),
  );

  // Autoplay is legitimate here *because the click is the play instruction*,
  // but it must live in the embed URL the click builds and nowhere else.
  const facadeSource = readFileSync(FACADE, "utf8");
  check(
    "autoplay is not hardcoded into the facade markup",
    !/autoplay/i.test(facadeSource),
  );

  // --- The play control is never YouTube red --------------------------------
  const videoComponents = files.filter((file) =>
    file.startsWith(join("src", "components", "video")),
  );
  const reds = videoComponents.filter((file) =>
    /(#f{0,1}00|#ff0000|red-[456]00|bg-red|fill-red|rgb\(255, ?0, ?0\))/i.test(
      readFileSync(file, "utf8"),
    ),
  );
  check("no YouTube red anywhere in the video components", reds.length === 0, reds.join(", "));
  check(
    "the play control uses the accent fill",
    /bg-accent/.test(facadeSource) && /size-14/.test(facadeSource),
  );

  // --- Poster fallback ------------------------------------------------------
  // §5 asks for maxresdefault; hqdefault is used instead because maxres does
  // not exist for videos uploaded below 720p and returns a grey placeholder
  // rather than a 404, which no error handler can catch.
  check(
    "poster fallback uses hqdefault, which exists for every video",
    posterUrl("dQw4w9WgXcQ").endsWith("/hqdefault.jpg"),
    posterUrl("dQw4w9WgXcQ"),
  );

  // --- Seeded data ----------------------------------------------------------
  const videos = (snapshot as { videos: { slug: string; youtubeId: string }[] })
    .videos;
  const malformed = videos.filter((video) => !isValidYoutubeId(video.youtubeId));
  check(
    "every seeded video carries a well-formed YouTube ID",
    malformed.length === 0,
    malformed.map((video) => `${video.slug}=${video.youtubeId}`).join(", ") ||
      `${videos.length} checked`,
  );

  const noUrls = videos.filter((video) => /https?:|youtu/.test(video.youtubeId));
  check(
    "IDs are stored bare, never as pasted URLs",
    noUrls.length === 0,
    noUrls.map((video) => video.slug).join(", ") || "none",
  );

  // FR-V1.3 — the homepage section needs two before it renders at all.
  const featured = (
    snapshot as { videos: { featured: boolean }[] }
  ).videos.filter((video) => video.featured).length;
  check(
    "at least two featured videos, or the homepage section is hidden by design",
    featured === 0 || featured >= 2,
    `${featured} featured`,
  );

  // §3 — exactly one parent, enforced in the database and relied on by the card.
  const orphans = (
    snapshot as {
      videos: { slug: string; listing: unknown; estate: unknown }[];
    }
  ).videos.filter((video) => Boolean(video.listing) === Boolean(video.estate));
  check(
    "every video has exactly one parent",
    orphans.length === 0,
    orphans.map((video) => video.slug).join(", ") || "none",
  );

  console.log();
  if (failures.length > 0) {
    console.log(`${failures.length} video check(s) failed: ${failures.join(", ")}`);
    process.exit(1);
  }
  console.log("All video checks passed.");
}

main();
