import { ListingType } from "@/generated/prisma/enums";
import { requireTrack } from "@/lib/admin/access";
import { getEstateOptions, nextReference } from "@/lib/admin/queries/listings";
import { saveLandListing } from "@/lib/admin/actions/listings";
import { LandListingForm } from "@/components/admin/listing-form";
import { PageHeader } from "@/components/admin/ui";
import { emptyLandValues } from "@/lib/admin/form-values";

export default async function NewLandListingPage() {
  await requireTrack(ListingType.LAND);
  const [estates, reference] = await Promise.all([
    getEstateOptions(),
    nextReference(ListingType.LAND),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Land"
        title="New plot"
        description="Saved as a draft. Nothing appears on the public site until you publish it."
      />
      <LandListingForm
        values={emptyLandValues(reference)}
        estates={estates}
        action={saveLandListing.bind(null, null)}
      />
    </div>
  );
}
