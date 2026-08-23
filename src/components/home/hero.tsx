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
 *   1. ONLY THE FIRST SLIDE IS EAGER. It carries `priority` and is the LCP
 *      element. Slides 2+ are lazy and are not fetched until the browser has
 *      spare time, so measured LCP is what a single image costs.
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
        className="relative isolate grid overflow-hidden rounded-image-l bg-deep lg:grid-cols-12"
        onMouseEnter={() => setPlaying(false)}
        onMouseLeave={() => count > 1 && setPlaying(true)}
        onFocusCapture={() => setPlaying(false)}
      >
        {/*
          Text on solid navy, photograph in its own column.
          
          The first version laid the copy over the image behind a scrim, and
          that could not be made to work once the ground became navy: navy's
          luminance is 0.0197 against the old near-black's 0.0061, so the scrim
          needed 70% to keep body text at AA over a worst-case bright photo —
          and at 70% navy the photograph was no longer visible at all.
          
          Splitting them gives both, and stops the contrast depending on which
          image an admin uploads: text sits at 13.58 on solid navy, and the
          photograph shows at full strength.
        */}
        <div className="relative z-10 flex flex-col justify-between gap-10 px-6 py-14 sm:px-10 lg:col-span-7 lg:px-14 lg:py-20">
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

        <div className="relative min-h-[18rem] lg:col-span-5 lg:min-h-0">
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
                  /*
                   * Wider than the column measures, deliberately. The column is
                   * portrait (~533x764) and every estate photograph is
                   * landscape 1000x625, so `object-cover` scales to match the
                   * HEIGHT and crops the sides — it needs roughly 1.2x the
                   * column's width in source pixels, not 1x. Declaring the
                   * measured width made the browser pick a 640 candidate and
                   * upscale it.
                   */
                  sizes="(min-width: 1280px) 700px, (min-width: 1024px) 55vw, 100vw"
                  quality={72}
                  // Rule 1 above. Only slide 0 is eager.
                  priority={index === 0}
                  loading={index === 0 ? undefined : "lazy"}
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
            A short scrim at the foot only, behind the estate caption. Nothing
            else sits on the photograph, so the rest of it stays untouched.
          */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-deep via-deep/80 to-transparent"
          />

          {current ? (
            <div
              aria-live="polite"
              className="absolute inset-x-0 bottom-0 p-6 lg:p-8"
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
