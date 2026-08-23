"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Free-text search above the grid, on every breakpoint.
 *
 * A plain GET form, not an onChange handler pushing router state. That buys
 * three things: it submits without JavaScript, the browser's own search history
 * works in the field, and the result is a real URL a buyer can share — the same
 * reason FR-1.2's filters are links rather than click handlers.
 *
 * Every other active filter rides along as a hidden input, so searching inside
 * a filtered view narrows it instead of resetting it. `page` is deliberately
 * not carried: page 4 of the previous result set means nothing here.
 */
export function SearchField({
  placeholder,
  className,
}: {
  placeholder: string;
  className?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("q") ?? "";

  // Controlled so the clear control can empty it, seeded from the URL so a
  // back-navigation puts the previous term back in the field.
  //
  // Resynced during render rather than in an effect: an effect would render
  // once with the stale term and again with the fresh one, and the visitor
  // would see the old query flash back into the field on every navigation.
  // This is React's documented "adjusting state when a prop changes" pattern.
  const [value, setValue] = useState(current);
  const [lastFromUrl, setLastFromUrl] = useState(current);
  if (current !== lastFromUrl) {
    setLastFromUrl(current);
    setValue(current);
  }

  const carried = Array.from(searchParams.entries()).filter(
    ([key]) => key !== "q" && key !== "page",
  );

  return (
    <form action={pathname} method="get" className={cn("relative", className)}>
      {carried.map(([key, entry]) => (
        <input key={`${key}-${entry}`} type="hidden" name={key} value={entry} />
      ))}

      <label htmlFor="listing-search" className="sr-only">
        {placeholder}
      </label>

      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 fill-none stroke-ink-muted stroke-[1.5]"
      >
        <circle cx="9" cy="9" r="6" />
        <path d="M13.5 13.5 17 17" strokeLinecap="round" />
      </svg>

      <input
        id="listing-search"
        type="search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        // `search` inputs get a webkit clear button that sits on top of ours.
        className={cn(
          "min-h-12 w-full rounded-full border border-hairline bg-surface pr-28 pl-11 text-body text-ink",
          "placeholder:text-ink-muted focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
          "[&::-webkit-search-cancel-button]:hidden",
        )}
      />

      <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
        {current ? (
          // A link, not a reset: clearing has to change the URL, or the grid
          // behind it keeps showing the old result set.
          <a
            href={`${pathname}${
              carried.length > 0
                ? `?${new URLSearchParams(carried).toString()}`
                : ""
            }`}
            aria-label="Clear search"
            className="flex size-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-ink"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="size-4 fill-none stroke-current stroke-[1.5]"
            >
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </a>
        ) : null}

        <button
          type="submit"
          className={cn(
            "min-h-9 cursor-pointer rounded-full bg-accent px-4 text-caption text-white transition-colors",
            "hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none",
          )}
        >
          Search
        </button>
      </div>
    </form>
  );
}
