import { ArrowGlyph } from "@/components/ui/button";
import { cn } from "@/lib/cn";

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
  /**
   * `wide` splits the card into two columns.
   *
   * On a listing page this sits inside a seven-column well and stacking is
   * right. On an estate page it spans the container, where a single narrow
   * text column left most of the card empty. Explicit rather than a container
   * query, because the two call sites are known and a prop is easier to reason
   * about than a breakpoint that depends on an ancestor.
   */
  layout = "stacked",
}: {
  location: string;
  state: string;
  estateName?: string;
  layout?: "stacked" | "wide";
}) {
  const query = encodeURIComponent(
    [estateName, location, state, "Nigeria"].filter(Boolean).join(", "),
  );

  return (
    <div
      className={cn(
        "rounded-card border border-hairline bg-surface p-6 lg:p-8",
        layout === "wide" &&
          "lg:grid lg:grid-cols-12 lg:items-center lg:gap-10",
      )}
    >
      <div className={cn(layout === "wide" && "lg:col-span-7")}>
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
      </div>

      <p
        className={cn(
          "text-caption text-ink-muted",
          layout === "wide"
            ? "mt-5 border-t border-hairline pt-5 lg:col-span-5 lg:mt-0 lg:border-t-0 lg:border-l lg:border-hairline lg:pt-0 lg:pl-10"
            : "mt-5",
        )}
      >
        Inspections are arranged with a member of the team. Plot boundaries are
        walked on site, not judged from a map.
      </p>
    </div>
  );
}
