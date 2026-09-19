"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { hasCloudinary } from "@/lib/env";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "@/lib/admin/cloudinary";
import { verifyPortalSession } from "@/lib/portal/access";
import { mediaSchema } from "@/lib/validation/media";
import { checkDimensions, presetFor } from "@/lib/admin/media-presets";
import { ListingModerationStatus, ListingType } from "@/generated/prisma/enums";

export type PortalMediaActionState = { error?: string; success?: string } | null;

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

async function assertListerOwnsListing(userId: string, listingId: string) {
  const listing = await db.listing.findFirst({
    where: { id: listingId, submittedByUserId: userId },
    select: { moderationStatus: true, type: true },
  });
  if (!listing) return { error: "Listing not found." as const, listing: null };
  if (listing.moderationStatus === ListingModerationStatus.PENDING_REVIEW) {
    return {
      error: "This listing is awaiting review. Photos cannot be changed until the review finishes.",
      listing: null,
    };
  }
  return { error: null, listing };
}

export async function uploadPortalListingPhoto(
  _prev: PortalMediaActionState,
  formData: FormData,
): Promise<PortalMediaActionState> {
  const user = await verifyPortalSession();

  if (!hasCloudinary) {
    return {
      error:
        "Photo uploads are not available yet. Ask the site team to enable image storage.",
    };
  }

  const listingId = String(formData.get("listingId") ?? "");
  const owned = await assertListerOwnsListing(user.id, listingId);
  if (owned.error || !owned.listing) return { error: owned.error ?? "Listing not found." };

  const file = formData.get("file");
  const alt = String(formData.get("alt") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a photo to upload." };
  }
  if (!ACCEPTED.includes(file.type)) {
    return { error: "Upload a JPEG, PNG, WebP or AVIF image." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "That image is larger than 8MB. Compress it first." };
  }
  if (alt.length < 3) {
    return { error: "Describe the photo for screen readers (at least a few words)." };
  }

  const preset = presetFor("card");
  if (!preset) {
    return { error: "Upload configuration is missing." };
  }

  try {
    const uploaded = await uploadToCloudinary(
      file,
      `rakuxon/listers/${user.id}`,
    );

    const problem = checkDimensions(preset, uploaded.width, uploaded.height);
    if (problem) {
      await deleteFromCloudinary(uploaded.url);
      return { error: problem };
    }

    const parsed = mediaSchema.safeParse({
      url: uploaded.url,
      alt,
      width: uploaded.width,
      height: uploaded.height,
      mimeType: `image/${uploaded.format}`,
      sizeBytes: uploaded.bytes,
    });

    if (!parsed.success) {
      await deleteFromCloudinary(uploaded.url);
      return { error: parsed.error.issues[0]?.message ?? "Invalid image data." };
    }

    const maxPosition = await db.listingMedia.aggregate({
      where: { listingId },
      _max: { position: true },
    });
    const position = (maxPosition._max.position ?? -1) + 1;

    const media = await db.media.create({
      data: { ...parsed.data, isStandIn: false },
    });

    await db.listingMedia.create({
      data: { listingId, mediaId: media.id, position },
    });
  } catch (error) {
    console.error("[portal] listing photo upload failed", error);
    return { error: "Upload failed. Please try again." };
  }

  const track =
    owned.listing.type === ListingType.LAND ? "land" : "homes";
  revalidatePath(`/portal/listings/${track}/${listingId}/edit`);
  return { success: "Photo added." };
}

export async function removePortalListingPhoto(
  formData: FormData,
): Promise<void> {
  const user = await verifyPortalSession();
  const listingId = String(formData.get("listingId") ?? "");
  const mediaId = String(formData.get("mediaId") ?? "");

  const owned = await assertListerOwnsListing(user.id, listingId);
  if (owned.error || !owned.listing) return;

  const link = await db.listingMedia.findUnique({
    where: { listingId_mediaId: { listingId, mediaId } },
    include: { media: true },
  });
  if (!link) return;

  await db.$transaction([
    db.listingMedia.delete({
      where: { listingId_mediaId: { listingId, mediaId } },
    }),
    db.media.delete({ where: { id: mediaId } }),
  ]);

  await deleteFromCloudinary(link.media.url);

  const track = owned.listing.type === ListingType.LAND ? "land" : "homes";
  revalidatePath(`/portal/listings/${track}/${listingId}/edit`);
}
