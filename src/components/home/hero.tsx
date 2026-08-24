"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";

/**
 * 01_SITE_ARCHITECTURE.md §5.1 — a plain statement of what the company does,
 * with a single entry that lets a visitor pick Land or Homes without first
 * committing to a lane.
 *
 * The hero now cycles through the estates rather than holding one image. Each
 * slide is a real estate record — photograph, name, location, live listing
 * count — so it stays true as stock moves, and is editable in Phase 7 through
 * the estate the admin already manages rather than a separate slide table.
 *
 * PERFORMANCE — read before changing anything here.
 *
 * TODO §1.16 records that this page already misses PRD §6's 2.5s LCP on a
 * mid-range Android over 3G, and the hero photograph is why. Three slides could
 * easily have tripled that. Two rules keep the cost flat:
 *
 *   1. ONLY THE FIRST SLIDE IS EAGER. It loads eagerly at high fetch
 *      priority and is the LCP element. Slides 2+ are lazy and are not fetched
 *      until the browser has spare time, so measured LCP is what a single
 *      image costs.
 *   2. THE MOTION IS FREE. The drift behind the content is a CSS transform on
 *      bytes already downloaded — no video, no extra requests. That was the
 *      explicit alternative to a background video, which would have run to
 *      2–5MB and been unusable on the device this site is built for.
 *
 * Anything that makes slide 2 eager, or swaps the CSS drift for real footage,
 * gives back both. Measure with three Lighthouse runs before and after — this
 * page swings ±10 points between identical runs, so one number proves nothing.
 */
const categories = ["Residential land", "Commercial plots", "Completed homes"];

const SLIDE_MS = 7000;

export type HeroSlide = {
  slug: string;
  name: string;
  location: string;
  state: string;
  listingCount: number;
  image: { url: string; alt: string } | null;
};

