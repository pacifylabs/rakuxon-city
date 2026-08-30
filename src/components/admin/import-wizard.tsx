"use client";

import { useActionState } from "react";
import type { ImportState } from "@/lib/admin/actions/import";
import { FormError, FormSuccess, DataTable, Td } from "@/components/admin/ui";

/**
 * Upload → validate → review → commit.
 *
 * Two separate actions rather than one, because the review step is the whole
 * point: a spreadsheet with three bad rows out of two hundred should show
 * exactly which three, and let the admin decide whether to fix them first or
 * import the rest and come back.
 */
export function ImportWizard({
  previewAction: previewFn,
  commitAction: commitFn,
  backHref,
  noun,
}: {
  /** Bound by the route, so land/homes/estates each get their own target. */
  previewAction: (prev: ImportState, formData: FormData) => Promise<ImportState>;
  commitAction: (prev: ImportState, formData: FormData) => Promise<ImportState>;
  backHref: string;
  noun: string;
}) {
  const [previewState, previewAction, previewing] = useActionState(
    previewFn,
    null,
  );
  const [commitState, commitAction, committing] = useActionState(
    commitFn,
    null,
  );

  const result = commitState?.committed;

  if (result) {
    return (
      <div className="mt-8 max-w-2xl">
        <FormSuccess
          message={`Imported. ${result.created} created, ${result.updated} updated${
            result.skipped > 0 ? `, ${result.skipped} skipped` : ""
          }.`}
        />
        <p className="mt-4 text-body text-muted">
          Everything imported is a draft. Review and publish it from the{" "}
          {noun} screen.
        </p>
        <a
          href={backHref}
          className="mt-6 inline-flex min-h-11 items-center rounded-full border border-line px-5 text-body text-foreground hover:bg-surface-muted"
        >
          Import another file
        </a>
      </div>
    );
  }

  const preview = previewState?.preview;

  return (
    <div className="mt-8">
      {!preview ? (
        <form action={previewAction} className="flex max-w-xl flex-col gap-5">
          <FormError message={previewState?.error} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="file" className="text-caption text-muted">
              CSV file
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept=".csv,text/csv"
              required
              className="w-full rounded-control border border-line-input bg-surface px-4 py-2.5 text-body text-foreground"
            />
            <p className="text-caption text-muted">
              Up to 500 rows and 2MB. Nothing is written until you review and
              confirm.
            </p>
          </div>

          <button
            type="submit"
            disabled={previewing}
            className="min-h-11 cursor-pointer self-start rounded-full bg-primary px-6 text-body text-ivory-light transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
          >
            {previewing ? "Checking…" : "Check the file"}
          </button>
        </form>
      ) : (
        <div>
          <div className="flex flex-wrap items-center gap-4 rounded-card border border-line bg-surface p-5">
            <div>
              <p className="text-body text-foreground">{preview.filename}</p>
              <p className="mt-1 text-caption text-muted">
                <span className="tabular">{preview.validCount}</span> ready to
                import ·{" "}
                <span className="tabular">{preview.errorCount}</span> with
                problems
              </p>
            </div>

            {preview.validCount > 0 ? (
              <form action={commitAction} className="ml-auto">
                <input type="hidden" name="payload" value={preview.payload} />
                <input type="hidden" name="filename" value={preview.filename} />
                <button
                  type="submit"
                  disabled={committing}
                  className="min-h-11 cursor-pointer rounded-full bg-primary px-6 text-body text-ivory-light transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
                >
                  {committing
                    ? "Importing…"
                    : `Import ${preview.validCount} row${preview.validCount === 1 ? "" : "s"}`}
                </button>
              </form>
            ) : null}
          </div>

          <FormError message={commitState?.error} />

          <div className="mt-6">
            <DataTable headers={["Row", "Reference", "Title", "Status"]}>
              {preview.rows.map((row) => (
                <tr key={row.lineNumber}>
                  <Td className="tabular text-muted">{row.lineNumber}</Td>
                  <Td className="tabular">{row.reference || "—"}</Td>
                  <Td>{row.title || "—"}</Td>
                  <Td>
                    {row.errors.length === 0 ? (
                      <span className="text-caption text-status-available">
                        Ready
                      </span>
                    ) : (
                      <ul className="flex flex-col gap-1">
                        {row.errors.map((error, index) => (
                          <li key={index} className="text-caption text-error">
                            {error.column}: {error.message}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Td>
                </tr>
              ))}
            </DataTable>
          </div>
        </div>
      )}
    </div>
  );
}
