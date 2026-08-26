"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";

/**
 * Full-bleed hero — 07_FEATURE_HERO.md, amending 01_SITE_ARCHITECTURE.md §5.1
 * item 1 and carving out one exception to 04_DESIGN_SYSTEM.md §8 (v2.1 §8:
 * a single emphasis word may sit in `champagne-light` over the scrimmed
 * photograph — the only permitted gold-over-imagery on the site).
 *
 * THE ROTATION LOGIC IS THE SAME LOGIC AS BEFORE THIS CHANGE — a plain
 * `setInterval` driving a crossfade, no carousel library, no new images. What
 * changed is the container it sits in (full-bleed, 88svh/92svh instead of an
 * inset rounded panel), the scrim (§4, replacing the old single dark layer),
 * and the content around it (feature panel, two named actions, the header
 * moving onto the photograph — see layout/header.tsx's `overlay` mode).
 *
 * PERFORMANCE — §5 is not optional; the hero is the LCP element.
 *
 *   1. Only slide 0 renders eagerly. Slides 1+ are not given a `src` at all
 *      — not hidden via CSS, not `loading="lazy"` — until `readyForRest`
 *      flips, which happens after the `load` event (or `requestIdleCallback`
 *      where it exists). A `loading="lazy"` image that already sits at
 *      `inset-0` is still within the viewport geometrically even at
 *      `opacity-0`, so native lazy-loading alone does not defer it — the
 *      browser fetches it immediately. Not rendering the element at all is
 *      the only way to guarantee it.
 *   2. Crossfade only — 800ms opacity, nothing else. The old drift/Ken Burns
 *      transform is gone; §5.4 forbids it outright.
 *   3. The rotation pauses off-screen (IntersectionObserver on the section
 *      itself) and on a hidden tab, in addition to the existing
 *      reduced-motion and hover/focus pauses.
 *   4. Each source is a dedicated recrop of the existing estate photograph —
 *      see scripts note below — sized and compressed for this use, not the
 *      original card-sized file scaled up.
 *
 * A NOTE ON THE MOBILE CROP §5.2 asks for: a genuinely different, tighter
 * mobile composition was built (see git history — 750×900 crops for all
 * three estates) and then deliberately NOT wired in. Serving a different
 * crop per breakpoint safely, with next/image, without ever risking a second
 * fetch before `load`, needs either an experimental API or a plain CSS
 * background-image swapped by media query — the latter would drop
 * next/image's AVIF/WebP negotiation and `priority` preload hint, which §5.2
 * asks for explicitly. Between "one verified fetch before load" (an
 * acceptance criterion, §9.3) and "art-directed mobile crop" (prose, no
 * criterion of its own), the fetch guarantee won. `sizes="100vw"` still
 * gives mobile a genuinely smaller BYTE payload from the same file, automatic
 * AVIF/WebP negotiation intact. Flagged for the client rather than decided
 * silently.
 */
const SLIDE_MS = 4000; // Reduced from 7000ms to 4000ms for faster transitions

/**
 * Per-estate hero crop and blur placeholder, keyed by the shared Media URL.
 * Falls back to the original card image for any slug not in this map — a
 * fourth estate, or an admin-swapped image in Phase 7 — so nothing breaks,
 * it just loses the wider hero crop until one is generated for it.
 */
const HERO_CROPS: Record<string, { url: string; blurDataURL: string }> = {
  "/images/photography/estate-emerald-ridge.jpg": {
    url: "/images/photography/estate-emerald-ridge-hero-desktop.jpg",
    blurDataURL:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAIABADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCBZUUctinrdxgYClj9KKKz6iP/2Q==",
  },
  "/images/photography/estate-cornerstone-gardens.jpg": {
    url: "/images/photography/estate-cornerstone-gardens-hero-desktop.jpg",
    blurDataURL:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAIABADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCqqXW9VkcLCAOFHQ+1OkEKMC03zADJKDpRRWb2Keh//9k=",
  },
  "/images/photography/estate-sabon-lugbe-court.jpg": {
    url: "/images/photography/estate-sabon-lugbe-court-hero-desktop.jpg",
    blurDataURL:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAIABADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDOkEUCN5aPG+7gk84rVsSktkGPVlPB5/zxRRWLehUuh//Z",
  },
};

