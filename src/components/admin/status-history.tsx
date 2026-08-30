import { listingStatusLabels } from "@/lib/admin/labels";
import type { ListingStatus } from "@/generated/prisma/enums";

/**
 * The audit trail written by `changeListingStatus` — 03_IMPLEMENTATION_PLAN.md
 * Phase 7 item 6. Shown on the edit page so whoever is looking at a listing
 * can see who moved it and when without leaving the screen.
 */
export function StatusHistory({
  entries,
}: {
  entries: {
    id: string;
    fromStatus: ListingStatus | null;
    toStatus: ListingStatus;
    createdAt: Date;
    changedByUser: { name: string } | null;
  }[];
}) {
  if (entries.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-heading text-foreground">Status history</h2>
      <ul className="mt-4 divide-y divide-line rounded-card border border-line bg-surface">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3"
          >
            <span className="text-body text-foreground">
              {entry.fromStatus
                ? `${listingStatusLabels[entry.fromStatus]} → ${listingStatusLabels[entry.toStatus]}`
                : `Set to ${listingStatusLabels[entry.toStatus]}`}
            </span>
            <span className="text-caption text-muted">
              {entry.changedByUser?.name ?? "Removed user"} ·{" "}
              {entry.createdAt.toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
