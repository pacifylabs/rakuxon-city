"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Field, Input, Select, Textarea, Checkbox } from "@/components/ui/field";
import { FormError } from "@/components/admin/ui";
import type { ActionState } from "@/lib/admin/actions/listings";
import {
  options,
  plotUnitLabels,
  titleTypeLabels,
  documentTypeLabels,
  houseTypeLabels,
  buildStageLabels,
} from "@/lib/admin/labels";

type EstateOption = { id: string; name: string };

export type LandFormValues = {
  id: string | null;
  slug: string;
  reference: string;
  title: string;
  description: string;
  estateId: string | null;
  location: string;
  state: string;
  price: string;
  priceOnRequest: boolean;
  paymentPlanAvailable: boolean;
  depositPercent: string;
  durationMonths: string;
  frequency: string;
  planNotes: string;
  featured: boolean;
  plotSize: string;
  plotUnit: string;
  titleType: string;
  additionalTitleTypes: string[];
  surveyNumber: string;
  topography: string;
  roadAccess: string;
  documents: { type: string; note: string }[];
};

export type HomeFormValues = Omit<
  LandFormValues,
  | "plotSize"
  | "plotUnit"
  | "titleType"
  | "additionalTitleTypes"
  | "surveyNumber"
  | "topography"
  | "roadAccess"
  | "documents"
> & {
  bedrooms: string;
  bathrooms: string;
  houseType: string;
  buildStage: string;
  handoverDate: string;
  builtArea: string;
  landArea: string;
  finishingSpec: string;
  features: string[];
};

/**
 * Shared fields for both tracks. The two forms differ only in their detail
 * section, so everything above and below it lives here once — the same
 * reason the schema has a `listingBaseSchema`.
 */
