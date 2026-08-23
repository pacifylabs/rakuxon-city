import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * 04_DESIGN_SYSTEM.md §6. Four variants, no more.
 *
 * Labels are verb-first and sentence case — "Explore properties", never
 * "Submit". Only one accent-filled action belongs in a viewport (§2), so
 * reach for `secondary` or `text` by default and `primary` deliberately.
 */
type Variant = "primary" | "secondary" | "text" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-45";

const variants: Record<Variant, string> = {
  primary:
    "text-body rounded-full bg-accent px-6 py-3 text-white hover:bg-accent-hover",
  secondary:
    "text-body rounded-full border border-accent bg-surface px-6 py-3 text-accent hover:bg-accent-tint",
  text: "text-body rounded-full text-accent hover:text-accent-hover",
  icon: "size-10 shrink-0 rounded-full bg-accent text-white hover:bg-accent-hover",
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
