import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * 04_DESIGN_SYSTEM.md §6 (v2.0). Five variants.
 *
 * PALETTE v2.0 changed what `primary` means, not just its colour.
 *
 * Under v1.0/the gold deviation, `primary` WAS the gold-filled call to
 * action, used wherever a page needed its strongest button — which was most
 * pages, most of the time. v2.0 splits that one role into two:
 *
 *   - `primary`: charcoal fill, ivory-light label. The ordinary strong
 *     action — "Explore properties", "Browse plots", "See all estates".
 *     Reach for this by default.
 *   - `accent`: champagne fill, charcoal label. ONE per view, reserved for
 *     the single highest-intent action — enquiring, booking an inspection,
 *     scheduling a viewing. Never the default. Never more than one visible
 *     at a time.
 *
 * Every call site that used the old gold `primary` was re-examined against
 * that "one per view" budget when this migrated — most became `primary`
 * (charcoal), and only the actual enquiry/booking actions kept the gold fill,
 * now spelled `accent`.
 */
type Variant = "primary" | "accent" | "secondary" | "text" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-45";

const variants: Record<Variant, string> = {
  primary:
    "text-body rounded-full bg-primary px-6 py-3 text-ivory-light hover:bg-primary-hover",
  accent:
    "text-body rounded-full bg-accent px-6 py-3 text-foreground hover:bg-accent-hover",
  secondary:
    "text-body rounded-full border border-foreground bg-surface px-6 py-3 text-foreground hover:bg-surface-muted",
  text: "text-body rounded-full text-accent-text hover:text-foreground",
  icon: "size-10 shrink-0 rounded-full bg-primary text-ivory-light hover:bg-primary-hover",
};

type ButtonProps = {
  variant?: Variant;
  children?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<"button">;

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(base, variants[variant], className)}
      {...props}
    >
      {children}
      {variant === "text" ? <ArrowGlyph /> : null}
    </button>
  );
}

type ButtonLinkProps = {
  variant?: Variant;
  href: string;
  children?: ReactNode;
  className?: string;
};

export function ButtonLink({
  variant = "primary",
  href,
  className,
  children,
}: ButtonLinkProps) {
  return (
    <Link href={href} className={cn(base, variants[variant], className)}>
      {children}
      {variant === "text" ? <ArrowGlyph /> : null}
    </Link>
  );
}

/** The trailing arrow on text actions, and the glyph inside the icon action. */
export function ArrowGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn("size-4", className)}
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The 40px circular action sitting bottom-right on a featured card (§6). */
export function IconAction({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(base, variants.icon, className)}
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="size-4"
      >
        <path
          d="M4.5 11.5L11.5 4.5M6 4.5h5.5V10"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
