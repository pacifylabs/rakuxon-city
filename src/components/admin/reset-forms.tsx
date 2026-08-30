"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field, Input } from "@/components/ui/field";
import { FormError, FormSuccess } from "@/components/admin/ui";
import {
  requestPasswordReset,
  completePasswordReset,
} from "@/lib/admin/actions/reset";

export function ForgotPasswordForm({
  emailConfigured,
}: {
  emailConfigured: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    null,
  );

  if (state?.sent) {
    return (
      <div className="flex flex-col gap-5">
        <FormSuccess message="If that address belongs to an account, a reset link is on its way. It expires in an hour." />
        {!emailConfigured ? (
          <p className="rounded-control border border-line bg-surface px-4 py-3 text-caption text-muted">
            If it does not arrive, ask an admin to reset your password from the
            Team screen.
          </p>
        ) : null}
        <Link
          href="/admin/login"
          className="text-body text-accent-text underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError message={state?.error} />

      <Field
        label="Email"
        htmlFor="email"
        hint="The address you sign in with."
      >
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 cursor-pointer rounded-full bg-primary px-6 text-body text-ivory-light transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>

      <Link
        href="/admin/login"
        className="text-caption text-muted underline underline-offset-4 hover:text-foreground"
      >
        Back to sign in
      </Link>
    </form>
  );
}

export function SetNewPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    completePasswordReset,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError message={state?.error} />
      <input type="hidden" name="token" value={token} />

      <Field
        label="New password"
        htmlFor="next"
        hint="At least 12 characters, with an uppercase letter, a lowercase letter and a number."
      >
        <Input
          id="next"
          name="next"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          autoFocus
        />
      </Field>

      <Field label="Confirm new password" htmlFor="confirm">
        <Input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 cursor-pointer rounded-full bg-primary px-6 text-body text-ivory-light transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
