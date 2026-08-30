import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The filter row above every admin list.
 *
 * A plain GET form, so a filtered view is a shareable URL and the back button
 * behaves — the same reasoning the public hubs use. Search sits in its own
 * bordered field with the selects beside it and the actions pinned right, so
 * the row reads as one control rather than a scatter of inputs.
 */
export function FilterBar({
  action,
  searchName = "q",
  searchValue,
  searchPlaceholder,
  children,
  activeCount,
}: {
  /** Where "Clear" goes — the same route with no query. */
  action: string;
  searchName?: string;
  searchValue?: string;
  searchPlaceholder: string;
  /** The `<FilterSelect>`s for this list. */
  children?: ReactNode;
  /** How many filters are set, for the Clear affordance. */
  activeCount: number;
}) {
  return (
    <form
      method="get"
      className="flex flex-col gap-3 rounded-card border border-line bg-surface p-3 sm:flex-row sm:flex-wrap sm:items-center"
    >
      <div className="relative flex-1 sm:min-w-64">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </span>
        <input
          type="search"
          name={searchName}
          defaultValue={searchValue ?? ""}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="min-h-10 w-full rounded-control border border-line-input bg-background pr-3 pl-9 text-body text-foreground placeholder:text-muted focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-foreground focus-visible:outline-none"
        />
      </div>

      {children}

      <div className="flex items-center gap-2 sm:ml-auto">
        <button
          type="submit"
          className="min-h-10 cursor-pointer rounded-control bg-primary px-4 text-body text-ivory-light transition-colors hover:bg-primary-hover"
        >
          Apply
        </button>
        {activeCount > 0 ? (
          <Link
            href={action}
            className="min-h-10 rounded-control px-3 py-2 text-body text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            Clear
            {activeCount > 1 ? ` (${activeCount})` : ""}
          </Link>
        ) : null}
      </div>
    </form>
  );
}

export function FilterSelect({
  name,
  label,
  value,
  options,
  anyLabel,
}: {
  name: string;
  label: string;
  value?: string;
  options: { value: string; label: string }[];
  anyLabel: string;
}) {
  return (
    <select
      name={name}
      defaultValue={value ?? ""}
      aria-label={label}
      className="min-h-10 rounded-control border border-line-input bg-background px-3 text-body text-foreground focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-foreground focus-visible:outline-none"
    >
      <option value="">{anyLabel}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function FilterCheckbox({
  name,
  label,
  checked,
}: {
  name: string;
  label: string;
  checked: boolean;
}) {
  return (
    <label className="flex min-h-10 items-center gap-2 px-1 text-body text-foreground">
      <input type="checkbox" name={name} value="1" defaultChecked={checked} />
      {label}
    </label>
  );
}
