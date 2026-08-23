import type { Decimal } from "@/generated/prisma/internal/prismaNamespace";

/**
 * Naira, whole units. Nigerian property prices are quoted without kobo, and
 * design system §3 sets figures in tabular numerals so columns of prices align.
 */
const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function formatNaira(value: Decimal | number | string): string {
  return naira.format(Number(value));
}

const decimal = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 });

/** "500 sqm", "2 plots" — unit follows the figure, lowercase, never abbreviated to m². */
export function formatArea(
  size: Decimal | number | string,
  unit: "SQM" | "PLOTS" | "ACRES" | "HECTARES",
): string {
  const amount = Number(size);
  const label = {
    SQM: "sqm",
    PLOTS: amount === 1 ? "plot" : "plots",
    ACRES: amount === 1 ? "acre" : "acres",
    HECTARES: amount === 1 ? "hectare" : "hectares",
  }[unit];

  return `${decimal.format(amount)} ${label}`;
}

/** "Q2 2027" — buyers care about the quarter, not the day, on an unbuilt house. */
export function formatHandover(date: Date): string {
  return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-NG", { month: "long", year: "numeric" });
}

/** Initials for the testimonial avatar fallback — §11 permits only real buyer photographs. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
