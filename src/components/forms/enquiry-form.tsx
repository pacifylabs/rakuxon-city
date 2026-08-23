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
  return (
    <form
      className="flex flex-col gap-5"
      // No action and no handler: there is nowhere for this to go yet.
      onSubmit={undefined}
      aria-describedby={preview ? "enquiry-preview-notice" : undefined}
    >
      {preview ? (
        <p
          id="enquiry-preview-notice"
          className="rounded-control border border-hairline bg-accent-tint px-4 py-3 text-caption text-ink-secondary"
        >
          <span className="text-accent">Preview.</span> The enquiry system goes
          live in the next phase of the build. Nothing typed here would reach us
          yet, so the form is switched off rather than left to swallow it.
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="enquiry-name">
          <Input
            id="enquiry-name"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            disabled={preview}
          />
        </Field>

        <Field label="Phone number" htmlFor="enquiry-phone">
          <Input
            id="enquiry-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="0803 123 4567"
            disabled={preview}
          />
        </Field>

        <Field label="Email address" htmlFor="enquiry-email">
          <Input
            id="enquiry-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={preview}
          />
        </Field>

        <Field label="What are you looking for?" htmlFor="enquiry-interest">
          <Select
            id="enquiry-interest"
            name="interest"
            defaultValue=""
            disabled={preview}
          >
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
            disabled={preview}
          />
        </Field>
      ) : null}

      <Field label="Message" htmlFor="enquiry-message">
        <Textarea
          id="enquiry-message"
          name="message"
          rows={4}
          placeholder="Tell us which estate you are interested in, and when you would like to inspect."
          disabled={preview}
        />
      </Field>

      {/* FR-3.5 — consent is explicit and never pre-ticked. */}
      <Checkbox
        id="enquiry-consent"
        name="consent"
        disabled={preview}
        label={
          <>
            I have read the privacy policy and consent to Rakuxon City
            contacting me about this enquiry.
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={preview}
          className="min-h-11 rounded-full bg-accent px-6 py-3 text-body text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-45"
        >
          {preview ? "Coming soon" : "Send enquiry"}
        </button>
        {preview ? (
          <p className="text-caption text-ink-muted">
            Reach us on hello@rakuxoncity.com in the meantime.
          </p>
        ) : null}
      </div>
    </form>
  );
}
