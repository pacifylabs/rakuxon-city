"use client";

import Link from "next/link";
import { useState } from "react";
import { FormStatus } from "@/components/forms/form-status";
import { TurnstileWidget } from "@/components/forms/turnstile-widget";
import { useEnquirySubmit } from "@/components/forms/use-enquiry-submit";
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
 * Live from Phase 6, posting to /api/investor-enquiries — a different endpoint
 * from the sales form, deliberately, so nothing here can ever reach the
 * `Enquiry` table or the sales inbox.
 *
 * The capital band is a question we ask privately; nothing about it is ever
 * published back (FR-4.2), and the confirmation says only that the team will
 * make contact (FR-4.5).
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

export function InvestorEnquiryForm() {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const { state, fieldErrors, message, reference, submit } = useEnquirySubmit(
    "/api/investor-enquiries",
  );

  if (state === "succeeded") {
    /* FR-4.5 — the confirmation says only that the team will make contact.
       No mention of terms, timelines, returns or next steps. */
    return (
      <div role="status" className="flex flex-col gap-4">
        <p className="text-heading text-foreground">Thank you — we have it.</p>
        <p className="text-body text-muted">
          A member of the team will make contact. Your reference is{" "}
          <span className="tabular text-foreground">{reference}</span>.
        </p>
        <p className="text-caption text-muted">
          We handle your details as set out in our{" "}
          <Link
            href="/privacy"
            className="text-accent-text underline underline-offset-4"
          >
            privacy notice
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-5"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        submit({
          name: String(data.get("name") ?? ""),
          organisation: String(data.get("organisation") ?? "") || null,
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? ""),
          capitalBand: String(data.get("capitalBand") ?? ""),
          projectInterest: String(data.get("projectInterest") ?? ""),
          message: String(data.get("message") ?? ""),
          consent: data.get("consent") === "on",
          turnstileToken,
        });
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Full name"
          htmlFor="investor-name"
          error={fieldErrors.name}
        >
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

        <Field
          label="Email address"
          htmlFor="investor-email"
          error={fieldErrors.email}
        >
          <Input
            id="investor-email"
            name="email"
            type="email"
            autoComplete="email"
          />
        </Field>

        <Field
          label="Phone number"
          htmlFor="investor-phone"
          error={fieldErrors.phone}
        >
          <Input
            id="investor-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="0803 123 4567"
          />
        </Field>

        <Field
          label="Capital range"
          htmlFor="investor-band"
          error={fieldErrors.capitalBand}
        >
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

        <Field
          label="Project type"
          htmlFor="investor-interest"
          error={fieldErrors.projectInterest}
        >
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

      <Field
        label="Message"
        htmlFor="investor-message"
        error={fieldErrors.message}
      >
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
        error={fieldErrors.consent}
        label={
          <>
            I have read the{" "}
            <Link
              href="/privacy"
              className="text-accent-text underline underline-offset-4"
            >
              privacy notice
            </Link>{" "}
            and consent to Rakuxon City contacting me about this enquiry.
          </>
        }
      />

      <TurnstileWidget onToken={setTurnstileToken} />

      <FormStatus state={state} message={message} />

      <div>
        <button
          type="submit"
          disabled={state === "submitting"}
          className="min-h-11 cursor-pointer rounded-full bg-accent px-6 py-3 text-body text-charcoal-deep transition-colors hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
        >
          {state === "submitting" ? "Sending…" : "Send enquiry"}
        </button>
      </div>
    </form>
  );
}
