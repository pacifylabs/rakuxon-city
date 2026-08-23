"use client";

import {
  NotLiveNotice,
  useNotLiveSubmit,
} from "@/components/forms/not-live-notice";
import {
  Checkbox,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui/field";

/**
 * The enquiry form, rendered but deliberately inert until Phase 6.
 *
 * Every control is genuinely `disabled`, not merely unwired. A stakeholder
 * reviewing this preview cannot type an enquiry, watch it appear to send, and
 * then wonder why nobody called them back — which is exactly what happens when
 * a form is left live against a handler that does not exist yet.
 *
 * 03_IMPLEMENTATION_PLAN.md Phase 6 removes `preview` and wires this to
 * POST /api/enquiries with Turnstile, rate limiting and track routing.
 */
export function EnquiryForm({
  listingReference,
  preview = true,
}: {
  /** Pre-filled on a listing page so the enquiry arrives with context attached. */
  listingReference?: string;
  preview?: boolean;
}) {
  const { mailto, onSubmit } = useNotLiveSubmit("Property enquiry");

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={preview ? onSubmit : undefined}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="enquiry-name">
          <Input
            id="enquiry-name"
            name="name"
            autoComplete="name"
            placeholder="Your name"
          />
        </Field>

        <Field label="Phone number" htmlFor="enquiry-phone">
          <Input
            id="enquiry-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="0803 123 4567"
          />
        </Field>

        <Field label="Email address" htmlFor="enquiry-email">
          <Input
            id="enquiry-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />
        </Field>

        <Field label="What are you looking for?" htmlFor="enquiry-interest">
          <Select id="enquiry-interest" name="interest" defaultValue="">
            <option value="" disabled>
              Choose one
            </option>
            <option value="land">A plot of land</option>
            <option value="home">A completed or in-build home</option>
            <option value="both">Still deciding</option>
          </Select>
        </Field>
      </div>

      {listingReference ? (
        <Field label="Listing reference" htmlFor="enquiry-reference">
          <Input
            id="enquiry-reference"
            name="reference"
            defaultValue={listingReference}
            readOnly
          />
        </Field>
      ) : null}

      <Field label="Message" htmlFor="enquiry-message">
        <Textarea
          id="enquiry-message"
          name="message"
          rows={4}
          placeholder="Tell us which estate you are interested in, and when you would like to inspect."
        />
      </Field>

      {/* FR-3.5 — consent is explicit and never pre-ticked. */}
      <Checkbox
        id="enquiry-consent"
        name="consent"
        label={
          <>
            I have read the privacy policy and consent to Rakuxon City
            contacting me about this enquiry.
          </>
        }
      />

      {mailto ? <NotLiveNotice mailto={mailto} /> : null}

      <div>
        <button
          type="submit"
          className="min-h-11 cursor-pointer rounded-full bg-accent px-6 py-3 text-body text-white transition-colors hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Send enquiry
        </button>
      </div>
    </form>
  );
}
