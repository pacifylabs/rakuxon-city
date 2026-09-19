import { notFound } from "next/navigation";
import { verifyPortalSession } from "@/lib/portal/access";
import { getListerListingForEdit } from "@/lib/portal/queries/listings";
import { savePortalHomeListing } from "@/lib/portal/actions/listings";
import { HomeListingForm } from "@/components/admin/listing-form";
import { PortalListingPhotos } from "@/components/portal/listing-photos";
import { homeFormValues } from "@/lib/admin/form-values";
import { ListingType } from "@/generated/prisma/enums";
import { hasCloudinary } from "@/lib/env";
import { FormSuccess } from "@/components/admin/ui";

export default async function PortalEditHomePage({
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
  if (!listing || listing.type !== ListingType.HOME) notFound();

  const photos = listing.media.map((entry) => ({
    mediaId: entry.mediaId,
    url: entry.media.url,
    alt: entry.media.alt,
    width: entry.media.width,
    height: entry.media.height,
  }));

  return (
    <div>
      <h1 className="text-display-m text-foreground">Edit home listing</h1>
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
      <HomeListingForm
        values={homeFormValues(listing)}
        estates={[]}
        action={savePortalHomeListing.bind(null, id)}
        variant="portal"
        cancelHref="/portal/listings"
      />
    </div>
  );
}
