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
 * The photograph is the section, edge to edge. There is no panel and no solid
 * fill behind it.
 *
 * DEVIATION from §5.1: the category eyebrow list (Residential land ·
 * Commercial plots · Completed homes) has been removed at the client's
 * instruction. It duplicated what the lane picker below it already says, and
 * the hero was carrying six competing elements. The picker stayed because it
 * is the more useful of the two — it carries live counts and it navigates.
 *
 * The estate caption card went with it, for the same reason: a second focal
 * point on the opposite side of the headline. The slides still rotate, as
 * ambient imagery rather than as a labelled carousel.
 *
 * PERFORMANCE — read before changing anything here.
 *
 * TODO §1.16 records that this page already misses PRD §6's 2.5s LCP on a
 * mid-range Android over 3G, and the hero photograph is why. Two rules keep
 * three slides costing what one costs:
 *
 *   1. ONLY THE FIRST SLIDE IS EAGER. It loads eagerly at high fetch priority
 *      and is the LCP element. Slides 2+ are lazy.
 *   2. THE MOTION IS FREE. The drift is a CSS transform on bytes already
 *      downloaded — no video, no extra requests.
 */
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

  return (
    <section
      // Full viewport width: this is the section's ground, not a card on it.
      className="relative isolate mb-16 flex min-h-[32rem] items-center overflow-hidden lg:mb-24 lg:min-h-[38rem]"
      onMouseEnter={() => setPlaying(false)}
      onMouseLeave={() => count > 1 && setPlaying(true)}
      onFocusCapture={() => setPlaying(false)}
    >
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
              alt={index === active ? slide.image.alt : ""}
              fill
              sizes="100vw"
              quality={72}
              // Rule 1 above. Only slide 0 is eager.
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
        THE SCRIM IS LOAD-BEARING, and it is not a background colour — the
        solid fill is gone. This is the only thing keeping text legible over a
        photograph an admin can swap in Phase 7 for one with a blown-out sky.

        Body text over `deep` needs 70% opacity to clear AA against a
        worst-case white photo; at 60% it is 4.41 and fails. The stops below
        hold alpha at 0.87 or higher across the half the copy occupies, and
        reach fully transparent at the right edge, so the photograph is
        completely unobscured there.

        Below `lg` the copy spans the full width, so there is no clear side to
        protect and it falls back to a uniform 70%.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-deep/70 lg:hidden"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden lg:block lg:bg-gradient-to-r lg:from-deep lg:from-30% lg:via-deep/80 lg:via-60% lg:to-transparent"
      />

      <Container className="relative z-10 py-20 lg:py-28">
        <div className="max-w-[34rem]">
          <h1 className="text-display-xl text-canvas">
            Land and homes, with the papers in order
          </h1>

          <p className="mt-8 max-w-[42ch] text-body-l text-canvas/90">
            Serviced plots and finished houses across Lagos, Ogun and the FCT.
            Every listing shows its title before it shows you a price.
          </p>

          <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center">
            <ButtonLink href="/land">Explore properties</ButtonLink>

            {/* §5.1's lane picker — choose a track without leaving the hero,
                with live counts so the choice is informed. */}
            <div className="flex divide-x divide-canvas/20 overflow-hidden rounded-full border border-canvas/25">
              <LanePick href="/land" label="Land" count={counts.land} />
              <LanePick href="/homes" label="Homes" count={counts.homes} />
            </div>
          </div>

          {count > 1 ? (
            <div className="mt-12 flex items-center gap-3">
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
      </Container>
    </section>
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
      className="flex-1 px-6 py-3 text-center text-body text-canvas transition-colors hover:bg-canvas/10 focus-visible:ring-2 focus-visible:ring-canvas focus-visible:outline-none focus-visible:ring-inset"
    >
      {label}
      <span className="tabular ml-2 text-caption text-accent-fill">
        {count}
      </span>
    </Link>
  );
}
