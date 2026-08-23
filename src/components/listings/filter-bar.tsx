"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
 * 04_DESIGN_SYSTEM.md §6 — a horizontal row of pill chips above the grid.
 *
 * Config-driven so every hub shares one component: land passes title type and
 * plot size, homes passes bedrooms and build stage, /tours passes kind and
 * estate.
 *
 * Two layouts, one behaviour:
 *
 *   Desktop keeps the chip row. Every option is a real `<Link>` carrying the
 *   full query string rather than a click handler pushing state, so filters
 *   survive a refresh, a shared URL and the back button for free — FR-1.2.
 *
 *   Below `md` the chips collapse into a single "Filters" button opening a
 *   sheet. Seven chips wrapping over four ragged lines is what the client was
 *   looking at, and on a phone each of those chips also cost a full page load.
 *   The sheet batches instead: choices are held locally and one navigation
 *   happens on Apply.
 */
export function FilterBar({
  filters,
  sortOptions,
  className,
}: {
  filters: FilterConfig[];
  /** Omitted where the order is fixed, as on /tours. */
  sortOptions?: FilterOption[];
  className?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
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

  /** Search is cleared separately, by the field's own control. */
  const clearHref = (() => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    const query = params.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  })();

  return (
    <div ref={containerRef} className={cn("", className)}>
      {/* Desktop: the chip row from §6. */}
      <div className="hidden flex-wrap items-center gap-3 md:flex">
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
                  "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-body transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
                  selected
                    ? "border-accent bg-accent-tint text-accent"
                    : "border-hairline bg-surface text-ink-secondary hover:border-ink-muted",
                )}
              >
                {selected ? selected.label : filter.label}
                <Chevron open={isOpen} />
              </button>

              {isOpen ? (
                <div
                  className={cn(
                    // Hairline, not elevation. §5 spends the page's two lifts
                    // elsewhere and says everything else stays flat.
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
              href={clearHref}
              className="text-body text-accent transition-colors hover:text-accent-hover"
            >
              Clear {activeCount === 1 ? "filter" : `all ${activeCount}`}
            </Link>
          ) : null}

          {sortOptions ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen(open === "sort" ? null : "sort")}
                aria-expanded={open === "sort"}
                aria-haspopup="true"
                className={cn(
                  "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-hairline bg-surface px-4 text-body text-ink-secondary transition-colors hover:border-ink-muted",
                  "focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
                )}
              >
                {
                  sortOptions.find(
                    (option) =>
                      option.value === (searchParams.get("sort") ?? "newest"),
                  )?.label
                }
                <Chevron open={open === "sort"} />
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
                            option.value ===
                              (searchParams.get("sort") ?? "newest")
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
          ) : null}
        </div>
      </div>

      {/* Mobile: one control, opening the sheet. */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className={cn(
            "inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border px-4 text-body transition-colors",
            "focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
            activeCount > 0
              ? "border-accent bg-accent-tint text-accent"
              : "border-hairline bg-surface text-ink-secondary",
          )}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="size-4 fill-none stroke-current stroke-[1.5]"
          >
            <path d="M3 5h14M6 10h8M8.5 15h3" strokeLinecap="round" />
          </svg>
          Filters
          {activeCount > 0 ? (
            <span className="tabular">({activeCount})</span>
          ) : null}
        </button>

        {/*
          Inside the breakpoint wrapper, not beside it. The sheet is only
          openable below `md`, but rendering it outside meant a visitor who
          opened it and then widened the window — or rotated a tablet — was
          left with a modal over a layout that already shows every filter.
        */}
        {sheetOpen ? (
          <FilterSheet
            filters={filters}
            sortOptions={sortOptions}
            onClose={() => setSheetOpen(false)}
          />
        ) : null}
      </div>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className={cn(
        "size-3 fill-none stroke-current stroke-[1.5] transition-transform",
        open && "rotate-180",
      )}
    >
      <path d="M2.5 4.5 6 8l3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The mobile sheet.
 *
 * Built on a native `<dialog>` opened with `showModal()`, which brings the
 * focus trap, the Escape handler, the inert background and the top-layer
 * stacking with it. Hand-rolling those is where accessible modals usually go
 * wrong, and the platform already ships a correct one.
 *
 * Selections are held locally and applied in one navigation, rather than each
 * tap costing a page load on a phone connection.
 */
function FilterSheet({
  filters,
  sortOptions,
  onClose,
}: {
  filters: FilterConfig[];
  sortOptions?: FilterOption[];
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [pending, setPending] = useState<Record<string, string | null>>(() => {
    const initial: Record<string, string | null> = {};
    for (const filter of filters) {
      initial[filter.key] = searchParams.get(filter.key);
    }
    if (sortOptions) initial.sort = searchParams.get("sort") ?? "newest";
    return initial;
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();
    // The page behind must not scroll while the sheet is over it.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(pending)) {
      if (value === null || value === "" || (key === "sort" && value === "newest")) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    params.delete("page");
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
    onClose();
  };

  const clear = () => {
    const cleared: Record<string, string | null> = {};
    for (const filter of filters) cleared[filter.key] = null;
    if (sortOptions) cleared.sort = "newest";
    setPending(cleared);
  };

  const activeCount = filters.filter((filter) => pending[filter.key]).length;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // The backdrop click target is the dialog element itself.
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close();
      }}
      aria-label="Filters"
      className={cn(
        "m-0 mt-auto max-h-[85dvh] w-full max-w-none rounded-t-image-l bg-canvas p-0 text-ink",
        "backdrop:bg-deep/40",
      )}
    >
      <div className="flex max-h-[85dvh] flex-col">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <p className="text-heading text-ink">Filters</p>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close filters"
            className="flex size-11 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:text-ink"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="size-5 fill-none stroke-current stroke-[1.5]"
            >
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          {filters.map((filter) => (
            <fieldset key={filter.key} className="mb-8 last:mb-0">
              <legend className="mb-3 text-caption text-ink-muted">
                {filter.label}
              </legend>
              <div className="flex flex-wrap gap-2">
                <SheetChip
                  selected={!pending[filter.key]}
                  onClick={() =>
                    setPending((state) => ({ ...state, [filter.key]: null }))
                  }
                >
                  Any
                </SheetChip>
                {filter.options.map((option) => (
                  <SheetChip
                    key={option.value}
                    selected={pending[filter.key] === option.value}
                    onClick={() =>
                      setPending((state) => ({
                        ...state,
                        [filter.key]: option.value,
                      }))
                    }
                  >
                    {option.label}
                  </SheetChip>
                ))}
              </div>
            </fieldset>
          ))}

          {sortOptions ? (
            <fieldset>
              <legend className="mb-3 text-caption text-ink-muted">
                Sort by
              </legend>
              <div className="flex flex-wrap gap-2">
                {sortOptions.map((option) => (
                  <SheetChip
                    key={option.value}
                    selected={pending.sort === option.value}
                    onClick={() =>
                      setPending((state) => ({ ...state, sort: option.value }))
                    }
                  >
                    {option.label}
                  </SheetChip>
                ))}
              </div>
            </fieldset>
          ) : null}
        </div>

        <div className="flex items-center gap-3 border-t border-hairline bg-surface px-5 py-4">
          <button
            type="button"
            onClick={clear}
            disabled={activeCount === 0}
            className={cn(
              "min-h-12 cursor-pointer rounded-full border border-hairline px-5 text-body transition-colors",
              activeCount === 0
                ? "cursor-not-allowed text-ink-muted"
                : "text-ink-secondary hover:border-ink-muted",
            )}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={apply}
            className={cn(
              "min-h-12 flex-1 cursor-pointer rounded-full bg-accent px-5 text-body text-white transition-colors",
              "hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none",
            )}
          >
            Show results
          </button>
        </div>
      </div>
    </dialog>
  );
}

function SheetChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "min-h-11 cursor-pointer rounded-full border px-4 text-body transition-colors",
        "focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
        selected
          ? "border-accent bg-accent-tint text-accent"
          : "border-hairline bg-surface text-ink-secondary",
      )}
    >
      {children}
    </button>
  );
}
