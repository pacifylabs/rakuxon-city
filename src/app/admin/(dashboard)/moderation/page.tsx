import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/admin/access";
import { listPendingListerListings } from "@/lib/admin/queries/moderation";
import {
  approveListerListing,
  rejectListerListing,
} from "@/lib/admin/actions/moderation";
import { PageHeader } from "@/components/admin/ui";
import {
  listerKindLabels,
  titleTypeLabels,
  buildStageLabels,
} from "@/lib/admin/labels";
import { ListingType } from "@/generated/prisma/enums";

export default async function ModerationPage() {
  await requireAdmin();
  const pending = await listPendingListerListings();

  return (
    <div>
      <PageHeader
        eyebrow="Portal"
        title="Lister moderation"
        description="Approve or reject property submissions before they appear on the public site."
        action={
          <Link
            href="/admin/listers"
            className="text-body text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            All listers
          </Link>
        }
      />

      {pending.length === 0 ? (
        <p className="mt-8 text-body text-muted">No listings awaiting review.</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-6">
          {pending.map((listing) => {
            const profile = listing.submitter?.listerProfile;
            const track =
              listing.type === ListingType.LAND ? "land" : "homes";
            return (
              <li
                key={listing.id}
                className="rounded-card border border-line bg-surface p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-caption text-muted">{listing.reference}</p>
                    <h2 className="text-body font-medium text-foreground">
                      <Link
                        href={`/admin/listings/${track}/${listing.id}/edit`}
                        className="text-accent-text underline-offset-4 hover:underline"
                      >
                        {listing.title}
                      </Link>
                    </h2>
                    <p className="mt-2 text-caption text-muted">
                      {listing.location}, {listing.state}
                    </p>
                    {profile && listing.submitter ? (
                      <p className="mt-3 text-body text-muted">
                        <Link
                          href={`/admin/listers/${listing.submitter.id}`}
                          className="text-accent-text underline-offset-4 hover:underline"
                        >
                          {profile.displayName}
                        </Link>
                        {profile.organisation ? ` · ${profile.organisation}` : ""}{" "}
                        · {listerKindLabels[profile.listerKind]} · {profile.phone}{" "}
                        · {listing.submitter.email}
                      </p>
                    ) : null}
                    {listing.landDetail ? (
                      <p className="mt-2 text-caption text-muted">
                        Land · {titleTypeLabels[listing.landDetail.titleType]} ·{" "}
                        {listing.landDetail.plotSize.toString()}{" "}
                        {listing.landDetail.plotUnit}
                      </p>
                    ) : null}
                    {listing.homeDetail ? (
                      <p className="mt-2 text-caption text-muted">
                        Home · {listing.homeDetail.bedrooms} bed ·{" "}
                        {buildStageLabels[listing.homeDetail.buildStage]}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-caption text-muted">
                    Public URL after approval:{" "}
                    {listing.type === ListingType.LAND ? "/land" : "/homes"}/
                    {listing.slug}
                  </p>
                </div>

                {listing.media.length > 0 ? (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {listing.media.map((entry) => (
                      <li
                        key={entry.mediaId}
                        className="relative size-20 overflow-hidden rounded-control border border-line"
                      >
                        <Image
                          src={entry.media.url}
                          alt={entry.media.alt}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-caption text-muted">
                    No photos attached — consider rejecting until the lister adds
                    gallery images.
                  </p>
                )}

                <p className="mt-4 max-w-prose text-body text-muted line-clamp-4">
                  {listing.description}
                </p>

                <div className="mt-6 flex flex-wrap items-end gap-6">
                  <form action={approveListerListing}>
                    <input type="hidden" name="listingId" value={listing.id} />
                    <button
                      type="submit"
                      className="min-h-10 cursor-pointer rounded-full bg-primary px-5 text-body text-ivory-light hover:bg-primary-hover"
                    >
                      Approve and publish
                    </button>
                  </form>

                  <form
                    action={rejectListerListing}
                    className="flex flex-1 flex-wrap items-end gap-3"
                  >
                    <input type="hidden" name="listingId" value={listing.id} />
                    <label className="flex min-w-[16rem] flex-1 flex-col gap-1">
                      <span className="text-caption text-muted">
                        Rejection reason (shown to lister)
                      </span>
                      <input
                        name="reason"
                        required
                        minLength={10}
                        placeholder="Explain what must change before approval"
                        className="min-h-10 rounded-control border border-line bg-surface px-3 text-body placeholder:text-muted"
                      />
                    </label>
                    <button
                      type="submit"
                      className="min-h-10 cursor-pointer rounded-full border border-line px-5 text-body text-foreground hover:bg-surface-muted"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
