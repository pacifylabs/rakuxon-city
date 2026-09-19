"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { hasCloudinary } from "@/lib/env";
import { requireStaff } from "@/lib/admin/access";
import { canAccessTrack } from "@/lib/admin/access";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "@/lib/admin/cloudinary";
import { mediaSchema } from "@/lib/validation/media";
import { checkDimensions, presetFor } from "@/lib/admin/media-presets";
import { ListingType } from "@/generated/prisma/enums";
import { getMediaUsage, totalUsage } from "@/lib/admin/queries/media";

export type ListingMediaActionState = { error?: string; success?: string } | null;

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

async function listingForMediaEdit(listingId: string) {
  const user = await requireStaff();
  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { id: true, type: true },
  });
  if (!listing || !canAccessTrack(user, listing.type)) return null;
  return listing;
}

function revalidateListingEdit(type: ListingType, listingId: string) {
  const track = type === ListingType.LAND ? "land" : "homes";
  revalidatePath(`/admin/listings/${track}/${listingId}/edit`);
  revalidatePath(`/admin/listings/${track}`);
  revalidatePath(type === ListingType.LAND ? "/land" : "/homes");
}

export async function uploadAdminListingPhoto(
  _prev: ListingMediaActionState,
  formData: FormData,
): Promise<ListingMediaActionState> {
  await requireStaff();

  if (!hasCloudinary) {
    return {
      error:
        "Photo uploads are not enabled. Configure Cloudinary or attach an image from the media library.",
    };
  }

  const listingId = String(formData.get("listingId") ?? "");
  const listingRow = await listingForMediaEdit(listingId);
  if (!listingRow) return { error: "Listing not found." };

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
    return { error: "Describe the photo for screen readers before uploading." };
  }

  const preset = presetFor("card");
  if (!preset) return { error: "Upload configuration is missing." };

  try {
    const uploaded = await uploadToCloudinary(file, "rakuxon/media");

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
    console.error("[admin] listing photo upload failed", error);
    return { error: "Upload failed. Please try again." };
  }

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { type: true },
  });
  if (listing) revalidateListingEdit(listing.type, listingId);
  return { success: "Photo added." };
}

export async function attachLibraryMediaToListing(
  formData: FormData,
): Promise<void> {
  await requireStaff();

  const listingId = String(formData.get("listingId") ?? "");
  const mediaId = String(formData.get("mediaId") ?? "");
  if (!listingId || !mediaId) return;

  if (!(await listingForMediaEdit(listingId))) return;

  const media = await db.media.findUnique({ where: { id: mediaId } });
  if (!media) return;

  const existing = await db.listingMedia.findUnique({
    where: { listingId_mediaId: { listingId, mediaId } },
  });
  if (existing) return;

  const maxPosition = await db.listingMedia.aggregate({
    where: { listingId },
    _max: { position: true },
  });
  const position = (maxPosition._max.position ?? -1) + 1;

  await db.listingMedia.create({
    data: { listingId, mediaId, position },
  });

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { type: true },
  });
  if (listing) revalidateListingEdit(listing.type, listingId);
}

export async function removeAdminListingPhoto(
  formData: FormData,
): Promise<void> {
  await requireStaff();

  const listingId = String(formData.get("listingId") ?? "");
  const mediaId = String(formData.get("mediaId") ?? "");
  const deleteAsset = formData.get("deleteAsset") === "1";

  if (!(await listingForMediaEdit(listingId))) return;

  const link = await db.listingMedia.findUnique({
    where: { listingId_mediaId: { listingId, mediaId } },
    include: { media: true },
  });
  if (!link) return;

  await db.listingMedia.delete({
    where: { listingId_mediaId: { listingId, mediaId } },
  });

  if (deleteAsset) {
    const usage = await getMediaUsage(mediaId);
    if (usage && totalUsage(usage._count) === 0) {
      await db.media.delete({ where: { id: mediaId } });
      await deleteFromCloudinary(link.media.url);
    }
  }

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { type: true },
  });
  if (listing) revalidateListingEdit(listing.type, listingId);
}
