"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field, Input } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { FormError, FormSuccess } from "@/components/admin/ui";
import type { ResetState } from "@/lib/admin/actions/reset";
import {
  MIN_PASSWORD_LENGTH,
  PASSWORD_REQUIREMENTS_HINT,
} from "@/lib/auth/password-policy";

type ForgotProps = {
  emailConfigured: boolean;
  requestAction: (
    prev: ResetState,
    formData: FormData,
  ) => Promise<ResetState>;
  backHref: string;
  staffFallbackHint?: boolean;
};

export function ForgotPasswordForm({
  emailConfigured,
  requestAction,
  backHref,
  staffFallbackHint = false,
}: ForgotProps) {
  const [state, formAction, pending] = useActionState(requestAction, null);

  if (state?.sent) {
    return (
      <div className="flex flex-col gap-5">
        <FormSuccess message="If that address belongs to an account, a reset link is on its way. It expires in an hour." />
        {!emailConfigured && staffFallbackHint ? (
          <p className="rounded-control border border-line bg-surface px-4 py-3 text-caption text-muted">
            If it does not arrive, ask an admin to reset your password from the
            Team screen.
          </p>
        ) : null}
        <Link
          href={backHref}
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
          placeholder="you@rakuxoncity.com"
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
        href={backHref}
        className="text-caption text-muted underline underline-offset-4 hover:text-foreground"
      >
        Back to sign in
      </Link>
    </form>
  );
}

export function SetNewPasswordForm({
  token,
  completeAction,
}: {
  token: string;
  completeAction: (
    prev: ResetState,
    formData: FormData,
  ) => Promise<ResetState>;
}) {
  const [state, formAction, pending] = useActionState(completeAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError message={state?.error} />
      <input type="hidden" name="token" value={token} />

      <Field
        label="New password"
        htmlFor="next"
        hint={PASSWORD_REQUIREMENTS_HINT}
      >
        <PasswordInput
          id="next"
          name="next"
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
          autoFocus
        />
      </Field>

      <Field label="Confirm new password" htmlFor="confirm">
        <PasswordInput
          id="confirm"
          name="confirm"
          placeholder="Repeat new password"
          required
          minLength={MIN_PASSWORD_LENGTH}
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
