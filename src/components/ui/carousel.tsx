"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * 04_DESIGN_SYSTEM.md §9 — a 300ms slide.
 *
 * Scroll-snap rather than a transform track, so the row stays natively
 * swipeable on the Android phones that make up most of this traffic and
 * degrades to a plain scroller if JavaScript never arrives.
 *
 * DEVIATION from §9, which says "no autoplay": the client asked for the
 * homepage spotlight to advance on its own. Auto-advancing content is a real
 * accessibility hazard, so it is opt-in per instance and comes with the four
 * things WCAG 2.2.2 and common decency require:
 *
 *   - a visible pause control, because moving content must be stoppable
 *   - it never starts under `prefers-reduced-motion: reduce`
 *   - it pauses on hover, on keyboard focus, and while the tab is hidden
 *   - it stops permanently the moment someone scrolls or presses a control,
 *     since a row that yanks itself away mid-read is worse than a static one
 */
export function Carousel({
  children,
  label,
  className,
  itemClassName,
  /** Opt in per instance. Off everywhere §9's rule still stands. */
  autoPlay = false,
  intervalMs = 5000,
}: {
  children: ReactNode[];
  label: string;
  className?: string;
  itemClassName?: string;
  autoPlay?: boolean;
  intervalMs?: number;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [playing, setPlaying] = useState(autoPlay);
  const [interacted, setInteracted] = useState(false);

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

  const move = useCallback((direction: -1 | 1) => {
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
  }, []);

  // Someone who reduces motion should never have this start at all, and the
  // media query can change mid-session.
  useEffect(() => {
    if (!autoPlay) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setPlaying(!query.matches && !interacted);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [autoPlay, interacted]);

  useEffect(() => {
    if (!playing) return;

    const tick = () => {
      // Advancing a carousel nobody is looking at burns battery and lands the
      // visitor somewhere unexpected when they scroll back.
      if (document.hidden) return;
      const track = trackRef.current;
      if (!track) return;

      const end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      if (end) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        move(1);
      }
    };

    const timer = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(timer);
  }, [playing, intervalMs, move]);

  /** Any deliberate interaction ends autoplay for the rest of the visit. */
  const stopForGood = () => {
    setInteracted(true);
    setPlaying(false);
  };

  return (
    <div
      className={className}
      onMouseEnter={() => autoPlay && !interacted && setPlaying(false)}
      onMouseLeave={() => autoPlay && !interacted && setPlaying(true)}
      onFocusCapture={() => autoPlay && !interacted && setPlaying(false)}
      onBlurCapture={() => autoPlay && !interacted && setPlaying(true)}
    >
      <ul
        ref={trackRef}
        aria-label={label}
        onPointerDown={autoPlay ? stopForGood : undefined}
        onWheel={autoPlay ? stopForGood : undefined}
        className={cn(
          "flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2",
          // Bleeds past the container on the right so the next card is visibly
          // cut off, but the FIRST card starts flush with the heading above it.
          // The old rule bled both ways, which left the leading card jammed
          // against the viewport edge while every other element was inset.
          "-mr-6 pr-6 lg:-mr-16 lg:pr-16",
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
          onClick={() => {
            stopForGood();
            move(-1);
          }}
          label={`Previous ${label}`}
        />

        {autoPlay && !interacted ? (
          <button
            type="button"
            onClick={stopForGood}
            aria-label={playing ? `Pause ${label}` : `Play ${label}`}
            className="flex size-11 cursor-pointer items-center justify-center self-start rounded-full border border-hairline text-ink transition-colors hover:border-ink-muted focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
              {playing ? (
                <path d="M3 2h3.5v12H3zM9.5 2H13v12H9.5z" fill="currentColor" />
              ) : (
                <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
              )}
            </svg>
          </button>
        ) : null}

        <CarouselControl
          direction="next"
          disabled={atEnd}
          onClick={() => {
            stopForGood();
            move(1);
          }}
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
        disabled
          ? "cursor-not-allowed text-ink-muted"
          : "cursor-pointer text-ink",
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
