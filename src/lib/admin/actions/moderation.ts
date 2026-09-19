"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/access";
import { origin } from "@/lib/seo";
import { sendEmail } from "@/lib/email/send";
import {
  listingApprovedEmail,
  listingRejectedEmail,
} from "@/lib/email/templates";
import { createPortalNotification } from "@/lib/portal/notifications";
import {
  ListingModerationStatus,
  ListingStatus,
  ListingType,
  PortalNotificationKind,
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
    select: {
      id: true,
      status: true,
      title: true,
      slug: true,
      type: true,
      submittedByUserId: true,
      submitter: { select: { email: true, name: true } },
    },
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

  const lister = listing.submitter;
  const segment = listing.type === ListingType.LAND ? "land" : "homes";
  const publicUrl = `${origin()}/${segment}/${listing.slug}`;

  if (listing.submittedByUserId) {
    void createPortalNotification({
      userId: listing.submittedByUserId,
      kind: PortalNotificationKind.LISTING_APPROVED,
      title: `Listing approved: ${listing.title}`,
      body: "Your listing is now live on Rakuxon City.",
      href: publicUrl,
    });
  }

  if (lister?.email) {
    const message = listingApprovedEmail({
      name: lister.name,
      listingTitle: listing.title,
      publicUrl,
    });
    void sendEmail({
      to: lister.email,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
  }

  revalidatePath("/portal");
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
    select: {
      id: true,
      title: true,
      type: true,
      submittedByUserId: true,
      submitter: { select: { email: true, name: true } },
    },
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

  const lister = listing.submitter;
  const segment = listing.type === ListingType.LAND ? "land" : "homes";
  const editUrl = `${origin()}/portal/listings/${segment}/${listing.id}/edit`;

  if (listing.submittedByUserId) {
    void createPortalNotification({
      userId: listing.submittedByUserId,
      kind: PortalNotificationKind.LISTING_REJECTED,
      title: `Changes needed: ${listing.title}`,
      body: reason,
      href: editUrl,
    });
  }

  if (lister?.email) {
    const message = listingRejectedEmail({
      name: lister.name,
      listingTitle: listing.title,
      reason,
      editUrl,
    });
    void sendEmail({
      to: lister.email,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
  }

  revalidatePath("/portal");
}
