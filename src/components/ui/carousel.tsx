"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * 04_DESIGN_SYSTEM.md §9 — a 300ms slide, no autoplay.
 *
 * Scroll-snap rather than a transform track, so the row stays natively
 * swipeable on the Android phones that make up most of this traffic and
 * degrades to a plain scroller if JavaScript never arrives.
 */
export function Carousel({
  children,
  label,
  className,
  itemClassName,
}: {
  children: ReactNode[];
  label: string;
  className?: string;
  itemClassName?: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setAtStart(track.scrollLeft <= 4);
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 4);
  }, []);

  useEffect(() => {
    sync();
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      track.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const move = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const first = track.firstElementChild as HTMLElement | null;
    const step = first ? first.clientWidth + 24 : track.clientWidth * 0.8;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    track.scrollBy({
      left: direction * step,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  return (
    <div className={className}>
      <ul
        ref={trackRef}
        aria-label={label}
        className={cn(
          "-mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-2 lg:-mx-16 lg:px-16",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {children.map((child, index) => (
          <li key={index} className={cn("shrink-0 snap-start", itemClassName)}>
            {child}
          </li>
        ))}
      </ul>

      <div className="mt-10 flex items-start justify-center gap-12">
        <CarouselControl
          direction="prev"
          disabled={atStart}
          onClick={() => move(-1)}
          label={`Previous ${label}`}
        />
        <CarouselControl
          direction="next"
          disabled={atEnd}
          onClick={() => move(1)}
          label={`Next ${label}`}
        />
      </div>
    </div>
  );
}

function CarouselControl({
  direction,
  disabled,
  onClick,
  label,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "group flex flex-col items-center gap-2",
        "focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
        disabled ? "cursor-not-allowed text-ink-muted" : "text-ink",
      )}
    >
      <span className="text-body">
        {direction === "prev" ? "Prev" : "Next"}
      </span>
      <svg
        viewBox="0 0 56 8"
        fill="none"
        aria-hidden="true"
        className={cn("h-2 w-14", direction === "prev" && "rotate-180")}
      >
        <path
          d="M0 4h54M50 1l4 3-4 3"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
