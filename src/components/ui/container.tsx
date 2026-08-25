import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * 04_DESIGN_SYSTEM.md §4 — max 1280px, 24px gutters, 64px from lg.
 * The column rules that sit behind content are rendered once per page by
 * `ColumnRules`, not per container, so they run the full page height.
 */
export function Container({
  as: Tag = "div",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cn("mx-auto w-full max-w-[1280px] px-6 lg:px-16", className)}
    >
      {children}
    </Tag>
  );
}

/**
 * Vertical rhythm from §4: 96px between sections on desktop, 64px on mobile.
 * Generous whitespace is the design — resist filling it.
 */
export function Section({
  className,
  children,
  id,
}: {
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-16 lg:py-24", className)}>
      {children}
    </section>
  );
}

/**
 * The faint verticals at the container edges, at 40% opacity, hidden below lg.
 * Fixed rather than absolute so they run the height of the page behind content,
 * as they do in the reference layout.
 */
export function ColumnRules() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 hidden justify-center lg:flex"
    >
      <div className="h-full w-full max-w-[1280px] border-x border-line/40" />
    </div>
  );
}
