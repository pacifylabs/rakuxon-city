import {
  ListingModerationStatus,
  ListingStatus,
} from "@/generated/prisma/enums";

/**
 * Public catalogue visibility for listings.
 *
 * Staff listings: `submittedByUserId` is null and `moderationStatus` stays
 * NOT_REQUIRED — unchanged from "not draft".
 *
 * Lister listings: stay off the site until an admin approves, even if someone
 * toggles status by mistake. Approved lister rows must also leave DRAFT.
 */
export function publiclyVisibleListingWhere() {
  return {
    status: { not: ListingStatus.DRAFT },
    OR: [
      { submittedByUserId: null },
      {
        moderationStatus: {
          in: [
            ListingModerationStatus.NOT_REQUIRED,
            ListingModerationStatus.APPROVED,
          ],
        },
      },
    ],
  };
}

export function isListingPubliclyVisible(listing: {
  status: ListingStatus | string;
  submittedByUserId?: string | null;
  moderationStatus?: ListingModerationStatus | string | null;
}): boolean {
  if (listing.status === ListingStatus.DRAFT || listing.status === "DRAFT") {
    return false;
  }
  if (!listing.submittedByUserId) return true;
  const mod = listing.moderationStatus ?? ListingModerationStatus.NOT_REQUIRED;
  return (
    mod === ListingModerationStatus.APPROVED ||
    mod === ListingModerationStatus.NOT_REQUIRED ||
    mod === "APPROVED" ||
    mod === "NOT_REQUIRED"
  );
}
