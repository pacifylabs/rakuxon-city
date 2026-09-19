import "server-only";
import { db } from "@/lib/db";
import { ListingModerationStatus } from "@/generated/prisma/enums";

export async function listListerListings(userId: string) {
  return db.listing.findMany({
    where: { submittedByUserId: userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      reference: true,
      type: true,
      title: true,
      status: true,
      moderationStatus: true,
      rejectionReason: true,
      submittedAt: true,
      updatedAt: true,
    },
  });
}

export async function getListerListingForEdit(
  userId: string,
  listingId: string,
) {
  return db.listing.findFirst({
    where: { id: listingId, submittedByUserId: userId },
    include: {
      landDetail: { include: { documents: { orderBy: { position: "asc" } } } },
      homeDetail: true,
      media: {
        orderBy: { position: "asc" },
        include: { media: true },
      },
    },
  });
}

export async function countListerDashboard(userId: string) {
  const [draft, pending, approved, rejected] = await Promise.all([
    db.listing.count({
      where: {
        submittedByUserId: userId,
        moderationStatus: {
          in: [ListingModerationStatus.DRAFT, ListingModerationStatus.REJECTED],
        },
      },
    }),
    db.listing.count({
      where: {
        submittedByUserId: userId,
        moderationStatus: ListingModerationStatus.PENDING_REVIEW,
      },
    }),
    db.listing.count({
      where: {
        submittedByUserId: userId,
        moderationStatus: ListingModerationStatus.APPROVED,
      },
    }),
    db.listing.count({
      where: {
        submittedByUserId: userId,
        moderationStatus: ListingModerationStatus.REJECTED,
      },
    }),
  ]);

  return { draft, pending, approved, rejected };
}
