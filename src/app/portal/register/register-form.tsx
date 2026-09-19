"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field, Input, Select, Checkbox } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { FormError } from "@/components/admin/ui";
import { registerLister } from "@/lib/portal/actions/register";
import { listerKindLabels, options } from "@/lib/admin/labels";

export function RegisterFormInner() {
  const [state, formAction, pending] = useActionState(registerLister, null);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError message={state?.error} />

      <Field label="Full name" htmlFor="displayName">
        <Input
          id="displayName"
          name="displayName"
          placeholder="Your full name"
          required
          autoFocus
        />
      </Field>

      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </Field>

      <Field label="Phone" htmlFor="phone">
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="0803 123 4567"
          required
          autoComplete="tel"
        />
      </Field>

      <Field label="I am a" htmlFor="listerKind">
        <Select id="listerKind" name="listerKind" required defaultValue="">
          <option value="" disabled>
            Choose one
          </option>
          {options(listerKindLabels).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Organisation (optional)" htmlFor="organisation">
        <Input
          id="organisation"
          name="organisation"
          placeholder="Company or agency name"
        />
      </Field>

      <Field label="Password" htmlFor="password">
        <PasswordInput
          id="password"
          name="password"
          placeholder="At least 12 characters"
          required
          autoComplete="new-password"
          minLength={12}
        />
      </Field>

      <Checkbox
        id="consent"
        name="consent"
        label={
          <>
            I agree to the{" "}
            <Link href="/privacy" className="text-accent-text underline underline-offset-4">
              privacy policy
            </Link>{" "}
            and understand my listing details will be reviewed before publication.
          </>
        }
      />

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 cursor-pointer rounded-full bg-primary px-6 text-body text-ivory-light transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
