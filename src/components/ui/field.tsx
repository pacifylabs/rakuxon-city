import type {
  ComponentPropsWithoutRef,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

/**
 * 04_DESIGN_SYSTEM.md §6 — 44px minimum for touch, surface fill,
 * `line-input` border, 2px charcoal focus ring and no glow.
 *
 * §2 rule 3: form fields take `line-input`, not the decorative `line` —
 * WCAG 1.4.11 requires 3:1 for an interactive boundary and the hairline does
 * not clear it. Focus is charcoal, not champagne, which fails as a focus
 * indicator.
 *
 * Errors sit inline beneath the field and say what to do rather than what went
 * wrong: "Enter a phone number we can reach you on", never "Invalid input".
 */
const control =
  "text-body text-foreground placeholder:text-muted min-h-11 w-full rounded-control border border-line-input " +
  "bg-surface px-4 py-2.5 transition-colors " +
  "focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground " +
  "disabled:cursor-not-allowed disabled:bg-background disabled:text-muted";

const errorControl = "border-error focus:border-error focus:ring-error";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-caption text-muted">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p className="text-caption text-muted">{hint}</p>
      ) : null}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-caption text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = { error?: boolean } & ComponentPropsWithoutRef<"input">;

export function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      className={cn(control, error && errorControl, className)}
      aria-invalid={error || undefined}
      {...props}
    />
  );
}

type TextareaProps = { error?: boolean } & ComponentPropsWithoutRef<"textarea">;

export function Textarea({
  className,
  error,
  rows = 4,
  ...props
}: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(control, "resize-y", error && errorControl, className)}
      aria-invalid={error || undefined}
      {...props}
    />
  );
}

type SelectProps = {
  error?: boolean;
} & SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, error, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        control,
        "appearance-none pr-10",
        error && errorControl,
        className,
      )}
      aria-invalid={error || undefined}
      {...props}
    >
      {children}
    </select>
  );
}

type CheckboxProps = {
  label: ReactNode;
  error?: string;
} & ComponentPropsWithoutRef<"input">;

export function Checkbox({
  label,
  error,
  className,
  id,
  ...props
}: CheckboxProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={id}
        className="flex items-start gap-3 text-caption text-muted"
      >
        <input
          id={id}
          type="checkbox"
          className={cn(
            "mt-0.5 size-4 shrink-0 rounded-[4px] border border-line-input text-accent-text accent-accent",
            "focus:ring-2 focus:ring-foreground focus:outline-none",
            "disabled:cursor-not-allowed",
          )}
          {...props}
        />
        <span>{label}</span>
      </label>
      {error ? <p className="text-caption text-error">{error}</p> : null}
    </div>
  );
}
