"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowGlyph, ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Estate = {
  slug: string;
  name: string;
  location: string;
  state: string;
  description: string;
  listingCount: number;
  image: {
    url: string;
    alt: string;
    width: number;
    height: number;
    isStandIn: boolean;
    attribution: string | null;
  } | null;
};

/**
 * The featured estate block from the reference: a large 16:9 frame carrying the
 * estate label, and a smaller secondary estate beside it.
 *
 * Both frames now advance together through the estates, at the client's
 * request, so the pair reads as one moving unit rather than two fixed cards.
 * The lead shows estate N and the smaller frame shows N+1, which means no slide
 * ever repeats the same photograph on both sides.
 *
 * Every field on screen — name, location, description, listing count — comes
 * from the estate record itself, so a slide cannot go stale as stock moves and
 * Phase 7 needs no separate slide table to administer.
 *
 * PERFORMANCE: none of these images is eager. They sit below the fold and the
 * hero's first slide is the LCP element; preloading anything here competes with
 * it for bandwidth on exactly the 3G connection PRD §6 targets. See TODO §1.16.
 *
 * The floating callout overlapping this imagery is the first of exactly two
 * lifted elements on the page (04_DESIGN_SYSTEM.md §5). The second is the FAQ
 * panel. Everything else is flat with a hairline.
 */
const SLIDE_MS = 7000;
export function FeaturedEstate({ estates }: { estates: Estate[] }) {
  const count = estates.length;
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);

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
      // Advancing something nobody is looking at wastes battery on a phone.
      if (document.hidden) return;
      setActive((current) => (current + 1) % count);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [playing, count]);

  const go = useCallback((index: number) => {
    setActive(index);
    setPlaying(false);
  }, []);

  const lead = estates[active];
  // N+1, so the two frames never show the same estate on the same slide.
  const secondary = count > 1 ? estates[(active + 1) % count] : undefined;
  if (!lead) return null;

  return (
    <Section className="pt-0 lg:pt-0">
      <Container>
        <div
          className="grid gap-6 lg:grid-cols-12"
          onMouseEnter={() => setPlaying(false)}
          onMouseLeave={() => count > 1 && setPlaying(true)}
          onFocusCapture={() => setPlaying(false)}
        >
          <div className="relative lg:col-span-8">
            <figure className="relative aspect-16/9 overflow-hidden rounded-image-l bg-accent-tint">
              {/* Every estate is mounted and crossfaded, so switching slides
                  does not refetch an image the browser already holds. */}
              {estates.map((estate, index) =>
                estate.image ? (
                  <Image
                    key={estate.slug}
                    src={estate.image.url}
                    alt={estate.image.alt}
                    fill
                    loading="lazy"
                    sizes="(min-width: 1024px) 66vw, 100vw"
                    aria-hidden={index !== active}
                    className={cn(
                      "object-cover transition-opacity duration-1000 ease-out",
                      index === active ? "opacity-100" : "opacity-0",
                    )}
                  />
                ) : null,
              )}

              <figcaption className="absolute top-0 right-0 flex max-w-[85%] items-center gap-3 rounded-bl-image-l bg-canvas py-2 pl-4 lg:gap-4 lg:py-3 lg:pl-6">
                <span
                  className="h-px w-6 shrink-0 bg-ink-muted lg:w-10"
                  aria-hidden="true"
                />
                <span className="truncate text-body text-ink lg:text-heading">
                  {lead.name}
                </span>
              </figcaption>
            </figure>

            {/* Elevation 1 of 2 — the callout overlapping the hero imagery. */}
            <div className="relative z-10 mx-4 -mt-12 max-w-lg rounded-card bg-surface p-6 shadow-lift lg:mx-10 lg:-mt-16 lg:p-8">
              <p className="text-heading text-ink">
                Title checked before it is listed
              </p>
              <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {[
                  "Title type on every plot",
                  "Survey number published",
                  "Documents listed in full",
                  "Weak paperwork stated plainly",
                ].map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2 text-body text-ink-secondary"
                  >
                    <span
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                      aria-hidden="true"
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {secondary ? (
            <div className="flex flex-col lg:col-span-4">
              <figure className="relative aspect-4/3 overflow-hidden rounded-image-l bg-accent-tint">
                {estates.map((estate) =>
                  estate.image ? (
                    <Image
                      key={estate.slug}
                      src={estate.image.url}
                      alt={estate.image.alt}
                      fill
                      loading="lazy"
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      aria-hidden={estate.slug !== secondary.slug}
                      className={cn(
                        "object-cover transition-opacity duration-1000 ease-out",
                        estate.slug === secondary.slug
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  ) : null,
                )}
                <figcaption className="absolute right-0 bottom-0 flex max-w-[85%] items-center gap-3 rounded-tl-image-l bg-canvas py-2 pl-4">
                  <span
                    className="h-px w-6 shrink-0 bg-ink-muted lg:w-8"
                    aria-hidden="true"
                  />
                  <span className="truncate text-body text-ink">
                    {secondary.name}
                  </span>
                </figcaption>
              </figure>

              <div aria-live="polite">
                <p className="mt-6 text-heading text-ink">
                  {secondary.location}, {secondary.state}
                </p>
                <p className="mt-3 line-clamp-4 text-body text-ink-secondary">
                  {secondary.description}
                </p>
              </div>

              <Link
                href={`/estates/${secondary.slug}`}
                className="mt-5 inline-flex items-center gap-2 text-body text-accent transition-colors hover:text-accent-hover"
              >
                See all estates
                <ArrowGlyph />
              </Link>
            </div>
          ) : null}
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-4 lg:mt-24">
          <ButtonLink variant="secondary" href={`/estates/${lead.slug}`}>
            Explore {lead.name}
          </ButtonLink>
          <p className="text-body text-ink-muted" aria-live="polite">
            <span className="tabular">{lead.listingCount}</span> listings in
            this estate · {lead.location}, {lead.state}
          </p>

          {count > 1 ? (
            <div className="ml-auto flex items-center gap-3">
              {estates.map((estate, index) => (
                <button
                  key={estate.slug}
                  type="button"
                  onClick={() => go(index)}
                  aria-label={`Show ${estate.name}`}
                  aria-current={index === active ? "true" : undefined}
                  className={cn(
                    "h-1 cursor-pointer rounded-full transition-all duration-300",
                    "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none",
                    index === active
                      ? "w-10 bg-accent"
                      : "w-5 bg-ink-muted/40 hover:bg-ink-muted",
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
