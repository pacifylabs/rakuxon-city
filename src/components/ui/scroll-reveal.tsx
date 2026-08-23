"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * 04_DESIGN_SYSTEM.md §9 — fade and a 12px rise as an element enters view,
 * 400ms ease-out, staggered across a grid.
 *
 * The hidden state is expressed in CSS, gated on `[data-js="true"]` which the
 * root layout sets before paint. That matters: hiding on the server and
 * revealing from an observer means anyone without JavaScript — or any tool that
 * does not run it — gets a page of invisible content. The markup is visible by
 * default and only JavaScript takes it away, never the other way round.
 *
 * Reduced motion is handled in the same rule, so anyone who has asked for
 * stillness sees the finished state immediately rather than a fade they did not
 * consent to.
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
      className={cn("reveal", revealed && "is-revealed", className)}
    >
      {children}
    </div>
  );
}
