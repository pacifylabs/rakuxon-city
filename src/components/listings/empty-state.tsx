import { ButtonLink } from "@/components/ui/button";

/**
 * FR-1.11 — never a bare "no results". A visitor who filtered their way to an
 * empty grid is the most qualified lead on the site: they know exactly what
 * they want and we do not have it. Ask them.
 */
export function ListingEmptyState({
  track,
  filtered,
  clearHref,
}: {
  track: "land" | "homes";
  filtered: boolean;
  clearHref: string;
}) {
  const noun = track === "land" ? "plots" : "homes";

  return (
    <div className="rounded-card border border-hairline bg-surface p-8 lg:p-12">
      <p className="max-w-[24ch] text-display-m text-ink">
        {filtered
          ? `No ${noun} match those filters right now`
          : `No ${noun} are listed at the moment`}
      </p>
      <p className="mt-5 max-w-[54ch] text-body text-ink-secondary">
        Stock moves quickly and we do not list everything the day it becomes
        available. Tell us what you are looking for — the size, the area and the
        budget — and we will come back to you when something fits, including if
        that is nothing right now.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <ButtonLink href="/contact">
          Tell us what you are looking for
        </ButtonLink>
        {filtered ? (
          <ButtonLink variant="text" href={clearHref}>
            Clear the filters
          </ButtonLink>
        ) : null}
      </div>
    </div>
  );
}
