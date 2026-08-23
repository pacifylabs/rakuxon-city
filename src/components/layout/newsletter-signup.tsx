"use client";

import { useState } from "react";
import { Input } from "@/components/ui/field";

/**
 * The footer sign-up.
 *
 * Live-looking rather than greyed out — a disabled control in the footer of a
 * client demo reads as an unfinished site. But nothing is stored yet, so
 * pressing Subscribe says so and offers the address that does work, instead of
 * flashing a success message for a list that does not exist.
 *
 * Phase 6 replaces `onSubmit` with a real POST and drops the notice.
 */
export function NewsletterSignup() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      className="mt-5"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <div className="flex flex-col gap-3">
        <Input
          type="email"
          name="email"
          required
          aria-label="Email address"
          placeholder="Email address"
          className="border-canvas/25 bg-canvas/5 text-canvas placeholder:text-canvas/45"
        />
        <button
          type="submit"
          className="min-h-11 shrink-0 cursor-pointer rounded-full border border-gold-on-deep px-6 text-body text-gold-on-deep transition-colors hover:bg-gold-on-deep/10 focus-visible:ring-2 focus-visible:ring-gold-on-deep focus-visible:outline-none"
        >
          Subscribe
        </button>
      </div>

      {submitted ? (
        <p role="status" className="mt-3 text-caption text-gold-on-deep">
          The list is not open yet — nothing was stored. Email{" "}
          <a
            href="mailto:hello@rakuxoncity.com?subject=Newsletter"
            className="underline underline-offset-4"
          >
            hello@rakuxoncity.com
          </a>{" "}
          and we will add you when it launches.
        </p>
      ) : (
        <p className="mt-3 text-caption text-canvas/75">
          Occasional notes on new stock and buyer guides. No more than monthly.
        </p>
      )}
    </form>
  );
}
