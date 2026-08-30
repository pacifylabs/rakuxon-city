import { notFound } from "next/navigation";
import { ListingType } from "@/generated/prisma/enums";
import { requireTrack } from "@/lib/admin/access";
import {
  getEstateOptions,
  getListingForEdit,
  getStatusHistory,
} from "@/lib/admin/queries/listings";
import { saveHomeListing } from "@/lib/admin/actions/listings";
import { HomeListingForm } from "@/components/admin/listing-form";
import { PageHeader } from "@/components/admin/ui";
import { homeFormValues } from "@/lib/admin/form-values";
import { StatusHistory } from "@/components/admin/status-history";

export default async function EditHomeListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireTrack(ListingType.HOME);
  const { id } = await params;

  const listing = await getListingForEdit(user, id);
  if (!listing || listing.type !== ListingType.HOME) notFound();

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
      <HomeListingForm
        values={homeFormValues(listing)}
        estates={estates}
        action={saveHomeListing.bind(null, id)}
      />
      <StatusHistory entries={history} />
    </div>
  );
}
