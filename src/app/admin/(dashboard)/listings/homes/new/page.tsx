import { ListingType } from "@/generated/prisma/enums";
import { requireTrack } from "@/lib/admin/access";
import { getEstateOptions, nextReference } from "@/lib/admin/queries/listings";
import { saveHomeListing } from "@/lib/admin/actions/listings";
import { HomeListingForm } from "@/components/admin/listing-form";
import { PageHeader } from "@/components/admin/ui";
import { emptyHomeValues } from "@/lib/admin/form-values";

export default async function NewHomeListingPage() {
  await requireTrack(ListingType.HOME);
  const [estates, reference] = await Promise.all([
    getEstateOptions(),
    nextReference(ListingType.HOME),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Homes"
        title="New home"
        description="Saved as a draft. Nothing appears on the public site until you publish it."
      />
      <HomeListingForm
        values={emptyHomeValues(reference)}
        estates={estates}
        action={saveHomeListing.bind(null, null)}
      />
    </div>
  );
}
