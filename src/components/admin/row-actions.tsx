import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The per-row action cluster on every admin list.
 *
 * Before this, the only way into a record's form was clicking its title —
 * which is a link, but does not read as one at a glance in a dense table.
 * An explicit Edit button per row is the thing the client asked for, and it
 * belongs in one component so land, homes, estates, guides and media all
 * behave identically rather than each growing their own affordance.
 *
 * `extra` takes anything row-specific that sits beside it — a View link for
 * a published guide, a Delete form for an unused image.
 */
export function RowActions({
  editHref,
  editLabel = "Edit",
  extra,
}: {
  editHref: string;
  /** Announced to screen readers, e.g. "Edit Plot C11". */
  editLabel?: string;
  extra?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      {extra}
      <Link
        href={editHref}
        aria-label={editLabel}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-control border border-line px-3 text-caption text-foreground transition-colors hover:border-muted hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-foreground focus-visible:outline-none"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
        Edit
      </Link>
    </div>
  );
}

/** A quiet secondary link for the `extra` slot — "View", "Preview". */
export function RowLink({
  href,
  children,
  external,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      className="inline-flex min-h-9 items-center rounded-control px-2.5 text-caption text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
    >
      {children}
    </Link>
  );
}
