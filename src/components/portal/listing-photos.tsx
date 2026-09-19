"use client";

import Image from "next/image";
import { useActionState } from "react";
import { Field, Input } from "@/components/ui/field";
import { FormError, FormSuccess } from "@/components/admin/ui";
import {
  removePortalListingPhoto,
  uploadPortalListingPhoto,
  type PortalMediaActionState,
} from "@/lib/portal/actions/media";

export type PortalListingPhoto = {
  mediaId: string;
  url: string;
  alt: string;
  width: number;
  height: number;
};

export function PortalListingPhotos({
  listingId,
  photos,
  storageConfigured,
}: {
  listingId: string;
  photos: PortalListingPhoto[];
  storageConfigured: boolean;
}) {
  const [state, formAction, pending] = useActionState<
    PortalMediaActionState,
    FormData
  >(uploadPortalListingPhoto, null);

  if (!storageConfigured) {
    return (
      <section className="mb-8 rounded-card border border-line bg-surface p-5">
        <h2 className="text-heading text-foreground">Photos</h2>
        <p className="mt-2 text-body text-muted">
          Photo uploads are not enabled on this site yet. You can still save your
          listing details; add images once storage is configured.
        </p>
      </section>
    );
  }

  return (
    <section className="mb-8 rounded-card border border-line bg-surface p-5">
      <h2 className="text-heading text-foreground">Photos</h2>
      <p className="mt-2 max-w-[60ch] text-body text-muted">
        Add clear 4:3 photographs (1600×1200 or larger). The first photo is used
        on search cards and at the top of your listing page.
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
              <div className="flex items-center justify-between gap-2 p-3">
                <p className="line-clamp-2 text-caption text-muted">{photo.alt}</p>
                <form action={removePortalListingPhoto}>
                  <input type="hidden" name="listingId" value={listingId} />
                  <input type="hidden" name="mediaId" value={photo.mediaId} />
                  <button
                    type="submit"
                    className="shrink-0 cursor-pointer text-caption text-error underline-offset-4 hover:underline"
                  >
                    Remove
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-caption text-muted">No photos yet.</p>
      )}

      <form action={formAction} className="mt-6 flex max-w-xl flex-col gap-4 border-t border-line pt-6">
        <FormError message={state?.error} />
        {state?.success ? <FormSuccess message={state.success} /> : null}
        <input type="hidden" name="listingId" value={listingId} />
        <Field
          label="Photo file"
          htmlFor="portal-photo-file"
          hint="JPEG, PNG, WebP or AVIF, up to 8MB."
        >
          <Input
            id="portal-photo-file"
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            required
          />
        </Field>
        <Field label="Description for screen readers" htmlFor="portal-photo-alt">
          <Input
            id="portal-photo-alt"
            name="alt"
            placeholder="e.g. Front view of the plot from the access road"
            required
            minLength={3}
          />
        </Field>
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 w-fit cursor-pointer rounded-full border border-line px-5 text-body text-foreground transition-colors hover:bg-background disabled:opacity-60"
        >
          {pending ? "Uploading…" : "Upload photo"}
        </button>
      </form>
    </section>
  );
}
