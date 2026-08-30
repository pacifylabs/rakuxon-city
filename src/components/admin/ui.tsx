import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { ListingStatus, EnquiryStatus } from "@/generated/prisma/enums";

/** Page title, optional description, optional right-aligned action. */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
      <div>
        {eyebrow ? <p className="text-eyebrow text-muted">{eyebrow}</p> : null}
        <h1 className="mt-1 text-display-m text-foreground">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-[60ch] text-body text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Table shell. Horizontally scrollable — admin tables are wide by nature. */
export function DataTable({
  headers,
  children,
  empty,
}: {
  headers: string[];
  children: ReactNode;
  /** Rendered instead of the table when there are no rows. */
  empty?: ReactNode;
}) {
  if (empty) {
    return (
      <div className="rounded-card border border-line bg-surface p-10 text-center">
        {empty}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-card border border-line bg-surface">
      <table className="w-full min-w-[48rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-line">
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-4 py-3 text-caption font-medium text-muted"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-4 py-3 text-body text-foreground", className)}>
      {children}
    </td>
  );
}

const LISTING_STATUS_STYLES: Record<ListingStatus, string> = {
  DRAFT: "bg-surface-muted text-muted",
  AVAILABLE: "bg-status-available-bg text-status-available",
  RESERVED: "bg-status-reserved-bg text-status-reserved",
  SOLD: "bg-status-sold-bg text-status-sold",
};

const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  DRAFT: "Draft",
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  SOLD: "Sold",
};

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-caption",
        LISTING_STATUS_STYLES[status],
      )}
    >
      {LISTING_STATUS_LABELS[status]}
    </span>
  );
}

const ENQUIRY_STATUS_STYLES: Record<EnquiryStatus, string> = {
  NEW: "bg-accent-tint text-accent-text",
  CONTACTED: "bg-status-available-bg text-status-available",
  QUALIFIED: "bg-status-reserved-bg text-status-reserved",
  CLOSED: "bg-status-sold-bg text-status-sold",
};

const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  CLOSED: "Closed",
};

export function EnquiryStatusBadge({ status }: { status: EnquiryStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-caption",
        ENQUIRY_STATUS_STYLES[status],
      )}
    >
      {ENQUIRY_STATUS_LABELS[status]}
    </span>
  );
}

/** Server-rendered pagination — links, so a page is shareable and back-able. */
export function AdminPagination({
  page,
  pageCount,
  hrefFor,
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
}) {
  if (pageCount <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="mt-6 flex items-center justify-between gap-4"
    >
      <p className="text-caption text-muted">
        Page <span className="tabular">{page}</span> of{" "}
        <span className="tabular">{pageCount}</span>
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={hrefFor(page - 1)}
            className="rounded-control border border-line px-4 py-2 text-body text-foreground transition-colors hover:bg-surface-muted"
          >
            Previous
          </Link>
        ) : null}
        {page < pageCount ? (
          <Link
            href={hrefFor(page + 1)}
            className="rounded-control border border-line px-4 py-2 text-body text-foreground transition-colors hover:bg-surface-muted"
          >
            Next
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

/** Inline error panel for a failed Server Action. */
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-control border border-error/30 bg-error/5 px-4 py-3 text-caption text-error"
    >
      {message}
    </p>
  );
}

/** Neutral confirmation panel, for a save that just succeeded. */
export function FormSuccess({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p
      role="status"
      className="rounded-control border border-status-available/30 bg-status-available-bg px-4 py-3 text-caption text-status-available"
    >
      {message}
    </p>
  );
}
