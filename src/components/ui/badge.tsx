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
 * The signature element (§7). It leads every land card, above the name and
 * before the price, because title is what a Nigerian land buyer is actually
 * anxious about.
 *
 * Survey-only renders in the neutral status-sold palette rather than sage. That
 * is deliberate and it is not a downgrade to hide: a site that shows title
 * honestly beats one that shows it selectively.
 */
export function TitleTypeBadge({ titleType }: { titleType: TitleType }) {
  const weak = titleType === "SURVEY_ONLY";

  return (
    <Badge
      className={cn(
        weak
          ? "bg-status-sold-bg text-status-sold"
          : "bg-accent-tint text-accent",
      )}
    >
      <DocumentGlyph />
      {titleTypeLabels[titleType]}
    </Badge>
  );
}

const buildStageLabels: Record<BuildStage, string> = {
  OFF_PLAN: "Off plan",
  UNDER_CONSTRUCTION: "Under construction",
  COMPLETED: "Completed",
};

export function BuildStageBadge({ buildStage }: { buildStage: BuildStage }) {
  return (
    <Badge className="bg-accent-tint text-accent">
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

function DocumentGlyph() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" className="size-3">
      <path
        d="M3 1.5h3.5L9 4v6.5H3z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 1.5V4H9"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}
