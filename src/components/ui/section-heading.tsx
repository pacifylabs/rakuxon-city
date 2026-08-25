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
  stats,
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
  /**
   * Live figures under the supporting paragraph.
   *
   * The supporting column is shorter than the heading beside it, which left a
   * hole to its right on every hub — the space the client marked. Rather than
   * pad it, the column now carries something worth reading: counts drawn from
   * the same query that fills the grid below.
   */
  stats?: { label: string; value: string }[];
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
          <p className="mb-4 text-eyebrow text-muted">{eyebrow}</p>
        ) : null}
        <h2 className="text-display-l text-foreground">{heading}</h2>
      </div>

      {supporting || action || note || stats ? (
        <div className={cn("flex flex-col justify-start", supportingColumns)}>
          {supporting ? (
            <p className="max-w-[46ch] text-body text-muted">
              {supporting}
            </p>
          ) : null}

          {action || note ? (
            <>
              {/*
                DEVIATION reverted: an earlier gold-palette session put champagne
                here. Design system v2.0 §7 is explicit that the champagne rule
                "appears nowhere else on the site" outside the title ribbon —
                so this reverts to a plain hairline.
              */}
              <hr className="mt-6 border-t border-line" />
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                {action}
                {note ? (
                  <p className="max-w-[32ch] text-right text-body text-muted">
                    {note}
                  </p>
                ) : null}
              </div>
            </>
          ) : null}

          {stats && stats.length > 0 ? (
            <dl className="mt-8 grid grid-cols-3 gap-x-4 gap-y-2 border-t border-line pt-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-caption text-muted">{stat.label}</dt>
                  <dd className="tabular mt-1 text-display-m text-foreground">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
