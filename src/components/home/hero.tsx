import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/**
 * 01_SITE_ARCHITECTURE.md §5.1 — a plain statement of what the company does,
 * with a single entry that lets a visitor pick Land or Homes without first
 * committing to a lane.
 *
 * The headline, supporting text and lane picker now sit over a wide estate
 * photograph rather than on bare canvas. The client's note was that the hero
 * "should look more serious": the type was doing all the work alone, and an
 * opening screen of text on an empty ground reads as a site still being built
 * rather than as an established developer.
 *
 * Two things this costs, both handled here rather than left to chance:
 *
 *   - The photograph becomes the LCP element. It is `priority`, sized for the
 *     breakpoints it actually renders at, and nothing above it defers layout.
 *   - Text over an image is where contrast quietly fails. A `deep` scrim at a
 *     fixed opacity sits between the two, and every value below was measured
 *     against the darkened result rather than eyeballed.
 */
const categories = ["Residential land", "Commercial plots", "Completed homes"];

export function Hero({
  counts,
  image,
}: {
  counts: { land: number; homes: number };
  /** From the `homepage.hero` placement, so the admin can swap it in Phase 7. */
  image: {
    url: string;
    alt: string;
    width: number;
    height: number;
  } | null;
}) {
  return (
    <Container as="section" className="pt-2 pb-16 lg:pb-24">
      <div className="relative isolate overflow-hidden rounded-image-l bg-deep">
        {image ? (
          <>
            <Image
              src={image.url}
              alt={image.alt}
              fill
              /*
               * The real rendered width, not `100vw`. The panel sits inside the
               * container's padding, so `100vw` made the browser pick the 750w
               * candidate on a 412px phone where 640w covers it — a candidate
               * larger than the element it fills.
               */
              sizes="(min-width: 1280px) 1200px, (min-width: 640px) calc(100vw - 80px), calc(100vw - 48px)"
              quality={68}
              priority
              className="object-cover"
            />
            {/*
              70%, and the figure is measured rather than chosen by eye.

              Text over a photograph is where contrast quietly fails, because
              the photograph can be swapped by an admin for one with a blown-out
              sky behind the paragraph. So the scrim is set for that worst case:
              `text-canvas` over 70% `deep` compositing onto pure white gives
              6.29:1, comfortably past the 4.5 floor for body text. At 60% it is
              4.41 and fails. Anything that lightens this needs to redo that sum.

              A little extra weight at the foot, where the lane picker sits, for
              depth — never less than the 70% floor.
            */}
            <div aria-hidden="true" className="absolute inset-0 bg-deep/70" />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-deep/40 via-transparent to-transparent"
            />
          </>
        ) : null}

        <div className="relative grid grid-cols-1 gap-10 px-6 py-16 sm:px-10 lg:grid-cols-12 lg:gap-6 lg:px-14 lg:py-24">
          <div className="lg:col-span-7">
            <h1 className="max-w-[20ch] text-display-xl text-canvas">
              Land and homes, with the papers in order
            </h1>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-1 text-caption text-canvas/80 lg:mt-10">
              {categories.map((category) => (
                <li key={category} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-1 rounded-full bg-gold-on-deep"
                  />
                  {category}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-end gap-8 lg:col-span-5">
            <p className="max-w-[42ch] text-body-l text-canvas/90">
              Rakuxon City sells serviced plots and finished houses across
              Lagos, Ogun and the FCT. Every listing shows its title type and
              its documentation before it shows you a price.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <ButtonLink href="/land">Explore properties</ButtonLink>
            </div>

            {/* The inline lane picker from §5.1 — choose a track without
                leaving the hero, with live counts so the choice is informed. */}
            <div className="flex divide-x divide-canvas/20 overflow-hidden rounded-full border border-canvas/25 bg-deep/40 backdrop-blur-sm">
              <LanePick href="/land" label="Land" count={counts.land} />
              <LanePick href="/homes" label="Homes" count={counts.homes} />
            </div>
          </div>
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
      className="flex-1 px-5 py-3 text-center text-body text-canvas transition-colors hover:bg-canvas/10 focus-visible:ring-2 focus-visible:ring-canvas focus-visible:ring-inset focus-visible:outline-none"
    >
      {label}
      <span className="tabular ml-2 text-caption text-gold-on-deep">
        {count}
      </span>
    </Link>
  );
}
