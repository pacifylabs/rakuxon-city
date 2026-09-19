"use client";

import Image from "next/image";
import { useActionState } from "react";
import { Field, Input, Select } from "@/components/ui/field";
import { FormError, FormSuccess } from "@/components/admin/ui";
import {
  attachLibraryMediaToListing,
  removeAdminListingPhoto,
  uploadAdminListingPhoto,
  type ListingMediaActionState,
} from "@/lib/admin/actions/listing-media";

export type AdminListingPhoto = {
  mediaId: string;
  url: string;
  alt: string;
  width: number;
  height: number;
};

type LibraryOption = { id: string; label: string };

export function AdminListingPhotos({
  listingId,
  photos,
  libraryOptions,
  storageConfigured,
}: {
  listingId: string;
  photos: AdminListingPhoto[];
  libraryOptions: LibraryOption[];
  storageConfigured: boolean;
}) {
  const [uploadState, uploadAction, uploadPending] = useActionState<
    ListingMediaActionState,
    FormData
  >(uploadAdminListingPhoto, null);

  return (
    <section className="mt-8 rounded-card border border-line bg-surface p-5">
      <h2 className="text-heading text-foreground">Listing photos</h2>
      <p className="mt-2 max-w-[60ch] text-body text-muted">
        Gallery order follows upload order — the first image is the cover on
        cards and detail pages. Use 4:3 photos at 1600×1200 or larger.
      </p>

      {photos.length > 0 ? (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <li
              key={photo.mediaId}
              className="overflow-hidden rounded-control border border-line bg-background"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                {index === 0 ? (
                  <span className="absolute top-2 left-2 rounded-full bg-primary/90 px-2 py-0.5 text-caption text-ivory-light">
                    Cover
                  </span>
                ) : null}
              </div>
              <div className="flex flex-col gap-2 p-3">
                <p className="line-clamp-2 text-caption text-muted">{photo.alt}</p>
                <form action={removeAdminListingPhoto} className="flex flex-wrap gap-3">
                  <input type="hidden" name="listingId" value={listingId} />
                  <input type="hidden" name="mediaId" value={photo.mediaId} />
                  <button
                    type="submit"
                    className="cursor-pointer text-caption text-muted underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Detach from listing
                  </button>
                  <button
                    type="submit"
                    name="deleteAsset"
                    value="1"
                    className="cursor-pointer text-caption text-error underline-offset-4 hover:underline"
                  >
                    Detach and delete file
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-caption text-muted">No photos attached yet.</p>
      )}

      {libraryOptions.length > 0 ? (
        <form
          action={attachLibraryMediaToListing}
          className="mt-6 flex max-w-xl flex-wrap items-end gap-3 border-t border-line pt-6"
        >
          <input type="hidden" name="listingId" value={listingId} />
          <Field label="From media library" htmlFor="library-media" className="min-w-[16rem] flex-1">
            <Select id="library-media" name="mediaId" required defaultValue="">
              <option value="" disabled>
                Choose an image
              </option>
              {libraryOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
          <button
            type="submit"
            className="min-h-11 cursor-pointer rounded-full border border-line px-5 text-body text-foreground hover:bg-background"
          >
            Attach
          </button>
        </form>
      ) : null}

      {storageConfigured ? (
        <form
          action={uploadAction}
          className="mt-6 flex max-w-xl flex-col gap-4 border-t border-line pt-6"
        >
          <FormError message={uploadState?.error} />
          {uploadState?.success ? (
            <FormSuccess message={uploadState.success} />
          ) : null}
          <input type="hidden" name="listingId" value={listingId} />
          <Field label="Upload new photo" htmlFor="admin-listing-photo-file">
            <Input
              id="admin-listing-photo-file"
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              required
            />
          </Field>
          <Field label="Alt text" htmlFor="admin-listing-photo-alt">
            <Input
              id="admin-listing-photo-alt"
              name="alt"
              placeholder="Describe what the photo shows"
              required
              minLength={3}
            />
          </Field>
          <button
            type="submit"
            disabled={uploadPending}
            className="min-h-11 w-fit cursor-pointer rounded-full bg-primary px-5 text-body text-ivory-light hover:bg-primary-hover disabled:opacity-60"
          >
            {uploadPending ? "Uploading…" : "Upload and attach"}
          </button>
        </form>
      ) : (
        <p className="mt-6 border-t border-line pt-6 text-caption text-muted">
          Direct uploads need Cloudinary. You can still attach images already in
          the media library.
        </p>
      )}
    </section>
  );
}
