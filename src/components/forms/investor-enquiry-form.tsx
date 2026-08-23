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
  const { mailto, onSubmit } = useNotLiveSubmit("Partnership enquiry");

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={preview ? onSubmit : undefined}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="investor-name">
          <Input id="investor-name" name="name" autoComplete="name" />
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
          />
        </Field>

        <Field label="Email address" htmlFor="investor-email">
          <Input
            id="investor-email"
            name="email"
            type="email"
            autoComplete="email"
          />
        </Field>

        <Field label="Phone number" htmlFor="investor-phone">
          <Input
            id="investor-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="0803 123 4567"
          />
        </Field>

        <Field label="Capital range" htmlFor="investor-band">
          <Select id="investor-band" name="capitalBand" defaultValue="">
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
          <Select id="investor-interest" name="projectInterest" defaultValue="">
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
        />
      </Field>

      <Checkbox
        id="investor-consent"
        name="consent"
        label="I have read the privacy policy and consent to Rakuxon City contacting me about this enquiry."
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
