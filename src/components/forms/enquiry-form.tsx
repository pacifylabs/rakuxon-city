"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Checkbox,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui/field";
import { TurnstileWidget } from "@/components/forms/turnstile-widget";
import { FormStatus } from "@/components/forms/form-status";
import { useEnquirySubmit } from "@/components/forms/use-enquiry-submit";
import type { EnquirySource } from "@/generated/prisma/enums";

/**
 * The enquiry form. Live from Phase 6.
 *
 * FR-3.1 — captures the contact details plus the source context: the listing
 * it came from, the page path, and a campaign parameter where one is present.
 * FR-3.2 adds a preferred inspection date on home listings.
 *
 * Two things this does that a form usually does not:
 *
 *   - It never clears on failure. The submitted values stay in the fields, so
 *     a rejected submission costs a click rather than retyping everything. A
 *     buyer who has to type their enquiry twice usually does not.
 *   - Server-side field errors are placed on the fields they belong to, not
 *     collected into a banner at the top.
 */
export function EnquiryForm({
  listingId,
  listingReference,
  source = "CONTACT",
  showInspectionDate = false,
  fromGuide = null,
}: {
  /** The database id, which is what the API routes on — FR-3.3. */
  listingId?: string;
  /** The human reference, shown to the enquirer for context. */
  listingReference?: string;
  source?: EnquirySource;
  /** FR-3.2 — home detail pages only. */
  showInspectionDate?: boolean;
  /** The buyer guide this enquiry started from, where it started on one. */
  fromGuide?: string | null;
}) {
  const pathname = usePathname();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const { state, fieldErrors, message, reference, submit } = useEnquirySubmit();

  if (state === "succeeded") {
    return (
      <div role="status" className="flex flex-col gap-4">
        <p className="text-heading text-foreground">Thank you — we have it.</p>
        <p className="text-body text-muted">
          A member of the team will be in touch. Your reference is{" "}
          <span className="tabular text-foreground">{reference}</span>, and we have
          emailed you a copy.
        </p>
        <p className="text-body text-muted">
          When we reply we will send the documentation position on the property
          — the title type, the survey number, and what we hold — so you can
          begin your own checks.
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
          source,
          listingId: listingId ?? null,
          // The guide travels in the page path, so the sales desk sees where
          // the enquiry began without a schema change.
          pagePath: fromGuide ? `${pathname}?guide=${fromGuide}` : pathname,
          campaign:
            new URLSearchParams(window.location.search).get("utm_campaign") ??
            null,
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? ""),
          message: String(data.get("message") ?? ""),
          preferredInspectionDate: data.get("preferredInspectionDate")
            ? String(data.get("preferredInspectionDate"))
            : null,
          consent: data.get("consent") === "on",
          turnstileToken,
        });
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Full name"
          htmlFor="enquiry-name"
          error={fieldErrors.name}
        >
          <Input
            id="enquiry-name"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={Boolean(fieldErrors.name)}
          />
        </Field>

        <Field
          label="Phone number"
          htmlFor="enquiry-phone"
          error={fieldErrors.phone}
        >
          <Input
            id="enquiry-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="0803 123 4567"
            aria-invalid={Boolean(fieldErrors.phone)}
          />
        </Field>

        <Field
          label="Email address"
          htmlFor="enquiry-email"
          error={fieldErrors.email}
        >
          <Input
            id="enquiry-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(fieldErrors.email)}
          />
        </Field>

        {showInspectionDate ? (
          /* FR-3.2 — optional, and only where an inspection makes sense. */
          <Field
            label="Preferred inspection date"
            htmlFor="enquiry-inspection"
            hint="Optional"
          >
            <Input
              id="enquiry-inspection"
              name="preferredInspectionDate"
              type="date"
              min={new Date().toISOString().slice(0, 10)}
            />
          </Field>
        ) : (
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
        )}
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

      <Field
        label="Message"
        htmlFor="enquiry-message"
        error={fieldErrors.message}
      >
        <Textarea
          id="enquiry-message"
          name="message"
          rows={4}
          placeholder="Tell us which estate you are interested in, and when you would like to inspect."
          aria-invalid={Boolean(fieldErrors.message)}
        />
      </Field>

      {/* FR-3.5 — consent is explicit and never pre-ticked. */}
      <Checkbox
        id="enquiry-consent"
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
