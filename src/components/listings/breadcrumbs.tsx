import Link from "next/link";

/** `BreadcrumbNav` from architecture §7 — on every detail page. */
export function Breadcrumbs({
  trail,
}: {
  trail: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-caption text-ink-muted">
        {trail.map((crumb, index) => (
          <li key={crumb.label} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="transition-colors hover:text-accent"
              >
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink-secondary">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
