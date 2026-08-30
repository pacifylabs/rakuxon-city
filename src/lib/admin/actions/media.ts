"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hasCloudinary } from "@/lib/env";
import { requireStaff, requireAdmin } from "@/lib/admin/access";
import { getMediaUsage, totalUsage } from "@/lib/admin/queries/media";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "@/lib/admin/cloudinary";
import { mediaSchema } from "@/lib/validation/media";
import { presetFor, checkDimensions } from "@/lib/admin/media-presets";

export type ActionState = { error?: string; success?: string } | null;

/** 8MB. Above this an upload is almost certainly an unprocessed camera file. */
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Upload is gated on the Cloudinary credentials, the same way every other
 * optional integration on this site is gated on its own key.
 *
 * Without them this returns a plain message rather than throwing: the rest of
 * the media library (alt text, placements, usage, delete) works regardless,
 * and the deploy contract for the whole project is "no env var means that
 * feature is unavailable, not that the site is broken".
 *
 * NOT VERIFIED END TO END — there are no Cloudinary credentials in this
 * environment. See lib/admin/cloudinary.ts.
 */
export async function uploadMedia(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStaff();

  if (!hasCloudinary) {
    return {
      error:
        "Image uploads are not switched on yet. Ask your developer to enable image storage.",
    };
  }

  const file = formData.get("file");
  const alt = String(formData.get("alt") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload." };
  }
  if (!ACCEPTED.includes(file.type)) {
    return { error: "Upload a JPEG, PNG, WebP or AVIF image." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "That image is larger than 8MB. Compress it first." };
  }
  // Alt text is required at the boundary — design system §8 and the Media
  // model both treat it as non-optional, so it is checked before any bytes
  // are stored rather than audited afterwards.
  if (alt.length < 3) {
    return { error: "Describe the image for screen readers before uploading." };
  }

  const preset = presetFor(String(formData.get("purpose") ?? ""));
  if (!preset) {
    return { error: "Choose what this image is for." };
  }

  try {
    const uploaded = await uploadToCloudinary(file, "rakuxon/media");

    /*
     * Measured after upload, not before.
     *
     * The browser reports dimensions too, and the form uses them for a
     * preview — but a hidden field is trivially editable, and these numbers
     * decide whether the image is allowed at all. Cloudinary's are the ones
     * that count. The cost is that a rejected image is uploaded and then
     * deleted, which is a fair trade for a check that cannot be bypassed.
     */
    const problem = checkDimensions(preset, uploaded.width, uploaded.height);
    if (problem) {
      await deleteFromCloudinary(uploaded.url);
      return { error: problem };
    }

    // Dimensions come from Cloudinary, not from the browser — they drive
    // every next/image aspect ratio this picture appears in, and a wrong
    // pair causes layout shift on the public site.
    const parsed = mediaSchema.safeParse({
      url: uploaded.url,
      alt,
      width: uploaded.width,
      height: uploaded.height,
      mimeType: `image/${uploaded.format}`,
      sizeBytes: uploaded.bytes,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid image data." };
    }

    await db.media.create({ data: { ...parsed.data, isStandIn: false } });
  } catch (error) {
    console.error("[admin] media upload failed", error);
    return { error: "Upload failed. Please try again." };
  }

  revalidatePath("/admin/media");
  redirect("/admin/media?uploaded=1");
}

export async function updateMediaAlt(formData: FormData): Promise<void> {
  await requireStaff();

  const id = String(formData.get("mediaId") ?? "");
  const alt = String(formData.get("alt") ?? "").trim();
  if (alt.length < 3) return;

  await db.media.update({
    where: { id },
    data: {
      alt,
      // Editing the description of a stand-in does not make it real
      // photography, so `isStandIn` is left alone here and cleared by its
      // own control.
    },
  });

  revalidatePath("/admin/media");
}

/**
 * Delete refuses while anything still points at the image.
 *
 * `MediaPlacement.mediaId` is `onDelete: Restrict`, so a placed image would
 * throw a driver error; every other relation is `SetNull` or cascade, which
 * would silently blank a listing photo instead. Counting first turns both
 * into one clear refusal.
 */
export async function deleteMedia(id: string): Promise<void> {
  await requireAdmin();

  const media = await getMediaUsage(id);
  if (!media) return;

  // Called from a confirmation modal now, so this returns rather than
  // redirecting — the client stays on the grid and the toast reports it.
  // The control is only rendered for unused images anyway; this is the
  // second line of defence, not the first.
  if (totalUsage(media._count) > 0) return;

  await db.media.delete({ where: { id } });
  // The row is gone either way; the remote cleanup is best-effort so a
  // Cloudinary outage cannot block removing a bad image from the site.
  await deleteFromCloudinary(media.url);

  revalidatePath("/admin/media");
}

/** Point a named slot — site.logo, homepage.hero — at a different image. */
export async function updatePlacement(formData: FormData): Promise<void> {
  await requireAdmin();

  const key = String(formData.get("key") ?? "");
  const mediaId = String(formData.get("mediaId") ?? "");
  if (!key || !mediaId) return;

  await db.mediaPlacement.update({ where: { key }, data: { mediaId } });

  // A placement feeds page furniture across the whole public site, so the
  // affected pages are revalidated rather than just the admin list.
  revalidatePath("/admin/media/placements");
  revalidatePath("/", "layout");
}
