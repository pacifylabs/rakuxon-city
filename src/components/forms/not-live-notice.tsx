"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

const CONTACT_EMAIL = "hello@rakuxoncity.com";

/**
 * The honest half of an inert form.
 *
 * Every enquiry control on the site now looks and behaves as though it works —
 * fields accept typing, the button is styled and clickable — because a preview
 * full of greyed-out inputs reads as broken rather than as unfinished.
 *
 * What must not happen is a visitor typing a real enquiry, pressing send, and
 * believing it reached someone. So submitting says plainly that the system is
 * not open yet and hands over an address that is, with everything they typed
 * carried into a draft rather than lost.
 *
 * 03_IMPLEMENTATION_PLAN.md Phase 6 replaces this with a real POST. Call sites
 * pass `preview={false}` then, and none of this renders.
 */
export function useNotLiveSubmit(subject: string) {
  // The finished mailto, not the form element. Building it at submit time —
  // where `event.currentTarget` is the form — avoids reading a ref during
  // render, which React does not guarantee is current.
  const [mailto, setMailto] = useState<string | null>(null);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const lines: string[] = [];
    for (const [key, value] of data.entries()) {
      if (typeof value === "string" && value.trim()) {
        lines.push(`${key}: ${value}`);
      }
    }

    const query = new URLSearchParams({ subject });
    // Losing a filled-in form to a notice is the one outcome worse than the
    // form not working, so what they typed travels into the draft.
    if (lines.length > 0) query.set("body", lines.join("\n"));

    setMailto(`mailto:${CONTACT_EMAIL}?${query}`);
  };

  return { mailto, onSubmit };
}

export function NotLiveNotice({
  mailto,
  className,
}: {
  mailto: string;
  className?: string;
}) {
  return (
    <p
      // Announced the moment it appears — a sighted visitor sees the panel, and
      // a screen reader user has to be told the press did something.
      role="status"
      className={cn(
        "rounded-control border border-gold bg-surface px-4 py-3 text-body text-ink-secondary",
        className,
      )}
    >
      <span className="text-gold-strong">Not open yet.</span> Online enquiries
      go live shortly. In the meantime, email{" "}
      <a
        href={mailto}
        className="text-accent underline underline-offset-4 transition-colors hover:text-accent-hover"
      >
        {CONTACT_EMAIL}
      </a>{" "}
      — the link carries what you have typed into a draft.
    </p>
  );
}
