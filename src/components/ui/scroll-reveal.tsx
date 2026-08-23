"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * 04_DESIGN_SYSTEM.md §9 — fade and a 12px rise as an element enters view,
 * 400ms ease-out, staggered across a grid.
 *
 * Anyone who has asked for reduced motion gets the finished state immediately,
 * never a fade they did not consent to. Stillness is part of the credibility
 * here, so this is the only motion on the page beyond hover and the carousels.
 */
export function ScrollReveal({
  children,
  delayMs = 0,
  className,
}: {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Reduced motion needs no branch here: the hidden state is expressed only
    // through motion-safe utilities, so it never applies in the first place.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: revealed ? `${delayMs}ms` : "0ms" }}
      className={cn(
        "motion-safe:transition-[opacity,transform] motion-safe:duration-400 motion-safe:ease-out",
        revealed
          ? "translate-y-0 opacity-100"
          : "motion-safe:translate-y-3 motion-safe:opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
