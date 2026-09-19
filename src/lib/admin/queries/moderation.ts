import "server-only";
import { db } from "@/lib/db";
import { ListingModerationStatus } from "@/generated/prisma/enums";

export async function listPendingListerListings() {
  return db.listing.findMany({
    where: { moderationStatus: ListingModerationStatus.PENDING_REVIEW },
    orderBy: { submittedAt: "asc" },
    include: {
      media: {
        orderBy: { position: "asc" },
        take: 4,
        include: { media: true },
      },
      submitter: {
        select: {
          id: true,
          email: true,
          name: true,
          listerProfile: {
            select: {
              displayName: true,
              phone: true,
              organisation: true,
              listerKind: true,
            },
          },
        },
      },
      landDetail: { select: { titleType: true, plotSize: true, plotUnit: true } },
      homeDetail: { select: { bedrooms: true, buildStage: true } },
    },
  });
}
