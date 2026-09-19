import Link from "next/link";
import { verifyPortalSession } from "@/lib/portal/access";
import { listListerListings } from "@/lib/portal/queries/listings";
import { submitListingForReview } from "@/lib/portal/actions/listings";
import {
  listingStatusLabels,
  moderationStatusLabels,
} from "@/lib/admin/labels";
import { ListingModerationStatus, ListingType } from "@/generated/prisma/enums";

export default async function PortalListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; submitted?: string }>;
}) {
  const user = await verifyPortalSession();
  const listings = await listListerListings(user.id);
  const { saved, submitted } = await searchParams;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="text-display-m text-foreground">My listings</h1>
          <p className="mt-2 text-body text-muted">
            Edit drafts, submit for review, or read feedback from our team.
          </p>
        </div>
        <Link
          href="/portal/listings/new"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-body text-ivory-light hover:bg-primary-hover sm:w-auto"
        >
          Add listing
        </Link>
      </div>

      {saved === "1" ? (
        <p className="mt-6 rounded-card border border-line bg-surface-muted px-4 py-3 text-body text-foreground">
          Draft saved.
        </p>
      ) : null}
      {submitted === "1" ? (
        <p className="mt-6 rounded-card border border-line bg-surface-muted px-4 py-3 text-body text-foreground">
          Submitted for review. We will email you if anything needs changing.
        </p>
      ) : null}

      {listings.length === 0 ? (
        <p className="mt-10 text-body text-muted">You have not added any listings yet.</p>
      ) : (
        <ul className="mt-10 flex flex-col gap-4">
          {listings.map((listing) => {
            const editHref =
              listing.type === ListingType.LAND
                ? `/portal/listings/land/${listing.id}/edit`
                : `/portal/listings/homes/${listing.id}/edit`;
            const canSubmit =
              listing.moderationStatus === ListingModerationStatus.DRAFT ||
              listing.moderationStatus === ListingModerationStatus.REJECTED;

            return (
              <li
                key={listing.id}
                className="rounded-card border border-line bg-surface p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-caption text-muted">{listing.reference}</p>
                    <h2 className="text-body font-medium text-foreground">
                      {listing.title}
                    </h2>
                    <p className="mt-2 text-caption text-muted">
                      {moderationStatusLabels[listing.moderationStatus]} ·{" "}
                      {listingStatusLabels[listing.status]}
                    </p>
                    {listing.rejectionReason ? (
                      <p className="mt-3 max-w-prose text-body text-muted">
                        <span className="text-foreground">Feedback: </span>
                        {listing.rejectionReason}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={editHref}
                      className="text-body text-accent-text underline underline-offset-4"
                    >
                      Edit
                    </Link>
                    {canSubmit ? (
                      <form action={submitListingForReview}>
                        <input type="hidden" name="listingId" value={listing.id} />
                        <button
                          type="submit"
                          className="cursor-pointer text-body text-accent-text underline underline-offset-4"
                        >
                          Submit for review
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
