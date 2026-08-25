import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type {
  BuildStage,
  ListingStatus,
  TitleType,
} from "@/generated/prisma/enums";

/**
 * 04_DESIGN_SYSTEM.md §6 and §7. One base, three uses.
 *
 * Status colours are deliberately quiet because a status appears on every card.
 * They are not accents and must never be used as one (§11).
 */
export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-caption",
        className,
      )}
    >
      {children}
    </span>
  );
}

const titleTypeLabels: Record<TitleType, string> = {
  C_OF_O: "C of O",
  GOVERNORS_CONSENT: "Governor's consent",
  GAZETTE: "Gazette",
  DEED_OF_ASSIGNMENT: "Deed of assignment",
  EXCISION: "Excision",
  SURVEY_ONLY: "Survey only",
};

export function titleTypeLabel(titleType: TitleType): string {
  return titleTypeLabels[titleType];
}

/**
 * The signature element (§7).
 *
 * It leads every land card, above the name and before the price, because title
 * is what a Nigerian land buyer is actually anxious about. §7 calls this the
 * one place the design spends boldness, so it carries more weight than any
 * other badge on the card: a glyph specific to the title type, a medium label,
 * and a defined edge.
 *
 * Survey-only renders in the neutral status-sold palette rather than champagne, with
 * its own glyph. That is deliberate and it is not a downgrade to hide: a site
 * that shows title honestly beats one that shows it selectively.
 */
export function TitleTypeBadge({
  titleType,
  extraCount = 0,
}: {
  titleType: TitleType;
  /** Additional title types the plot also holds, surfaced as "+1". */
  extraCount?: number;
}) {
  const weak = titleType === "SURVEY_ONLY";
  const Glyph = titleGlyphs[titleType];

  return (
    <Badge
      className={cn(
        "font-medium ring-1",
        weak
          ? "bg-status-sold-bg text-status-sold ring-status-sold/25"
          : "bg-accent-tint text-accent-text ring-accent-text/25",
      )}
    >
      <Glyph />
      {titleTypeLabels[titleType]}
      {extraCount > 0 ? (
        <span className={weak ? "text-status-sold" : "text-accent-text"}>
          +{extraCount}
        </span>
      ) : null}
    </Badge>
  );
}

/** One glyph per title type, so the strongest titles are recognisable at a glance. */
const titleGlyphs: Record<TitleType, () => React.ReactElement> = {
  // A seal — the strongest instrument.
  C_OF_O: () => (
    <Glyph>
      <circle cx="6" cy="5" r="3.2" stroke="currentColor" strokeWidth="1" />
      <path
        d="M4.4 7.6L3.6 11l2.4-1.2L8.4 11l-.8-3.4"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </Glyph>
  ),
  // A stamp of approval.
  GOVERNORS_CONSENT: () => (
    <Glyph>
      <rect
        x="2"
        y="6.5"
        width="8"
        height="4"
        rx="1"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M6 6.5V4a1.6 1.6 0 10-1.6 1.6"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </Glyph>
  ),
  // A published notice.
  GAZETTE: () => (
    <Glyph>
      <rect
        x="1.8"
        y="2.6"
        width="8.4"
        height="6.8"
        rx="1"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M3.6 4.8h4.8M3.6 6.6h3.2"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </Glyph>
  ),
  // A signed instrument.
  DEED_OF_ASSIGNMENT: () => (
    <Glyph>
      <path
        d="M3 1.8h4L9 4v6.2H3z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M7 1.8V4h2"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M4.6 7.6h2.8"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </Glyph>
  ),
  // Land carved out of a larger holding.
  EXCISION: () => (
    <Glyph>
      <path
        d="M2 3.4l3-1.2 2.4 1.2L10 2.2v6.4l-2.6 1.2L5 8.6 2 9.8z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </Glyph>
  ),
  // A measurement and nothing more.
  SURVEY_ONLY: () => (
    <Glyph>
      <path
        d="M1.8 8.4l6.6-6.6 1.8 1.8-6.6 6.6z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M4.4 5.8l.9.9M6.2 4l.9.9"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </Glyph>
  ),
};

function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className="size-3.5 shrink-0"
    >
      {children}
    </svg>
  );
}

const buildStageLabels: Record<BuildStage, string> = {
  OFF_PLAN: "Off plan",
  UNDER_CONSTRUCTION: "Under construction",
  COMPLETED: "Completed",
};

export function BuildStageBadge({ buildStage }: { buildStage: BuildStage }) {
  return (
    <Badge className="bg-accent-tint text-accent-text">
      {buildStageLabels[buildStage]}
    </Badge>
  );
}

const statusStyles: Record<
  ListingStatus,
  { label: string; className: string }
> = {
  DRAFT: { label: "Draft", className: "bg-status-sold-bg text-status-sold" },
  AVAILABLE: {
    label: "Available",
    className: "bg-status-available-bg text-status-available",
  },
  RESERVED: {
    label: "Reserved",
    className: "bg-status-reserved-bg text-status-reserved",
  },
  SOLD: { label: "Sold", className: "bg-status-sold-bg text-status-sold" },
};

export function StatusBadge({ status }: { status: ListingStatus }) {
  const { label, className } = statusStyles[status];
  return <Badge className={className}>{label}</Badge>;
}
