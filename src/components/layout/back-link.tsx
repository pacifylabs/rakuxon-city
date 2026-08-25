"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * The way back out of a detail page.
 *
 * Breadcrumbs used to do this job and were removed at the client's request
 * (TODO §1.12). That left the deeper routes — a single guide, a plot, a video —
 * with no upward path except the browser's own back button, which a visitor
 * arriving from a shared WhatsApp link does not have a useful history for.
 *
 * So this is both: it navigates back through history when there is history to
 * go back through, and falls back to a real `href` when there is not. The
 * anchor is always rendered with that href, so it is a working link for
 * keyboard, middle-click, and any visitor without JavaScript — the click
 * handler only upgrades it.
 */
export function BackLink({
  href,
  label,
  className,
}: {
  /** Where to go when this page was opened directly. Always a real route. */
  href: string;
  label: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <Link
      href={href}
      onClick={(event) => {
        // Only intercept a plain left click; let modified clicks open tabs.
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }
        // `history.length > 1` is the honest test for "came from somewhere".
        // A tab opened straight onto this URL has nothing to go back to, and
        // router.back() there would leave the visitor stranded.
        if (window.history.length > 1) {
          event.preventDefault();
          router.back();
        }
      }}
      className={
        className ??
        "inline-flex items-center gap-2 text-caption text-muted transition-colors hover:text-accent-text"
      }
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="size-4"
      >
        <path
          d="M13 8H3M7 4L3 8l4 4"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </Link>
  );
}
