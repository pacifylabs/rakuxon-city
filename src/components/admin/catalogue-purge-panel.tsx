"use client";

import { purgeSeededCatalogueAction } from "@/lib/admin/actions/catalogue-purge";
import { ConfirmSubmit } from "@/components/admin/confirm-action";

export function CataloguePurgePanel() {
  return (
    <section className="rounded-card border border-error/30 bg-surface p-6">
      <h2 className="text-heading text-foreground">Clear catalogue data</h2>
      <p className="mt-1 max-w-prose text-caption text-muted">
        Removes seeded listings, estates, articles, media, enquiries, and related
        records in one step. All user accounts stay — including admins, sales, and
        listers.
      </p>

      <ConfirmSubmit
        action={purgeSeededCatalogueAction}
        title="Clear all catalogue content?"
        body="This cannot be undone. User accounts are kept, but every listing, estate, article, video, testimonial, and media library item will be deleted."
        confirmLabel="Clear catalogue"
        successMessage="Catalogue cleared. User accounts were kept."
        className="mt-5"
      >
        <button
          type="submit"
          className="min-h-11 cursor-pointer rounded-full border border-error/40 px-6 text-body text-error transition-colors hover:bg-error/5"
        >
          Clear catalogue (keep users)
        </button>
      </ConfirmSubmit>
    </section>
  );
}
