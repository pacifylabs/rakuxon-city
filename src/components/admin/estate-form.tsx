"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormError } from "@/components/admin/ui";
import type { ActionState } from "@/lib/admin/actions/estates";
import { estateStatusLabels, options } from "@/lib/admin/labels";

export type EstateFormValues = {
  id: string | null;
  slug: string;
  name: string;
  location: string;
  state: string;
  description: string;
  status: string;
  amenities: string[];
  latitude: string;
  longitude: string;
};

export function EstateForm({
  values,
  action,
}: {
  values: EstateFormValues;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [amenities, setAmenities] = useState(
    values.amenities.length > 0 ? values.amenities : [""],
  );

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-6">
      <FormError message={state?.error} />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <Field label="Name" htmlFor="name">
          <Input id="name" name="name" defaultValue={values.name} required />
        </Field>
        <Field
          label="Slug"
          htmlFor="slug"
          hint="Lowercase words separated by hyphens. Becomes the public URL."
        >
          <Input id="slug" name="slug" defaultValue={values.slug} required />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Location" htmlFor="location">
          <Input
            id="location"
            name="location"
            defaultValue={values.location}
            required
          />
        </Field>
        <Field label="State" htmlFor="state">
          <Input id="state" name="state" defaultValue={values.state} required />
        </Field>
        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={values.status}>
            {options(estateStatusLabels).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Description" htmlFor="description">
        <Textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={values.description}
          required
        />
      </Field>

      <fieldset className="rounded-card border border-line p-5">
        <legend className="px-2 text-caption text-muted">Amenities</legend>
        <p className="text-caption text-muted">
          Shown as a list on the estate page. Blank rows are ignored.
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {amenities.map((amenity, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input
                name="amenities"
                defaultValue={amenity}
                placeholder="e.g. Perimeter fencing"
                aria-label={`Amenity ${index + 1}`}
              />
              <button
                type="button"
                onClick={() =>
                  setAmenities((rows) => rows.filter((_, i) => i !== index))
                }
                className="cursor-pointer rounded-control border border-line px-3 text-caption text-muted hover:text-foreground"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setAmenities((rows) => [...rows, ""])}
          className="mt-3 cursor-pointer text-caption text-accent-text underline underline-offset-4"
        >
          Add another amenity
        </button>
      </fieldset>

      <fieldset className="rounded-card border border-line p-5">
        <legend className="px-2 text-caption text-muted">
          Coordinates (optional)
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Latitude" htmlFor="latitude">
            <Input
              id="latitude"
              name="latitude"
              type="number"
              step="0.000001"
              defaultValue={values.latitude}
            />
          </Field>
          <Field label="Longitude" htmlFor="longitude">
            <Input
              id="longitude"
              name="longitude"
              type="number"
              step="0.000001"
              defaultValue={values.longitude}
            />
          </Field>
        </div>
      </fieldset>

      <div className="flex items-center gap-4 border-t border-line pt-6">
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 cursor-pointer rounded-full bg-primary px-6 text-body text-ivory-light transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Saving…" : values.id ? "Save changes" : "Create estate"}
        </button>
        <Link
          href="/admin/estates"
          className="text-body text-muted hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
