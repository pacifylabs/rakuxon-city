import Link from "next/link";
import { Field, Input, Select, Checkbox } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { FormError } from "@/components/admin/ui";
import {
  MIN_PASSWORD_LENGTH,
  PASSWORD_REQUIREMENTS_HINT,
} from "@/lib/auth/password-policy";
import { listerKindLabels, options } from "@/lib/admin/labels";

export function RegisterFormInner({ errorMessage }: { errorMessage?: string }) {
  return (
    <form action="/api/portal/register" method="post" className="flex flex-col gap-5">
      <FormError message={errorMessage} />

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

      <Field label="Password" htmlFor="password" hint={PASSWORD_REQUIREMENTS_HINT}>
        <PasswordInput
          id="password"
          name="password"
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
          required
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
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
        className="min-h-11 cursor-pointer rounded-full bg-primary px-6 text-body text-ivory-light transition-colors hover:bg-primary-hover"
      >
        Create account
      </button>
    </form>
  );
}
