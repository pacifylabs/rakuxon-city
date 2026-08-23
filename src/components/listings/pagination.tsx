import Link from "next/link";
import { cn } from "@/lib/cn";

/** FR-1.1 — twelve per page. Links, so a page is shareable and crawlable. */
export function Pagination({
  page,
  pageCount,
  hrefFor,
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
}) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav
      aria-label="Pagination"
      className="mt-16 flex items-center justify-center gap-2"
    >
      <PageLink
        href={hrefFor(page - 1)}
        disabled={page === 1}
        label="Previous page"
      >
        Prev
      </PageLink>

      <ul className="flex items-center gap-1">
        {pages.map((number) => (
          <li key={number}>
            <Link
              href={hrefFor(number)}
              aria-current={number === page ? "page" : undefined}
              className={cn(
                "tabular flex size-11 items-center justify-center rounded-full border text-body transition-colors",
                "focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
                number === page
                  ? "border-accent bg-accent-tint text-accent"
                  : "border-hairline bg-surface text-ink-secondary hover:border-ink-muted",
              )}
            >
              {number}
            </Link>
          </li>
        ))}
      </ul>

      <PageLink
        href={hrefFor(page + 1)}
        disabled={page === pageCount}
        label="Next page"
      >
        Next
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span aria-hidden="true" className="px-4 text-body text-ink-muted">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className="px-4 text-body text-ink transition-colors hover:text-accent"
    >
      {children}
    </Link>
  );
}
