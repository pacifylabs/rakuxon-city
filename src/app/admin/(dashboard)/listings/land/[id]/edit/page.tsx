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
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { moderationStatusLabels } from "@/lib/admin/labels";
import { landFormValues } from "@/lib/admin/form-values";
import { StatusHistory } from "@/components/admin/status-history";
import { AdminListingPhotos } from "@/components/admin/listing-photos";
import { allMediaOptions } from "@/lib/admin/queries/media";
import { hasCloudinary } from "@/lib/env";

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

  const [estates, history, libraryMedia] = await Promise.all([
    getEstateOptions(),
    getStatusHistory(id),
    allMediaOptions(),
  ]);

  const photos = listing.media.map((entry) => ({
    mediaId: entry.mediaId,
    url: entry.media.url,
    alt: entry.media.alt,
    width: entry.media.width,
    height: entry.media.height,
  }));

  const libraryOptions = libraryMedia.map((item) => ({
    id: item.id,
    label: item.isStandIn ? `${item.alt} (stand-in)` : item.alt,
  }));

  return (
    <div>
      <PageHeader
        eyebrow={listing.reference}
        title={listing.title}
        description="Changes go live immediately for a published listing."
      />
      {listing.submitter ? (
        <p className="mt-4 max-w-[60ch] rounded-card border border-line bg-surface px-4 py-3 text-body text-muted">
          Posted by{" "}
          <Link
            href={`/admin/listers/${listing.submitter.id}`}
            className="text-accent-text underline-offset-4 hover:underline"
          >
            {listing.submitter.listerProfile?.displayName ??
              listing.submitter.name}
          </Link>
          {" · "}
          {moderationStatusLabels[listing.moderationStatus]}
        </p>
      ) : null}
      <LandListingForm
        values={landFormValues(listing)}
        estates={estates}
        action={saveLandListing.bind(null, id)}
      />
      <AdminListingPhotos
        listingId={listing.id}
        photos={photos}
        libraryOptions={libraryOptions}
        storageConfigured={hasCloudinary}
      />
      <StatusHistory entries={history} />
    </div>
  );
}
