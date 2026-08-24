"use client";

import { useState } from "react";

/**
 * Submission state for both enquiry forms.
 *
 * The one rule this exists to enforce: **typed input is never lost.** The form
 * is uncontrolled, nothing is cleared on failure, and every error path leaves
 * the fields exactly as the visitor left them. Phase 6's verification step
 * calls for "success and failure states that never lose typed input", and the
 * easiest way to fail that is to reset a form on error.
 */
export type SubmitState = "idle" | "submitting" | "failed" | "succeeded";

type ApiError = {
  error: string;
  message?: string;
  fieldErrors?: Record<string, string>;
  contactEmail?: string;
};

export function useEnquirySubmit(endpoint = "/api/enquiries") {
  const [state, setState] = useState<SubmitState>("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  async function submit(payload: Record<string, unknown>) {
    setState("submitting");
    setFieldErrors({});
    setMessage(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = (await response.json()) as { reference: string };
        setReference(data.reference);
        setState("succeeded");
        return;
      }

      const data = (await response.json().catch(() => ({}))) as ApiError;

      if (data.fieldErrors) {
        setFieldErrors(data.fieldErrors);
        setState("failed");
        setMessage(
          "Some details need another look — see the notes on the fields above.",
        );
        return;
      }

      setState("failed");
      setMessage(
        data.message ?? "We could not send that. Please try again in a moment.",
      );
    } catch {
      // A network failure, an offline phone, a captive portal. The values are
      // still in the fields; the visitor only has to press send again.
      setState("failed");
      setMessage(
        "We could not reach the server. Check your connection and press send again — nothing you typed has been lost.",
      );
    }
  }

  return { state, fieldErrors, message, reference, submit };
}
