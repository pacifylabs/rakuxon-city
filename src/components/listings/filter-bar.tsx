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
  /**
   * Shown inline on desktop. Everything else collapses behind "More filters".
   *
   * Two per hub, chosen by what a buyer narrows on first: price and title type
   * on land, price and bedrooms on homes. A hub with no secondary filters — as
   * /tours has — shows them all inline and no "More filters" button at all.
   */
  primary?: boolean;
};

/**
 * The filter controls above every listing grid.
 *
 * 04_DESIGN_SYSTEM.md §6 asks for a row of pill chips. Seven of them plus a
 * sort control is a row of eight, which is what the client rejected: no
 * hierarchy, and every option shouting equally.
 *
 * So the row is two tiers. The two filters buyers actually reach for stay
 * inline; the rest live behind one "More filters" button that carries a count
 * of how many are active. That keeps §6's chip vocabulary — same pills, same
 * hairline, same accent-tint selected state — while cutting the row from eight
 * controls to four.
 *
 * Below `md` all of it collapses into a single "Filters" button. Seven chips
 * wrapping over four ragged lines is bad on a phone, and each tap there also
 * cost a full page load.
 *
 * Inline chips navigate immediately — a real `<Link>` carrying the whole query
 * string, so filters survive a refresh, a shared URL and the back button for
 * free (FR-1.2). The panels batch instead, applying once on submit, because a
 * visitor setting four filters should not pay for four round trips.
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
  const [panel, setPanel] = useState<"none" | "more" | "all">("none");
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

  // A hub that marks nothing primary gets everything inline rather than an
  // empty row above a button holding all of them.
  const hasPrimary = filters.some((filter) => filter.primary);
  const primary = hasPrimary ? filters.filter((f) => f.primary) : filters;
  const secondary = hasPrimary ? filters.filter((f) => !f.primary) : [];

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

  const countActive = (set: FilterConfig[]) =>
    set.filter((filter) => searchParams.get(filter.key)).length;

  const activeCount = countActive(filters);
  const secondaryActive = countActive(secondary);

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
      {/* Desktop: two primary chips, one "More filters", sort on the right. */}
      <div className="hidden flex-wrap items-center gap-3 md:flex">
        {primary.map((filter) => {
          const current = searchParams.get(filter.key);
          const selected = filter.options.find(
            (option) => option.value === current,
          );
          const isOpen = open === filter.key;

          return (
            <div key={filter.key} className="relative">
              <Chip
                selected={Boolean(selected)}
                onClick={() => setOpen(isOpen ? null : filter.key)}
                aria-expanded={isOpen}
                aria-haspopup="true"
              >
                {selected ? selected.label : filter.label}
                <Chevron open={isOpen} />
              </Chip>

              {isOpen ? (
                <Dropdown>
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
                </Dropdown>
              ) : null}
            </div>
          );
        })}

        {secondary.length > 0 ? (
          <Chip selected={secondaryActive > 0} onClick={() => setPanel("more")}>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="size-4 fill-none stroke-current stroke-[1.5]"
            >
              <path d="M3 5h14M6 10h8M8.5 15h3" strokeLinecap="round" />
            </svg>
            More filters
            {secondaryActive > 0 ? (
              <span className="tabular">({secondaryActive})</span>
            ) : null}
          </Chip>
        ) : null}

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
              <Chip
                selected={false}
                onClick={() => setOpen(open === "sort" ? null : "sort")}
                aria-expanded={open === "sort"}
                aria-haspopup="true"
              >
                {
                  sortOptions.find(
                    (option) =>
                      option.value === (searchParams.get("sort") ?? "newest"),
                  )?.label
                }
                <Chevron open={open === "sort"} />
              </Chip>

              {open === "sort" ? (
                <Dropdown align="right">
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
                </Dropdown>
              ) : null}
            </div>
          ) : null}
        </div>

        {panel === "more" ? (
          <FilterPanel
            variant="modal"
            title="More filters"
            filters={secondary}
            onClose={() => setPanel("none")}
          />
        ) : null}
      </div>

      {/* Mobile: one control, opening a sheet with everything in it. */}
      <div className="flex items-center gap-3 md:hidden">
        <Chip
          selected={activeCount > 0}
          onClick={() => setPanel("all")}
          className="min-h-12 flex-1 justify-center"
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
        </Chip>

        {/*
          Inside the breakpoint wrapper, not beside it. The sheet is only
          openable below `md`, but rendering it outside meant a visitor who
          opened it and then widened the window — or rotated a tablet — was
          left with a modal over a layout that already shows every filter.
        */}
        {panel === "all" ? (
          <FilterPanel
            variant="sheet"
            title="Filters"
            filters={filters}
            sortOptions={sortOptions}
            onClose={() => setPanel("none")}
          />
        ) : null}
      </div>
    </div>
  );
}

/** §6's pill, in one place so the two tiers cannot drift apart visually. */
function Chip({
  selected,
  className,
  children,
  ...props
}: {
  selected: boolean;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-body transition-colors",
        "focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
        selected
          ? "border-accent bg-accent-tint text-accent"
          : "border-hairline bg-surface text-ink-secondary hover:border-ink-muted",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** Hairline, not elevation — §5 spends the page's two lifts elsewhere. */
function Dropdown({
  align = "left",
  children,
}: {
  align?: "left" | "right";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute top-full z-30 mt-2 w-60 rounded-card border border-hairline bg-surface p-2",
        align === "left" ? "left-0" : "right-0",
      )}
    >
      {children}
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
 * The batching panel behind "More filters" and behind mobile's "Filters".
 *
 * Built on a native `<dialog>` opened with `showModal()`, which brings the
 * focus trap, the Escape handler, the inert background and top-layer stacking
 * with it. Hand-rolling those is where accessible modals usually go wrong, and
 * the platform already ships a correct one.
 *
 * `variant` only changes where it sits: a bottom sheet on a phone, a centred
 * card on a desktop. The behaviour is identical.
 */
function FilterPanel({
  variant,
  title,
  filters,
  sortOptions,
  onClose,
}: {
  variant: "sheet" | "modal";
  title: string;
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
    // The page behind must not scroll while the panel is over it.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(pending)) {
      if (
        value === null ||
        value === "" ||
        (key === "sort" && value === "newest")
      ) {
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
      aria-label={title}
      className={cn(
        "max-h-[85dvh] bg-canvas p-0 text-ink backdrop:bg-deep/40",
        variant === "sheet"
          ? "m-0 mt-auto w-full max-w-none rounded-t-image-l"
          : "m-auto w-[min(34rem,calc(100vw-3rem))] rounded-card border border-hairline",
      )}
    >
      <div className="flex max-h-[85dvh] flex-col">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <p className="text-heading text-ink">{title}</p>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label={`Close ${title.toLowerCase()}`}
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
            <fieldset className="mt-8">
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
              "min-h-12 rounded-full border border-hairline px-5 text-body transition-colors",
              activeCount === 0
                ? "cursor-not-allowed text-ink-muted"
                : "cursor-pointer text-ink-secondary hover:border-ink-muted",
            )}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={apply}
            className={cn(
              "min-h-12 flex-1 cursor-pointer rounded-full bg-accent-fill px-5 text-body text-deep transition-colors",
              "hover:bg-accent-fill-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none",
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