export function Hero({
  counts,
  slides,
}: {
  counts: { land: number; homes: number };
  slides: HeroSlide[];
}) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);

  const count = slides.length;

  /** Never starts under reduced motion, and responds if that changes mid-visit. */
  useEffect(() => {
    if (count < 2) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setPlaying(!query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [count]);

  useEffect(() => {
    if (!playing || count < 2) return;
    const timer = window.setInterval(() => {
      // Advancing a hero nobody is looking at wastes battery on a phone.
      if (document.hidden) return;
      setActive((current) => (current + 1) % count);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [playing, count]);

  const go = useCallback((index: number) => {
    setActive(index);
    setPlaying(false);
  }, []);

  const current = slides[active];

  return (
    <Container as="section" className="pt-2 pb-16 lg:pb-24">
      <div
        className="relative isolate flex min-h-[30rem] overflow-hidden rounded-image-l bg-deep lg:min-h-[34rem]"
        onMouseEnter={() => setPlaying(false)}
        onMouseLeave={() => count > 1 && setPlaying(true)}
        onFocusCapture={() => setPlaying(false)}
      >
        {/* The photograph runs the full width of the panel, behind everything. */}
        {slides.map((slide, index) =>
          slide.image ? (
            <div
              key={slide.slug}
              aria-hidden={index !== active}
              className={cn(
                "absolute inset-0 overflow-hidden transition-opacity duration-1000 ease-out",
                index === active ? "opacity-100" : "opacity-0",
              )}
            >
              <Image
                src={slide.image.url}
                alt={slide.image.alt}
                fill
                sizes="(min-width: 1280px) 1200px, 100vw"
                quality={72}
                /*
                 * Rule 1 above — only slide 0 loads up front. `priority` is
                 * deprecated in Next 16; the docs point at `loading="eager"`
                 * plus `fetchPriority` for the LCP element instead.
                 */
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                className={cn(
                  "object-cover",
                  // Rule 2 — a transform on bytes already fetched.
                  index === active && "motion-safe:animate-hero-drift",
                )}
              />
            </div>
          ) : null,
        )}

        {/*
          THE SCRIM IS LOAD-BEARING. Read this before changing a number.

          Body text over a photograph only stays legible because of what sits
          between them, and an admin can swap the photograph in Phase 7 for one
          with a blown-out sky exactly where the paragraph is. So the veil is
          set for that worst case, not for the images currently seeded.

          Navy is a lighter ground than the near-black this started on — 0.0197
          against 0.0061 — so it needs MORE opacity, not less. Over pure white:

              70% -> 5.20  passes AA for body text
              65% -> 4.43  fails

          Uniform 70% everywhere would clear that, but it also buries the
          photograph, which is the whole point of a full-bleed hero. So the veil
          is asymmetric on wide screens: near-solid under the copy on the left,
          almost clear on the right where nothing but the estate label sits.

          The copy occupies 7 of 12 columns, ending at 58.3%. The stops below
          hold alpha at 0.89 or higher across all of it — comfortably past the
          0.70 floor — and fall to 0.10 at the right edge.

          Below `lg` the copy spans the full width, so there is no clear side to
          protect and it reverts to the uniform 70%.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-deep/70 lg:hidden"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden lg:block lg:bg-gradient-to-r lg:from-deep lg:from-40% lg:via-deep/85 lg:via-65% lg:to-deep/10"
        />

        <div className="relative z-10 grid w-full grid-cols-1 gap-10 px-6 py-14 sm:px-10 lg:grid-cols-12 lg:gap-6 lg:px-14 lg:py-20">
          <div className="flex flex-col justify-between gap-10 lg:col-span-7">
            <div>
              <h1 className="max-w-[18ch] text-display-xl text-canvas">
                Land and homes, with the papers in order
              </h1>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-1 text-caption text-canvas/80">
                {categories.map((category) => (
                  <li key={category} className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-1 rounded-full bg-accent-fill"
                    />
                    {category}
                  </li>
                ))}
              </ul>

              <p className="mt-8 max-w-[46ch] text-body-l text-canvas/90">
                Rakuxon City sells serviced plots and finished houses across
                Lagos, Ogun and the FCT. Every listing shows its title type and
                its documentation before it shows you a price.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <ButtonLink href="/land">Explore properties</ButtonLink>
              </div>

              {/* The inline lane picker from §5.1 — choose a track without
                  leaving the hero, with live counts so the choice is informed. */}
              <div className="flex max-w-sm divide-x divide-canvas/20 overflow-hidden rounded-full border border-canvas/25">
                <LanePick href="/land" label="Land" count={counts.land} />
                <LanePick href="/homes" label="Homes" count={counts.homes} />
              </div>
            </div>
          </div>

          {/*
            The estate label sits on the clear side of the scrim, where alpha
            is around 0.10 — so it carries its own backing rather than relying
            on the veil. At 80% navy over a worst-case white photo that is
            7.25:1, well clear of AA, and it reads as a label pinned to the
            photograph rather than text floating on it.
          */}
          {current ? (
            <div className="flex lg:col-span-4 lg:col-start-9 lg:items-end lg:justify-end">
              <div
                aria-live="polite"
                className="w-full rounded-card border border-canvas/15 bg-deep/80 p-5 backdrop-blur-sm lg:p-6"
              >
                <p className="text-caption text-canvas/70">Now selling</p>
                <Link
                  href={`/estates/${current.slug}`}
                  className="mt-2 inline-block text-display-m text-canvas underline-offset-8 transition-colors hover:text-accent-fill hover:underline focus-visible:ring-2 focus-visible:ring-canvas focus-visible:outline-none"
                >
                  {current.name}
                </Link>
                <p className="mt-2 text-caption text-canvas/80">
                  {current.location}, {current.state} ·{" "}
                  <span className="tabular text-accent-fill">
                    {current.listingCount}
                  </span>{" "}
                  {current.listingCount === 1 ? "listing" : "listings"}
                </p>

                {count > 1 ? (
                  <div className="mt-5 flex items-center gap-3">
                    {slides.map((slide, index) => (
                      <button
                        key={slide.slug}
                        type="button"
                        onClick={() => go(index)}
                        aria-label={`Show ${slide.name}`}
                        aria-current={index === active ? "true" : undefined}
                        className={cn(
                          "h-1 cursor-pointer rounded-full transition-all duration-300",
                          "focus-visible:ring-2 focus-visible:ring-canvas focus-visible:ring-offset-2 focus-visible:ring-offset-deep focus-visible:outline-none",
                          index === active
                            ? "w-10 bg-accent-fill"
                            : "w-5 bg-canvas/40 hover:bg-canvas/70",
                        )}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Container>
  );
}

function LanePick({
  href,
  label,
  count,
}: {
  href: string;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className="flex-1 px-5 py-3 text-center text-body text-canvas transition-colors hover:bg-canvas/10 focus-visible:ring-2 focus-visible:ring-canvas focus-visible:outline-none focus-visible:ring-inset"
    >
      {label}
      <span className="tabular ml-2 text-caption text-accent-fill">
        {count}
      </span>
    </Link>
  );
}
