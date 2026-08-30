"use client";

import { useActionState } from "react";
import { resetUserPassword } from "@/lib/admin/actions/users";
import { FormError } from "@/components/admin/ui";

/**
 * Password reset.
 *
 * Separate from the profile form on purpose: it is a destructive action —
 * it invalidates every session the user has — and should not ride along with
 * an unrelated change to their name or track.
 */
export function PasswordResetPanel({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const [state, formAction, pending] = useActionState(resetUserPassword, null);

  return (
    <section className="mt-12 max-w-xl rounded-card border border-line bg-surface p-5">
      <h2 className="text-heading text-foreground">Reset password</h2>
      <p className="mt-2 text-body text-muted">
        Issues a new temporary password and signs {userName} out of every
        device. They will be asked to set a new one on their next sign-in.
      </p>

      {state?.temporaryPassword ? (
        <div className="mt-4 rounded-control border border-accent-hover bg-accent-tint p-4">
          <p className="text-caption text-muted">
            Temporary password — copy it now, it is not shown again:
          </p>
          <p className="tabular mt-1 text-heading text-accent-text">
            {state.temporaryPassword}
          </p>
        </div>
      ) : null}

      <form action={formAction} className="mt-4">
        <FormError message={state?.error} />
        <input type="hidden" name="userId" value={userId} />
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 cursor-pointer rounded-full border border-line px-5 text-body text-foreground transition-colors hover:bg-surface-muted disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </section>
  );
}
