import type { ReactNode } from "react";

/** The expected-columns panel above each importer. */
export function ImportGuide({
  required,
  optional,
  notes,
}: {
  required: string;
  optional: string;
  notes?: ReactNode;
}) {
  return (
    <section className="rounded-card border border-line bg-surface p-5">
      <h2 className="text-body font-medium text-foreground">
        Expected columns
      </h2>
      <p className="mt-2 text-caption text-muted">
        Header names are matched loosely — <code>Plot Size</code>,{" "}
        <code>plot_size</code> and <code>plotsize</code> all work.
      </p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-caption text-muted">Required</dt>
          <dd className="mt-1 text-caption text-foreground">{required}</dd>
        </div>
        <div>
          <dt className="text-caption text-muted">Optional</dt>
          <dd className="mt-1 text-caption text-foreground">{optional}</dd>
        </div>
      </dl>
      {notes ? (
        <p className="mt-4 border-t border-line pt-4 text-caption text-muted">
          {notes}
        </p>
      ) : null}
    </section>
  );
}
