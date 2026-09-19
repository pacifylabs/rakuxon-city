"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/access";
import {
  ListingModerationStatus,
  ListingStatus,
} from "@/generated/prisma/enums";

export async function approveListerListing(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const listingId = String(formData.get("listingId") ?? "");

  const listing = await db.listing.findFirst({
    where: {
      id: listingId,
      submittedByUserId: { not: null },
      moderationStatus: ListingModerationStatus.PENDING_REVIEW,
    },
    select: { id: true, status: true },
  });

  if (!listing) return;

  await db.$transaction([
    db.listing.update({
      where: { id: listingId },
      data: {
        status: ListingStatus.AVAILABLE,
        moderationStatus: ListingModerationStatus.APPROVED,
        reviewedAt: new Date(),
        reviewedByUserId: admin.id,
        rejectionReason: null,
        publishedAt: listing.status === ListingStatus.DRAFT ? new Date() : undefined,
      },
    }),
    db.statusChange.create({
      data: {
        listingId,
        fromStatus: listing.status,
        toStatus: ListingStatus.AVAILABLE,
        changedByUserId: admin.id,
      },
    }),
  ]);

  revalidatePath("/admin/moderation");
  revalidatePath("/admin/listings/land");
  revalidatePath("/admin/listings/homes");
  revalidatePath("/land");
  revalidatePath("/homes");
}

export async function rejectListerListing(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const listingId = String(formData.get("listingId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (reason.length < 10) return;

  const listing = await db.listing.findFirst({
    where: {
      id: listingId,
      submittedByUserId: { not: null },
      moderationStatus: ListingModerationStatus.PENDING_REVIEW,
    },
    select: { id: true },
  });

  if (!listing) return;

  await db.listing.update({
    where: { id: listingId },
    data: {
      moderationStatus: ListingModerationStatus.REJECTED,
      reviewedAt: new Date(),
      reviewedByUserId: admin.id,
      rejectionReason: reason,
      status: ListingStatus.DRAFT,
    },
  });

  revalidatePath("/admin/moderation");
  revalidatePath("/portal/listings");
}
