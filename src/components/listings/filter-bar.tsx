"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type FilterOption = { value: string; label: string };
export type FilterConfig = {
  /** The search-param key this chip writes. */
  key: string;
  label: string;
  options: FilterOption[];
};

/**
 * 04_DESIGN_SYSTEM.md §6 — a horizontal row of pill chips above the grid. Idle
 * is surface with a hairline; selected is accent-tint with an accent border and
 * label. Ranges open a small popover, never a modal.
 *
 * Config-driven so the two tracks share one component: land passes title type
 * and plot size, homes passes bedrooms, house type and build stage.
 *
 * Every option is a real `<Link>` carrying the full query string rather than a
 * click handler pushing state. Filters then survive a refresh, a shared URL and
 * the back button for free, which is what FR-1.2 asks for.
 */
export function FilterBar({
  filters,
  sortOptions,
  className,
}: {
  filters: FilterConfig[];
  sortOptions: FilterOption[];
  className?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open === null) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  /** Any filter change returns to page one; page 4 of the old result set is meaningless. */
  const hrefFor = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    if (params.get("sort") === "newest") params.delete("sort");
    const query = params.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  };

  const activeCount = filters.filter((filter) =>
    searchParams.get(filter.key),
  ).length;

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-wrap items-center gap-3", className)}
    >
      {filters.map((filter) => {
        const current = searchParams.get(filter.key);
        const selected = filter.options.find(
          (option) => option.value === current,
        );
        const isOpen = open === filter.key;

        return (
          <div key={filter.key} className="relative">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : filter.key)}
              aria-expanded={isOpen}
              aria-haspopup="true"
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-body transition-colors",
                "focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
                selected
                  ? "border-accent bg-accent-tint text-accent"
                  : "border-hairline bg-surface text-ink-secondary hover:border-ink-muted",
              )}
            >
              {selected ? selected.label : filter.label}
              <span aria-hidden="true" className="text-caption">
                {isOpen ? "▲" : "▼"}
              </span>
            </button>

            {isOpen ? (
              <div
                className={cn(
                  // Hairline, not elevation. §5 spends the page's two lifts elsewhere and
                  // says everything else stays flat.
                  "absolute top-full left-0 z-30 mt-2 w-60 rounded-card border border-hairline bg-surface p-2",
                )}
              >
                <ul className="max-h-72 overflow-y-auto">
                  {current ? (
                    <li>
                      <Link
                        href={hrefFor(filter.key, null)}
                        onClick={() => setOpen(null)}
                        className="block rounded-control px-3 py-2 text-body text-ink-muted hover:bg-canvas"
                      >
                        Any {filter.label.toLowerCase()}
                      </Link>
                    </li>
                  ) : null}
                  {filter.options.map((option) => (
                    <li key={option.value}>
                      <Link
                        href={hrefFor(filter.key, option.value)}
                        onClick={() => setOpen(null)}
                        aria-current={
                          option.value === current ? "true" : undefined
                        }
                        className={cn(
                          "block rounded-control px-3 py-2 text-body hover:bg-canvas",
                          option.value === current
                            ? "text-accent"
                            : "text-ink-secondary",
                        )}
                      >
                        {option.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        );
      })}

      <div className="ml-auto flex items-center gap-3">
        {activeCount > 0 ? (
          <Link
            href={pathname}
            className="text-body text-accent transition-colors hover:text-accent-hover"
          >
            Clear {activeCount === 1 ? "filter" : `all ${activeCount} filters`}
          </Link>
        ) : null}

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(open === "sort" ? null : "sort")}
            aria-expanded={open === "sort"}
            aria-haspopup="true"
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline bg-surface px-4 text-body text-ink-secondary transition-colors hover:border-ink-muted",
              "focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
            )}
          >
            {
              sortOptions.find(
                (o) => o.value === (searchParams.get("sort") ?? "newest"),
              )?.label
            }
            <span aria-hidden="true" className="text-caption">
              {open === "sort" ? "▲" : "▼"}
            </span>
          </button>

          {open === "sort" ? (
            <div className="absolute top-full right-0 z-30 mt-2 w-56 rounded-card border border-hairline bg-surface p-2">
              <ul>
                {sortOptions.map((option) => (
                  <li key={option.value}>
                    <Link
                      href={hrefFor("sort", option.value)}
                      onClick={() => setOpen(null)}
                      className={cn(
                        "block rounded-control px-3 py-2 text-body hover:bg-canvas",
                        option.value === (searchParams.get("sort") ?? "newest")
                          ? "text-accent"
                          : "text-ink-secondary",
                      )}
                    >
                      {option.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
