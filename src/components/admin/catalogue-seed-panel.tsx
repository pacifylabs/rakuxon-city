"use client";

import { seedCatalogueAction } from "@/lib/admin/actions/catalogue-seed";
import { ConfirmSubmit } from "@/components/admin/confirm-action";

export function CatalogueSeedPanel() {
  return (
    <section className="rounded-card border border-line bg-surface p-6">
      <h2 className="text-heading text-foreground">Load demo catalogue</h2>
      <p className="mt-1 max-w-prose text-caption text-muted">
        Inserts the curated development seed — about ten listings, two estates,
        guides, videos, and testimonials. Existing catalogue content is replaced
        first. All user accounts stay, including admins, sales, and listers.
      </p>

      <ConfirmSubmit
        action={seedCatalogueAction}
        title="Load demo catalogue?"
        body="This clears current listings, estates, articles, media, and enquiries, then loads the demo seed. User accounts are not touched."
        confirmLabel="Load demo data"
        successMessage="Demo catalogue loaded. User accounts were kept."
        className="mt-5"
      >
        <button
          type="submit"
          className="min-h-11 cursor-pointer rounded-full bg-accent px-6 text-body font-medium text-foreground transition-colors hover:bg-accent-hover"
        >
          Load demo catalogue (keep users)
        </button>
      </ConfirmSubmit>
    </section>
  );
}
