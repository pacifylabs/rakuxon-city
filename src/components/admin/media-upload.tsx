"use client";

import { useActionState, useState } from "react";
import { Field, Input, Select } from "@/components/ui/field";
import { FormError } from "@/components/admin/ui";
import type { ActionState } from "@/lib/admin/actions/media";
import {
  MEDIA_PRESETS,
  presetFor,
  checkDimensions,
} from "@/lib/admin/media-presets";

/**
 * Upload form.
 *
 * The image is measured in the browser and checked against the chosen preset
 * before anything is sent — so a wrong-shaped photograph is caught while the
 * person still has the file open, rather than after a slow upload. The server
 * re-checks against Cloudinary's own dimensions, because a hidden field is
 * editable and this check decides whether the image is allowed at all.
 */
export function MediaUploadForm({
  action,
  storageConfigured,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  storageConfigured: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [purpose, setPurpose] = useState<string>(MEDIA_PRESETS[0].value);
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(
    null,
  );
  const [preview, setPreview] = useState<string | null>(null);

  const preset = presetFor(purpose);
  const localProblem =
    preset && dimensions
      ? checkDimensions(preset, dimensions.w, dimensions.h)
      : null;

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setPreview(null);
      setDimensions(null);
      return;
    }

    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      setDimensions({ w: image.naturalWidth, h: image.naturalHeight });
      setPreview(url);
    };
    image.src = url;
  }

  if (!storageConfigured) {
    return (
      <div className="rounded-card border border-line bg-surface p-6">
        <p className="text-body text-foreground">Uploads are unavailable</p>
        <p className="mt-2 max-w-[60ch] text-body text-muted">
          Image uploads are not switched on yet. Everything else in the media
          library — alt text, placements, usage and deletion — works as
          normal. Ask your developer to enable image storage.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <FormError message={state?.error} />

      <Field
        label="What is this image for?"
        htmlFor="purpose"
        hint={preset?.hint}
      >
        <Select
          id="purpose"
          name="purpose"
          value={purpose}
          onChange={(event) => setPurpose(event.target.value)}
        >
          {MEDIA_PRESETS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Image file"
        htmlFor="file"
        hint="JPEG, PNG, WebP or AVIF. Up to 8MB."
      >
        <input
          id="file"
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required
          onChange={onFileChange}
          className="w-full rounded-control border border-line-input bg-surface px-4 py-2.5 text-body text-foreground"
        />
      </Field>

      {preview ? (
        <div className="rounded-card border border-line bg-surface p-4">
          <div className="flex flex-wrap items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- a local
                object URL for a file not yet uploaded; next/image cannot
                optimise a blob: URL. */}
            <img
              src={preview}
              alt=""
              className="max-h-40 w-auto rounded-control"
            />
            <div className="min-w-48 flex-1">
              {dimensions ? (
                <p className="text-caption text-muted">
                  <span className="tabular">
                    {dimensions.w}×{dimensions.h}
                  </span>{" "}
                  px
                </p>
              ) : null}

              {localProblem ? (
                <p className="mt-2 text-caption text-error">{localProblem}</p>
              ) : dimensions ? (
                <p className="mt-2 text-caption text-status-available">
                  Right shape and size for this slot.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <Field
        label="Alt text"
        htmlFor="alt"
        hint="Describe what the image shows. Required — it is what a screen reader announces."
      >
        <Input id="alt" name="alt" required minLength={3} maxLength={300} />
      </Field>

      <button
        type="submit"
        disabled={pending || Boolean(localProblem)}
        className="min-h-11 cursor-pointer self-start rounded-full bg-primary px-6 text-body text-ivory-light transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Uploading…" : "Upload image"}
      </button>
    </form>
  );
}
