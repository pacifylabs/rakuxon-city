import { requireAdmin } from "@/lib/admin/access";
import { ListingType } from "@/generated/prisma/enums";
import { previewImport, commitImport } from "@/lib/admin/actions/import";
import { ImportWizard } from "@/components/admin/import-wizard";
import { ImportGuide } from "@/components/admin/import-guide";
import { PageHeader } from "@/components/admin/ui";

export default async function ImportLandPage() {
  await requireAdmin();

  return (
    <div>
      <PageHeader
        eyebrow="Import"
        title="Import land listings"
        description="Every row becomes a draft plot. Nothing reaches the public site until you publish it."
      />

      <div className="mt-6">
        <ImportGuide
          required="reference, title, description, location, state, plotSize, titleType, and either price or priceOnRequest"
          optional="slug, estate, plotUnit, surveyNumber, topography, roadAccess, documents"
          notes={
            <>
              <code>titleType</code> is one of <code>c_of_o</code>,{" "}
              <code>governors_consent</code>, <code>gazette</code>,{" "}
              <code>deed_of_assignment</code>, <code>excision</code> or{" "}
              <code>survey_only</code>. <code>plotUnit</code> defaults to{" "}
              <code>sqm</code> when the column is absent. <code>documents</code>{" "}
              is pipe-separated (<code>|</code>), not comma-separated.{" "}
              <code>estate</code> takes an estate slug and must already exist.
              Re-importing a reference updates that plot and never changes its
              published status.
            </>
          }
        />
      </div>

      <ImportWizard
        previewAction={previewImport.bind(null, ListingType.LAND)}
        commitAction={commitImport}
        backHref="/admin/import/land"
        noun="land listings"
      />
    </div>
  );
}
