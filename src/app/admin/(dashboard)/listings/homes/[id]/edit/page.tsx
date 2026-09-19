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
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { moderationStatusLabels } from "@/lib/admin/labels";
import { homeFormValues } from "@/lib/admin/form-values";
import { StatusHistory } from "@/components/admin/status-history";
import { AdminListingPhotos } from "@/components/admin/listing-photos";
import { allMediaOptions } from "@/lib/admin/queries/media";
import { hasCloudinary } from "@/lib/env";

export default async function EditHomeListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireTrack(ListingType.HOME);
  const { id } = await params;

  const listing = await getListingForEdit(user, id);
  if (!listing || listing.type !== ListingType.HOME) notFound();

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
      <HomeListingForm
        values={homeFormValues(listing)}
        estates={estates}
        action={saveHomeListing.bind(null, id)}
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
