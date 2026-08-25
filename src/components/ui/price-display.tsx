import { cn } from "@/lib/cn";
import { formatNaira } from "@/lib/format";
import type { Decimal } from "@/generated/prisma/internal/prismaNamespace";

/**
 * The one place the published / on-request split is handled — FR-1.5 and
 * 04_DESIGN_SYSTEM.md §6.
 *
 * A price is never blank (§11). A listing carries either a figure or an
 * explicit "Price on request", and the schema invariant in lib/validation makes
 * the third state unrepresentable rather than merely undisplayed.
 */
export function PriceDisplay({
  price,
  priceOnRequest,
  size = "card",
  className,
}: {
  price: Decimal | number | string | null;
  priceOnRequest: boolean;
  size?: "card" | "detail";
  className?: string;
}) {
  if (priceOnRequest || price === null) {
    return (
      <p className={cn("text-heading text-muted", className)}>
        Price on request
      </p>
    );
  }

  return (
    <p
      className={cn(
        "tabular text-foreground",
        size === "detail" ? "text-display-l" : "text-display-m",
        className,
      )}
    >
      {formatNaira(price)}
    </p>
  );
}
