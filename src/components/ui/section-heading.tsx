import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The asymmetric pairing from 04_DESIGN_SYSTEM.md §4, encoded once so no page
 * hand-rolls it: heading in columns 1–6, supporting paragraph offset into
 * columns 8–12, a wide gap between them. Never centred.
 *
 * `align="right"` mirrors the pair. The reference alternates sides down the
 * page, which is what keeps a long column of sections from marching.
 */
export function SectionHeading({
  eyebrow,
  heading,
  supporting,
  action,
  note,
  align = "left",
  className,
}: {
  eyebrow?: string;
  heading: ReactNode;
  supporting?: ReactNode;
  /** Sits under the hairline in the supporting column, as in the reference. */
  action?: ReactNode;
  /** Quiet text opposite the action. */
  note?: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  const headingColumns =
    align === "left"
      ? "lg:col-span-6 lg:col-start-1"
      : "lg:col-span-6 lg:col-start-7";
  const supportingColumns =
    align === "left"
      ? "lg:col-span-5 lg:col-start-8 lg:row-start-1"
      : "lg:col-span-5 lg:col-start-1 lg:row-start-1";

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-6",
        className,
      )}
    >
      <div className={headingColumns}>
        {eyebrow ? (
          <p className="mb-4 text-eyebrow text-ink-muted">{eyebrow}</p>
        ) : null}
        <h2 className="text-display-l text-ink">{heading}</h2>
      </div>

      {supporting || action || note ? (
        <div className={cn("flex flex-col justify-start", supportingColumns)}>
          {supporting ? (
            <p className="max-w-[46ch] text-body text-ink-secondary">
              {supporting}
            </p>
          ) : null}

          {action || note ? (
            <>
              <hr className="mt-6 border-t border-hairline" />
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                {action}
                {note ? (
                  <p className="max-w-[32ch] text-right text-body text-ink-muted">
                    {note}
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
