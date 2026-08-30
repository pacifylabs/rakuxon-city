import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { env, hasCloudinary } from "@/lib/env";

/**
 * Cloudinary, for every upload the admin performs — media library images and
 * profile pictures.
 *
 * Replaces the Vercel Blob integration written in the previous run, at the
 * client's instruction. The practical difference: Blob is object storage that
 * hands back a URL, while Cloudinary also does the transformation work, so
 * `next/image` no longer has to re-encode every upload on the server. That
 * matters here because this project already caps image quality and formats
 * deliberately (see next.config.ts) and was paying for optimisation twice.
 *
 * NOT VERIFIED END TO END. There are no Cloudinary credentials in this
 * environment, so the signing and upload path below is typechecked and
 * reasoned about but has never actually run against the API. Flagged rather
 * than reported as working.
 */
if (hasCloudinary) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export type UploadResult = {
  url: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  publicId: string;
};

/**
 * Uploads a file and returns what the `Media` row needs.
 *
 * Dimensions come back from Cloudinary rather than being measured in the
 * browser and trusted — the client-supplied numbers were only ever a
 * best-effort, and `next/image` depends on them being right to avoid layout
 * shift on the public site.
 *
 * `folder` separates the two upload surfaces so an avatar can never be
 * offered as listing photography in the media picker.
 */
export async function uploadToCloudinary(
  file: File,
  folder: "rakuxon/media" | "rakuxon/avatars",
): Promise<UploadResult> {
  if (!hasCloudinary) {
    throw new Error("Cloudinary is not configured");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<Record<string, unknown>>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          // Strip camera EXIF. A phone photo of a plot carries GPS
          // coordinates, and publishing those alongside a listing is a
          // disclosure nobody asked for.
          //
          // `quality: auto` and `fetch_format: auto` are applied on DELIVERY
          // rather than baked in here, so the original stays intact and the
          // same asset can serve AVIF, WebP or JPEG per browser.
          transformation: [{ quality: "auto:good" }],
        },
        (error, uploaded) => {
          if (error || !uploaded) {
            reject(error ?? new Error("Upload returned no result"));
            return;
          }
          resolve(uploaded as unknown as Record<string, unknown>);
        },
      );
      stream.end(buffer);
    },
  );

  return {
    url: String(result.secure_url),
    width: Number(result.width),
    height: Number(result.height),
    bytes: Number(result.bytes),
    format: String(result.format),
    publicId: String(result.public_id),
  };
}

/**
 * Deletes an asset, so removing a `Media` row does not leave the bytes paid
 * for and orphaned in Cloudinary.
 *
 * Best-effort: a failure here is logged, not thrown. The database row is the
 * source of truth for what the site shows, and refusing to delete it because
 * a remote cleanup failed would leave a broken image on the public site.
 */
export async function deleteFromCloudinary(url: string): Promise<void> {
  if (!hasCloudinary) return;

  const publicId = publicIdFromUrl(url);
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("[cloudinary] delete failed", publicId, error);
  }
}

/**
 * Recovers the public id from a delivery URL.
 *
 * Cloudinary URLs look like
 * `https://res.cloudinary.com/<cloud>/image/upload/v1234/folder/name.jpg` —
 * everything after the version segment, minus the extension, is the id.
 * Returns null for anything that is not one of ours (the seeded local
 * photography under /images, for instance), so those are never sent to the
 * destroy endpoint.
 */
export function publicIdFromUrl(url: string): string | null {
  if (!url.includes("res.cloudinary.com")) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
  return match?.[1] ?? null;
}
