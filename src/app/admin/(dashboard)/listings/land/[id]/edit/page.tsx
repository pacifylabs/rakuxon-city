import { notFound } from "next/navigation";
import { ListingType } from "@/generated/prisma/enums";
import { requireTrack } from "@/lib/admin/access";
import {
  getEstateOptions,
  getListingForEdit,
  getStatusHistory,
} from "@/lib/admin/queries/listings";
import { saveLandListing } from "@/lib/admin/actions/listings";
import { LandListingForm } from "@/components/admin/listing-form";
import { PageHeader } from "@/components/admin/ui";
import { landFormValues } from "@/lib/admin/form-values";
import { StatusHistory } from "@/components/admin/status-history";

export default async function EditLandListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireTrack(ListingType.LAND);
  const { id } = await params;

  const listing = await getListingForEdit(user, id);
  // `getListingForEdit` returns null both when the row is missing and when it
  // belongs to a track this user cannot see — deliberately the same outcome,
  // so a wrong guess at a URL cannot confirm a listing exists.
  if (!listing || listing.type !== ListingType.LAND) notFound();

  const [estates, history] = await Promise.all([
    getEstateOptions(),
    getStatusHistory(id),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow={listing.reference}
        title={listing.title}
        description="Changes go live immediately for a published listing."
      />
      <LandListingForm
        values={landFormValues(listing)}
        estates={estates}
        action={saveLandListing.bind(null, id)}
      />
      <StatusHistory entries={history} />
    </div>
  );
}
