import { requireAdmin } from "@/lib/admin/access";
import {
  previewEstateImport,
  commitEstateImport,
} from "@/lib/admin/actions/import-estates";
import { ImportWizard } from "@/components/admin/import-wizard";
import { ImportGuide } from "@/components/admin/import-guide";
import { PageHeader } from "@/components/admin/ui";

export default async function ImportEstatesPage() {
  await requireAdmin();

  return (
    <div>
      <PageHeader
        eyebrow="Import"
        title="Import estates"
        description="Estates are matched on slug. Import these before the listings that reference them."
      />

      <div className="mt-6">
        <ImportGuide
          required="name, location, state, description"
          optional="slug, amenities, status"
          notes={
            <>
              <code>amenities</code> is pipe-separated (<code>|</code>).{" "}
              <code>slug</code> is generated from the name when omitted, and is
              what listings use to link themselves to an estate. Re-importing a
              slug updates that estate and never changes its status.
            </>
          }
        />
      </div>

      <ImportWizard
        previewAction={previewEstateImport}
        commitAction={commitEstateImport}
        backHref="/admin/import/estates"
        noun="estates"
      />
    </div>
  );
}
