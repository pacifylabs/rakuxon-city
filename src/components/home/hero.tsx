import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/**
 * 01_SITE_ARCHITECTURE.md §5.1 — a plain statement of what the company does,
 * with a single entry that lets a visitor pick Land or Homes without first
 * committing to a lane.
 *
 * The pairing follows the reference: headline left at display-xl, category list
 * set tight against the second line, supporting paragraph and the one
 * accent-filled action offset right.
 */
const categories = ["Residential land", "Commercial plots", "Completed homes"];

export function Hero({ counts }: { counts: { land: number; homes: number } }) {
  return (
    <Container as="section">
      <div className="grid grid-cols-1 gap-10 pt-8 pb-16 lg:grid-cols-12 lg:gap-6 lg:pt-16 lg:pb-24">
        <div className="lg:col-span-8">
          <h1 className="max-w-[21ch] text-display-xl text-ink">
            Land and homes, with the papers in order
            <StarGlyph />
          </h1>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-1 text-caption text-ink-muted lg:mt-10">
            {categories.map((category) => (
              <li key={category}>{category}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-end gap-8 lg:col-span-4">
          <p className="max-w-[42ch] text-body text-ink-secondary">
            Rakuxon City sells serviced plots and finished houses across Lagos,
            Ogun and the FCT. Every listing shows its title type and its
            documentation before it shows you a price.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <ButtonLink href="/land">Explore properties</ButtonLink>
          </div>

          {/* The inline lane picker from §5.1 — choose a track without leaving
              the hero, with live counts so the choice is informed. */}
          <div className="flex divide-x divide-hairline overflow-hidden rounded-full border border-hairline">
            <LanePick href="/land" label="Land" count={counts.land} />
            <LanePick href="/homes" label="Homes" count={counts.homes} />
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
      className="flex-1 px-5 py-3 text-center text-body text-ink-secondary transition-colors hover:bg-accent-tint hover:text-accent"
    >
      {label}
      <span className="tabular ml-2 text-caption text-ink-muted">{count}</span>
    </Link>
  );
}

/** The small burst set into the headline, as in the reference layout. */
function StarGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="ml-4 inline-block size-8 align-middle text-ink"
    >
      <path
        d="M12 0c.6 5.1 1.6 7.9 3.6 9.4C17 10.5 19.2 11.2 24 12c-4.8.8-7 1.5-8.4 2.6-2 1.5-3 4.3-3.6 9.4-.6-5.1-1.6-7.9-3.6-9.4C7 13.5 4.8 12.8 0 12c4.8-.8 7-1.5 8.4-2.6C10.4 7.9 11.4 5.1 12 0z"
        fill="currentColor"
      />
    </svg>
  );
}
