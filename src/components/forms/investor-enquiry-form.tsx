import {
  Checkbox,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui/field";
import {
  capitalBands,
  projectInterests,
} from "@/lib/validation/investor-enquiry";

/**
 * FR-4.3. A separate form, writing to a separate table, notifying a separate
 * inbox — never a shared handler with general enquiries (FR-4.4).
 *
 * Inert until Phase 6, like every other form at this stage. The capital band is
 * a question we ask privately; nothing about it is ever published back (FR-4.2).
 */
const bandLabels: Record<(typeof capitalBands)[number], string> = {
  "under-50m": "Under ₦50 million",
  "50m-150m": "₦50 – ₦150 million",
  "150m-500m": "₦150 – ₦500 million",
  "above-500m": "Above ₦500 million",
  "prefer-not-to-say": "Prefer not to say",
};

const interestLabels: Record<(typeof projectInterests)[number], string> = {
  "land-development": "Land development",
  "residential-build": "Residential build",
  "mixed-use": "Mixed use",
  undecided: "Not yet decided",
};

export function InvestorEnquiryForm({ preview = true }: { preview?: boolean }) {
  return (
    <form
      className="flex flex-col gap-5"
      aria-describedby="investor-preview-notice"
    >
      {preview ? (
        <p
          id="investor-preview-notice"
          className="rounded-control border border-hairline bg-accent-tint px-4 py-3 text-caption text-ink-secondary"
        >
          <span className="text-accent">Preview.</span> This form goes live in a
          later phase of the build. Nothing entered here would reach us yet, so
          it is switched off rather than left to swallow it. In the meantime,
          write to partnerships@rakuxoncity.com.
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="investor-name">
          <Input
            id="investor-name"
            name="name"
            autoComplete="name"
            disabled={preview}
          />
        </Field>

        <Field
          label="Organisation"
          htmlFor="investor-organisation"
          hint="Optional"
        >
          <Input
            id="investor-organisation"
            name="organisation"
            autoComplete="organization"
            disabled={preview}
          />
        </Field>

        <Field label="Email address" htmlFor="investor-email">
          <Input
            id="investor-email"
            name="email"
            type="email"
            autoComplete="email"
            disabled={preview}
          />
        </Field>

        <Field label="Phone number" htmlFor="investor-phone">
          <Input
            id="investor-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="0803 123 4567"
            disabled={preview}
          />
        </Field>

        <Field label="Capital range" htmlFor="investor-band">
          <Select
            id="investor-band"
            name="capitalBand"
            defaultValue=""
            disabled={preview}
          >
            <option value="" disabled>
              Choose a range
            </option>
            {capitalBands.map((band) => (
              <option key={band} value={band}>
                {bandLabels[band]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Project type" htmlFor="investor-interest">
          <Select
            id="investor-interest"
            name="projectInterest"
            defaultValue=""
            disabled={preview}
          >
            <option value="" disabled>
              Choose one
            </option>
            {projectInterests.map((interest) => (
              <option key={interest} value={interest}>
                {interestLabels[interest]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Message" htmlFor="investor-message">
        <Textarea
          id="investor-message"
          name="message"
          rows={5}
          placeholder="Tell us about the kind of project you work on and what your involvement usually looks like."
          disabled={preview}
        />
      </Field>

      <Checkbox
        id="investor-consent"
        name="consent"
        disabled={preview}
        label="I have read the privacy policy and consent to Rakuxon City contacting me about this enquiry."
      />

      <div>
        <button
          type="submit"
          disabled={preview}
          className="min-h-11 rounded-full bg-accent px-6 py-3 text-body text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-45"
        >
          {preview ? "Coming soon" : "Send enquiry"}
        </button>
      </div>
    </form>
  );
}