function SharedFields({
  values,
  estates,
  onPriceOnRequestChange,
  priceOnRequest,
  paymentPlanAvailable,
  onPaymentPlanChange,
  variant = "admin",
}: {
  values: LandFormValues | HomeFormValues;
  estates: EstateOption[];
  priceOnRequest: boolean;
  onPriceOnRequestChange: (next: boolean) => void;
  paymentPlanAvailable: boolean;
  onPaymentPlanChange: (next: boolean) => void;
  variant?: "admin" | "portal";
}) {
  const portal = variant === "portal";

  return (
    <>
      {portal ? (
        <>
          <input type="hidden" name="reference" value={values.reference} />
          <input type="hidden" name="slug" value={values.slug} />
        </>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Reference" htmlFor="reference">
            <Input
              id="reference"
              name="reference"
              defaultValue={values.reference}
              placeholder="e.g. LND-2026-014"
              required
            />
          </Field>
          <Field
            label="Slug"
            htmlFor="slug"
            hint="Lowercase words separated by hyphens. Becomes the public URL."
          >
            <Input
              id="slug"
              name="slug"
              defaultValue={values.slug}
              placeholder="e.g. emerald-ridge-phase-2"
              required
            />
          </Field>
        </div>
      )}

      <Field label="Title" htmlFor="title">
        <Input
          id="title"
          name="title"
          defaultValue={values.title}
          placeholder="Headline buyers see in search results"
          required
        />
      </Field>

      <Field label="Description" htmlFor="description">
        <Textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={values.description}
          placeholder="Describe the property, access, and what is included"
          required
        />
      </Field>

      <div
        className={
          portal ? "grid gap-5 sm:grid-cols-2" : "grid gap-5 sm:grid-cols-3"
        }
      >
        {!portal ? (
          <Field label="Estate" htmlFor="estateId">
            <Select
              id="estateId"
              name="estateId"
              defaultValue={values.estateId ?? ""}
            >
              <option value="">No estate</option>
              {estates.map((estate) => (
                <option key={estate.id} value={estate.id}>
                  {estate.name}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}
        <Field label="Location" htmlFor="location">
          <Input
            id="location"
            name="location"
            defaultValue={values.location}
            placeholder="Area or town, e.g. Sabon Lugbe"
            required
          />
        </Field>
        <Field label="State" htmlFor="state">
          <Input
            id="state"
            name="state"
            defaultValue={values.state}
            placeholder="e.g. FCT"
            required
          />
        </Field>
      </div>

      <fieldset className="rounded-card border border-line p-5">
        <legend className="px-2 text-caption text-muted">Price</legend>
        <Checkbox
          id="priceOnRequest"
          name="priceOnRequest"
          defaultChecked={values.priceOnRequest}
          onChange={(event) => onPriceOnRequestChange(event.target.checked)}
          label="Price on request — no figure published"
        />
        {/* FR-1.5 is an invariant, not a display rule: the figure field is
            removed, not just disabled, when the flag is on, so a stale value
            cannot be submitted alongside it. */}
        {!priceOnRequest ? (
          <div className="mt-4">
            <Field label="Price (₦)" htmlFor="price">
              <Input
                id="price"
                name="price"
                type="number"
                min="1"
                step="1"
                defaultValue={values.price}
                placeholder="Amount in naira"
              />
            </Field>
          </div>
        ) : null}
      </fieldset>

      <fieldset className="rounded-card border border-line p-5">
        <legend className="px-2 text-caption text-muted">Payment plan</legend>
        <Checkbox
          id="paymentPlanAvailable"
          name="paymentPlanAvailable"
          defaultChecked={values.paymentPlanAvailable}
          onChange={(event) => onPaymentPlanChange(event.target.checked)}
          label="Offer a structured payment plan"
        />
        {paymentPlanAvailable ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="Deposit %" htmlFor="depositPercent">
              <Input
                id="depositPercent"
                name="depositPercent"
                type="number"
                min="0"
                max="100"
                defaultValue={values.depositPercent}
                placeholder="e.g. 30"
              />
            </Field>
            <Field label="Duration (months)" htmlFor="durationMonths">
              <Input
                id="durationMonths"
                name="durationMonths"
                type="number"
                min="1"
                max="120"
                defaultValue={values.durationMonths}
                placeholder="e.g. 12"
              />
            </Field>
            <Field label="Frequency" htmlFor="frequency">
              <Select
                id="frequency"
                name="frequency"
                defaultValue={values.frequency}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="biannual">Biannual</option>
              </Select>
            </Field>
            <div className="sm:col-span-3">
              <Field label="Notes" htmlFor="planNotes">
                <Input
                  id="planNotes"
                  name="planNotes"
                  defaultValue={values.planNotes}
                  placeholder="Optional notes shown to buyers"
                />
              </Field>
            </div>
          </div>
        ) : null}
      </fieldset>

      {!portal ? (
        <Checkbox
          id="featured"
          name="featured"
          defaultChecked={values.featured}
          label="Feature this listing on the homepage"
        />
      ) : null}
    </>
  );
}

function FormActions({
  pending,
  cancelHref,
  isNew,
  variant = "admin",
}: {
  pending: boolean;
  cancelHref: string;
  isNew: boolean;
  variant?: "admin" | "portal";
}) {
  return (
    <div className="flex items-center gap-4 border-t border-line pt-6">
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 cursor-pointer rounded-full bg-primary px-6 text-body text-ivory-light transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Saving…" : isNew ? "Save draft" : "Save changes"}
      </button>
      <Link href={cancelHref} className="text-body text-muted hover:text-foreground">
        Cancel
      </Link>
      {isNew ? (
        <p className="text-caption text-muted">
          {variant === "portal"
            ? "Submit for review when the details are ready. Nothing goes live until our team approves it."
            : "New listings are created as drafts. Publish from the list once the details are right."}
        </p>
      ) : null}
    </div>
  );
}

export function LandListingForm({
  values,
  estates,
  action,
  variant = "admin",
  cancelHref = "/admin/listings/land",
}: {
  values: LandFormValues;
  estates: EstateOption[];
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  variant?: "admin" | "portal";
  cancelHref?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [priceOnRequest, setPriceOnRequest] = useState(values.priceOnRequest);
  const [planOn, setPlanOn] = useState(values.paymentPlanAvailable);
  const [documents, setDocuments] = useState(
    values.documents.length > 0 ? values.documents : [{ type: "", note: "" }],
  );

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-6">
      <FormError message={state?.error} />

      <SharedFields
        values={values}
        estates={estates}
        priceOnRequest={priceOnRequest}
        onPriceOnRequestChange={setPriceOnRequest}
        paymentPlanAvailable={planOn}
        onPaymentPlanChange={setPlanOn}
        variant={variant}
      />

      <fieldset className="rounded-card border border-line p-5">
        <legend className="px-2 text-caption text-muted">Land detail</legend>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Plot size" htmlFor="plotSize">
            <Input
              id="plotSize"
              name="plotSize"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={values.plotSize}
              placeholder="e.g. 500"
              required
            />
          </Field>
          <Field label="Unit" htmlFor="plotUnit">
            <Select id="plotUnit" name="plotUnit" defaultValue={values.plotUnit}>
              {options(plotUnitLabels).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="mt-4">
          <Field
            label="Lead title type"
            htmlFor="titleType"
            hint="The strongest title this plot holds. Leads the card badge and the ribbon."
          >
            <Select
              id="titleType"
              name="titleType"
              defaultValue={values.titleType}
              required
            >
              <option value="">Choose one</option>
              {options(titleTypeLabels).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <fieldset className="mt-4">
          <legend className="text-caption text-muted">
            Also held (shown in the ribbon, never on a card)
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {options(titleTypeLabels).map((option) => (
              <Checkbox
                key={option.value}
                id={`additional-${option.value}`}
                name="additionalTitleTypes"
                value={option.value}
                defaultChecked={values.additionalTitleTypes.includes(
                  option.value,
                )}
                label={option.label}
              />
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Survey number" htmlFor="surveyNumber">
            <Input
              id="surveyNumber"
              name="surveyNumber"
              defaultValue={values.surveyNumber}
              placeholder="If known"
            />
          </Field>
          <Field label="Topography" htmlFor="topography">
            <Input
              id="topography"
              name="topography"
              defaultValue={values.topography}
              placeholder="e.g. Flat, gently sloping"
            />
          </Field>
          <Field label="Road access" htmlFor="roadAccess">
            <Input
              id="roadAccess"
              name="roadAccess"
              defaultValue={values.roadAccess}
              placeholder="e.g. Paved estate road"
            />
          </Field>
        </div>

        <div className="mt-6">
          <p className="text-caption text-muted">
            Documents held. Rows left blank are ignored.
          </p>
          <div className="mt-2 flex flex-col gap-3">
            {documents.map((doc, index) => (
              <div key={index} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <Select
                  name="docType"
                  defaultValue={doc.type}
                  aria-label={`Document ${index + 1} type`}
                >
                  <option value="">No document</option>
                  {options(documentTypeLabels).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <Input
                  name="docNote"
                  defaultValue={doc.note}
                  placeholder="Reference or note (optional)"
                  aria-label={`Document ${index + 1} note`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setDocuments((rows) => rows.filter((_, i) => i !== index))
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
            onClick={() =>
              setDocuments((rows) => [...rows, { type: "", note: "" }])
            }
            className="mt-3 cursor-pointer text-caption text-accent-text underline underline-offset-4"
          >
            Add another document
          </button>
        </div>
      </fieldset>

      <FormActions
        pending={pending}
        cancelHref={cancelHref}
        isNew={values.id === null}
        variant={variant}
      />
    </form>
  );
}

export function HomeListingForm({
  values,
  estates,
  action,
  variant = "admin",
  cancelHref = "/admin/listings/homes",
}: {
  values: HomeFormValues;
  estates: EstateOption[];
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  variant?: "admin" | "portal";
  cancelHref?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [priceOnRequest, setPriceOnRequest] = useState(values.priceOnRequest);
  const [planOn, setPlanOn] = useState(values.paymentPlanAvailable);
  const [features, setFeatures] = useState(
    values.features.length > 0 ? values.features : [""],
  );

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-6">
      <FormError message={state?.error} />

      <SharedFields
        values={values}
        estates={estates}
        priceOnRequest={priceOnRequest}
        onPriceOnRequestChange={setPriceOnRequest}
        paymentPlanAvailable={planOn}
        onPaymentPlanChange={setPlanOn}
        variant={variant}
      />

      <fieldset className="rounded-card border border-line p-5">
        <legend className="px-2 text-caption text-muted">Home detail</legend>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Bedrooms" htmlFor="bedrooms">
            <Input
              id="bedrooms"
              name="bedrooms"
              type="number"
              min="1"
              max="20"
              defaultValue={values.bedrooms}
              placeholder="e.g. 4"
              required
            />
          </Field>
          <Field label="Bathrooms" htmlFor="bathrooms">
            <Input
              id="bathrooms"
              name="bathrooms"
              type="number"
              min="1"
              max="20"
              defaultValue={values.bathrooms}
              placeholder="e.g. 5"
              required
            />
          </Field>
          <Field label="House type" htmlFor="houseType">
            <Select
              id="houseType"
              name="houseType"
              defaultValue={values.houseType}
              required
            >
              <option value="">Choose one</option>
              {options(houseTypeLabels).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Build stage" htmlFor="buildStage">
            <Select
              id="buildStage"
              name="buildStage"
              defaultValue={values.buildStage}
              required
            >
              <option value="">Choose one</option>
              {options(buildStageLabels).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Expected handover"
            htmlFor="handoverDate"
            hint="Leave blank if the home is ready now."
          >
            <Input
              id="handoverDate"
              name="handoverDate"
              type="date"
              defaultValue={values.handoverDate}
            />
          </Field>
          <div />
          <Field label="Built area (sqm)" htmlFor="builtArea">
            <Input
              id="builtArea"
              name="builtArea"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={values.builtArea}
              placeholder="e.g. 280"
              required
            />
          </Field>
          <Field label="Land area (sqm)" htmlFor="landArea">
            <Input
              id="landArea"
              name="landArea"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={values.landArea}
              placeholder="e.g. 600"
              required
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Finishing specification" htmlFor="finishingSpec">
            <Textarea
              id="finishingSpec"
              name="finishingSpec"
              rows={4}
              defaultValue={values.finishingSpec}
              placeholder="Flooring, fittings, kitchen, and other finish details"
              required
            />
          </Field>
        </div>

        <div className="mt-6">
          <p className="text-caption text-muted">Features. Blank rows are ignored.</p>
          <div className="mt-2 flex flex-col gap-3">
            {features.map((feature, index) => (
              <div key={index} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Input
                  name="features"
                  defaultValue={feature}
                  placeholder="e.g. Fitted kitchen"
                  aria-label={`Feature ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setFeatures((rows) => rows.filter((_, i) => i !== index))
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
            onClick={() => setFeatures((rows) => [...rows, ""])}
            className="mt-3 cursor-pointer text-caption text-accent-text underline underline-offset-4"
          >
            Add another feature
          </button>
        </div>
      </fieldset>

      <FormActions
        pending={pending}
        cancelHref={cancelHref}
        isNew={values.id === null}
        variant={variant}
      />
    </form>
  );
}