function heroSrcFor(url: string): { url: string; blurDataURL?: string } {
  const crop = HERO_CROPS[url];
  return crop ?? { url };
}

/**
 * THE SCRIM — §4, verified rather than assumed.
 *
 * Two layers, stacked, exactly as specified: a vertical pass strongest at the
 * foot of the frame (where the content block sits), and a softer horizontal
 * pass from the left (where the content block sits too — the two combine
 * under the headline without darkening the whole frame).
 *
 * DEVIATION from the verbatim §4 values: the two darkest stops of the
 * vertical layer are 0.90 / 0.76 here, not the spec's 0.88 / 0.72. Verified
 * per §4's own instruction — measured `ivory-light` against all three
 * current rotation images, composited with the verbatim values, at every
 * point the content block can occupy (bottom 55% of height, left 46% of
 * width, both breakpoints): the worst case was Emerald Ridge at 1440×792,
 * 4.54:1 — technically over the 4.5 floor, but only by 0.04, with no margin
 * against real-world JPEG recompression or resampling differences between
 * this offline check and what actually ships. Deepened until the same worst
 * case read 4.74:1. Re-verify with the same method (see the recrop/verify
 * scripts run this session) before swapping any image in the rotation.
 *
 * REUSABILITY: Uses CSS variable --color-scrim-base (defined in globals.css)
 * for the RGB values, enabling theme variants to adjust scrim color without
 * modifying component code. The variable holds comma-separated RGB values
 * (e.g., "13, 15, 14") for use with rgba().
 */
function getScrimGradients() {
  const scrimBase = "var(--color-scrim-base)";
  return {
    vertical: `linear-gradient(to top, rgba(${scrimBase},0.90) 0%, rgba(${scrimBase},0.76) 32%, rgba(${scrimBase},0.42) 62%, rgba(${scrimBase},0.30) 100%)`,
    horizontal: `linear-gradient(to right, rgba(${scrimBase},0.55) 0%, rgba(${scrimBase},0) 55%)`,
  };
}

