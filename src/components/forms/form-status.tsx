"use client";

import type { SubmitState } from "@/components/forms/use-enquiry-submit";

/**
 * The failure panel.
 *
 * `role="alert"` so it is announced — a sighted visitor sees the red-adjacent
 * panel appear, and a screen reader user has to be told the press did
 * something. It renders nothing at all in the other states; success replaces
 * the whole form rather than sitting above it.
 */
export function FormStatus({
  state,
  message,
}: {
  state: SubmitState;
  message: string | null;
}) {
  if (state !== "failed" || !message) return null;

  return (
    <p
      role="alert"
      className="rounded-control border border-status-reserved/50 bg-status-reserved-bg px-4 py-3 text-body text-muted"
    >
      {message}
    </p>
  );
}
