"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/field";
import { site } from "@/lib/site";

/**
 * The footer sign-up. Live from Phase 6.
 *
 * What someone is joining is stated beside the field rather than left to be
 * inferred: occasional notes on new stock and buyer guides. Pressing Subscribe
 * is therefore a deliberate act, which is what makes it consent under NDPA
 * 2023 — and the timestamp is recorded server-side.
 *
 * The address is stored immediately but stays unconfirmed until it clicks a
 * confirmation email, which cannot be sent until Resend is configured. The
 * copy below promises nothing that cannot yet arrive.
 */
export function NewsletterSignup() {
  const pathname = usePathname();
  const [state, setState] = useState<"idle" | "submitting" | "done" | "failed">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  if (state === "done") {
    return (
      <p role="status" className="mt-5 text-body text-canvas/90">
        You are on the list. We will send a note to confirm the address before
        anything else arrives.
      </p>
    );
  }

  return (
    <form
      className="mt-5"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setState("submitting");
        setError(null);

        try {
          const response = await fetch("/api/subscribers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: String(data.get("email") ?? ""),
              sourcePath: pathname,
              consent: true,
            }),
          });

          if (response.ok) {
            setState("done");
            return;
          }

          const body = (await response.json().catch(() => ({}))) as {
            message?: string;
            fieldErrors?: Record<string, string>;
          };
          setState("failed");
          setError(
            body.fieldErrors?.email ??
              body.message ??
              "That did not go through. Please try again.",
          );
        } catch {
          setState("failed");
          setError(
            "We could not reach the server. Check your connection and try again.",
          );
        }
      }}
    >
      <div className="flex flex-col gap-3">
        <Input
          type="email"
          name="email"
          required
          aria-label="Email address"
          placeholder="Email address"
          aria-invalid={state === "failed"}
          className="border-canvas/25 bg-canvas/5 text-canvas placeholder:text-canvas/45"
        />
        <button
          type="submit"
          disabled={state === "submitting"}
          className="min-h-11 shrink-0 cursor-pointer rounded-full border border-accent-fill px-6 text-body text-accent-fill transition-colors hover:bg-accent-fill/10 focus-visible:ring-2 focus-visible:ring-accent-fill focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
        >
          {state === "submitting" ? "Adding…" : "Subscribe"}
        </button>
      </div>

      {state === "failed" && error ? (
        <p role="alert" className="mt-3 text-caption text-accent-fill">
          {error} Or email{" "}
          <a
            href={`mailto:${site.email}?subject=Newsletter`}
            className="underline underline-offset-4"
          >
            {site.email}
          </a>
          .
        </p>
      ) : (
        <p className="mt-3 text-caption text-canvas/75">
          Occasional notes on new stock and buyer guides. No more than monthly.
        </p>
      )}
    </form>
  );
}
