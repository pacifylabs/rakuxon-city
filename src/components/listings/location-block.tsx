import { ArrowGlyph } from "@/components/ui/button";

/**
 * Stands in for `MapEmbed` from architecture §7.
 *
 * The PRD stack (§9) names no mapping provider, and every embed worth having
 * needs an API key and sends the visitor's IP to a third party — which is an
 * NDPR question, not just a technical one. Rather than pick one unasked, this
 * gives the location plainly and hands off to the visitor's own map.
 */
export function LocationBlock({
  location,
  state,
  estateName,
}: {
  location: string;
  state: string;
  estateName?: string;
}) {
  const query = encodeURIComponent(
    [estateName, location, state, "Nigeria"].filter(Boolean).join(", "),
  );

  return (
    <div className="rounded-card border border-hairline bg-surface p-6 lg:p-8">
      <p className="text-heading text-ink">Where it is</p>
      <p className="mt-3 text-body text-ink-secondary">
        {estateName ? `${estateName}, ` : ""}
        {location}, {state} State.
      </p>
      <a
        href={`https://www.openstreetmap.org/search?query=${query}`}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-5 inline-flex items-center gap-2 text-body text-accent transition-colors hover:text-accent-hover"
      >
        Open in maps
        <ArrowGlyph />
      </a>
      <p className="mt-5 text-caption text-ink-muted">
        Inspections are arranged with a member of the team. Plot boundaries are
        walked on site, not judged from a map.
      </p>
    </div>
  );
}
