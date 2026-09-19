import { notFound } from "next/navigation";
import { verifyPortalSession } from "@/lib/portal/access";
import { getListerListingForEdit } from "@/lib/portal/queries/listings";
import { savePortalLandListing } from "@/lib/portal/actions/listings";
import { LandListingForm } from "@/components/admin/listing-form";
import { PortalListingPhotos } from "@/components/portal/listing-photos";
import { landFormValues } from "@/lib/admin/form-values";
import { ListingType } from "@/generated/prisma/enums";
import { hasCloudinary } from "@/lib/env";
import { FormSuccess } from "@/components/admin/ui";

export default async function PortalEditLandPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await verifyPortalSession();
  const { id } = await params;
  const query = await searchParams;

  const listing = await getListerListingForEdit(user.id, id);
  if (!listing || listing.type !== ListingType.LAND) notFound();

  const photos = listing.media.map((entry) => ({
    mediaId: entry.mediaId,
    url: entry.media.url,
    alt: entry.media.alt,
    width: entry.media.width,
    height: entry.media.height,
  }));

  return (
    <div>
      <h1 className="text-display-m text-foreground">Edit land listing</h1>
      <p className="mt-2 text-caption text-muted">{listing.reference}</p>
      {query.saved === "1" ? (
        <div className="mt-4">
          <FormSuccess message="Listing saved." />
        </div>
      ) : null}
      <PortalListingPhotos
        listingId={listing.id}
        photos={photos}
        storageConfigured={hasCloudinary}
      />
      <LandListingForm
        values={landFormValues(listing)}
        estates={[]}
        action={savePortalLandListing.bind(null, id)}
        variant="portal"
        cancelHref="/portal/listings"
      />
    </div>
  );
}