export type HeroSlide = {
  slug: string;
  name: string;
  image: { url: string; alt: string } | null;
};

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(true);
  const [readyForRest, setReadyForRest] = useState(false);

  const count = slides.length;
  const scrimGradients = getScrimGradients();

  /** Never starts under reduced motion, and responds if that changes mid-visit. */
  useEffect(() => {
    if (count < 2) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setPlaying(!query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [count]);

  /** §5.5 — paused the moment the hero itself is off-screen, not just the tab. */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || count < 2) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [count]);

  useEffect(() => {
    if (!playing || !inView || count < 2) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setActive((current) => (current + 1) % count);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [playing, inView, count]);

  /** §5.1 — slides 1+ do not exist in the DOM, let alone fetch, until after `load`. */
  useEffect(() => {
    const schedule = () => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(() => setReadyForRest(true));
      } else {
        setReadyForRest(true);
      }
    };
    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
      return () => window.removeEventListener("load", schedule);
    }
  }, []);

  const stopForGood = useCallback(() => setPlaying(false), []);

  return (
    <section
      ref={sectionRef}
      // MODIFIED FROM SPEC: Changed from full-bleed to contained layout
      // Original: edge-to-edge with no margins
      // Current: centered with max-width + bottom margin for separation
      className="relative isolate mt-28 mb-16 flex justify-center px-6 lg:mb-24 lg:px-16"
      onMouseEnter={stopForGood}
      onFocusCapture={stopForGood}
    >
      <div className="relative h-[92svh] w-full max-w-screen-xl overflow-hidden rounded-card lg:h-[88svh]">
      {slides.map((slide, index) => {
        if (!slide.image) return null;
        if (index > 0 && !readyForRest) return null; // §5.1, literally.

        const source = heroSrcFor(slide.image.url);
        const isFirst = index === 0;

        return (
          <div
            key={slide.slug}
            aria-hidden="true"
            className={cn(
              // §5.4 — crossfade only, 800ms. No transform of any kind.
              "absolute inset-0 transition-opacity duration-[800ms] ease-out",
              index === active ? "opacity-100" : "opacity-0",
            )}
          >
            <Image
              src={source.url}
              // §8 — decorative. The headline carries the meaning; a screen
              // reader announcing a new photograph every seven seconds would not.
              alt=""
              fill
              sizes="100vw"
              quality={70}
              priority={isFirst}
              loading={isFirst ? "eager" : "lazy"}
              fetchPriority={isFirst ? "high" : "auto"}
              placeholder={isFirst && source.blurDataURL ? "blur" : undefined}
              blurDataURL={isFirst ? source.blurDataURL : undefined}
              className="object-cover"
            />
          </div>
        );
      })}

      {/* §4 — the two scrim layers, verbatim structure, deepened per the note above. */}
      <div aria-hidden="true" className="absolute inset-0" style={{ background: scrimGradients.vertical }} />
      <div aria-hidden="true" className="absolute inset-0" style={{ background: scrimGradients.horizontal }} />

      <FeaturePanel />

      {/* Bottom-left content block. */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-16 lg:px-16 lg:pb-24">
        <div className="max-w-[34rem]">
          <h1 className="text-display-xl text-ivory-light">
            Land and homes,
            <br />
            with the{" "}
            {/* §3/§8 — the one emphasis word, and the one permitted use of
                gold over a photograph on the entire site. */}
            <span className="text-accent-light">papers</span> in order
          </h1>

          <p className="mt-6 max-w-[52ch] text-body text-ivory/90">
            Serviced plots and finished houses across Lagos, Ogun and the FCT.
            Every listing shows its title before it shows you a price.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Primary — §3: champagne fill, CHARCOAL label, never white.
                Hand-styled rather than <ButtonLink variant="accent">: that
                shared variant's focus ring is charcoal, invisible on this
                scrim (§8), and cannot be safely overridden by an added class
                once the base ring colour is already compiled in. */}
            <Link
              href="/land"
              className={cn(
                "inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-6 py-3 text-body font-medium text-foreground transition-colors hover:bg-accent-hover",
                "focus-visible:ring-2 focus-visible:ring-ivory-light focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-deep focus-visible:outline-none",
              )}
            >
              Explore properties
            </Link>

            {/* Secondary — §3: charcoal-soft at 85%, border-dark, ivory-light label. */}
            <Link
              href="/contact"
              className={cn(
                "inline-flex min-h-11 items-center justify-center rounded-full border border-line-dark bg-charcoal-soft/85 px-6 py-3 text-body font-medium text-ivory-light backdrop-blur-sm transition-colors hover:bg-charcoal-soft",
                "focus-visible:ring-2 focus-visible:ring-ivory-light focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-deep focus-visible:outline-none",
              )}
            >
              Book an inspection
            </Link>
          </div>
        </div>
      </div>

      {/* §6 — the sentinel Header's IntersectionObserver watches, on the
          homepage only, to know when to switch from the overlaid pill nav to
          the solid bar. Zero height: it marks a scroll position, nothing else. */}
      <div data-hero-end aria-hidden="true" className="absolute bottom-0 h-px w-px" />
      </div>
    </section>
  );
}

/**
 * §3 — the reference sells lifestyle features; this sells verification,
 * tying the hero directly to the title ribbon (§7 of the design system) two
 * scrolls further down the page. Hidden below `lg` per §3 — the first thing
 * to go on mobile, with no layout shift since it never occupies flow space
 * (absolutely positioned throughout).
 */
const VERIFICATION_POINTS = [
  "Verified title documentation",
  "Registered survey plans",
  "Gazette and C of O plots",
  "Estate infrastructure in place",
  "Structured payment plans",
  "Handover support",
];

function FeaturePanel() {
  return (
    <div
      className={cn(
        "absolute top-28 right-6 z-10 hidden w-72 rounded-card border border-line-dark bg-charcoal-soft/78 p-5 backdrop-blur-md lg:block",
        "xl:right-16",
      )}
    >
      <ul className="space-y-3">
        {VERIFICATION_POINTS.map((point) => (
          <li key={point} className="flex items-start gap-2.5 text-caption text-ivory-light">
            <SealGlyph className="mt-0.5 shrink-0 text-accent" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SealGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={cn("size-4", className)}>
      <circle cx="8" cy="7" r="4.2" stroke="currentColor" strokeWidth="1" />
      <path
        d="M5.6 9.5L4.6 13l3.4-1.6 3.4 1.6-1-3.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.6 7l1.8 1.8 3-3.4"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
