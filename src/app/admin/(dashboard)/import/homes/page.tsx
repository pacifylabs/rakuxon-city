import { requireAdmin } from "@/lib/admin/access";
import { ListingType } from "@/generated/prisma/enums";
import { previewImport, commitImport } from "@/lib/admin/actions/import";
import { ImportWizard } from "@/components/admin/import-wizard";
import { ImportGuide } from "@/components/admin/import-guide";
import { PageHeader } from "@/components/admin/ui";

export default async function ImportHomesPage() {
  await requireAdmin();

  return (
    <div>
      <PageHeader
        eyebrow="Import"
        title="Import home listings"
        description="Every row becomes a draft home. Nothing reaches the public site until you publish it."
      />

      <div className="mt-6">
        <ImportGuide
          required="reference, title, description, location, state, bedrooms, bathrooms, houseType, buildStage, builtArea, landArea, finishingSpec, and either price or priceOnRequest"
          optional="slug, estate, features"
          notes={
            <>
              <code>houseType</code> and <code>buildStage</code> take the values
              listed in the picker on the home edit screen.{" "}
              <code>finishingSpec</code> needs at least 10 characters.{" "}
              <code>features</code> is pipe-separated (<code>|</code>), not
              comma-separated. <code>estate</code> takes an estate slug and must
              already exist. Re-importing a reference updates that home and
              never changes its published status.
            </>
          }
        />
      </div>

      <ImportWizard
        previewAction={previewImport.bind(null, ListingType.HOME)}
        commitAction={commitImport}
        backHref="/admin/import/homes"
        noun="home listings"
      />
    </div>
  );
}
