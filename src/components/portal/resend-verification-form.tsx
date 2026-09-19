"use client";

import { useActionState } from "react";
import { resendListerVerification } from "@/lib/portal/actions/verification";
import { FormSuccess, FormError } from "@/components/admin/ui";

export function ResendVerificationForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(resendListerVerification, null);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="email" value={email} />
      <FormError message={state?.error} />
      <FormSuccess message={state?.sent ? "Another confirmation email is on its way." : undefined} />
      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer text-body text-accent-text underline underline-offset-4 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Resend confirmation email"}
      </button>
    </form>
  );
}
