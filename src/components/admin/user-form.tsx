"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Field, Input, Select } from "@/components/ui/field";
import { FormError, FormSuccess } from "@/components/admin/ui";
import type { ActionState } from "@/lib/admin/actions/users";
import { userRoleLabels, salesTrackLabels, options } from "@/lib/admin/labels";

export type UserFormValues = {
  id: string | null;
  name: string;
  email: string;
  role: string;
  salesTrack: string;
};

export function UserForm({
  values,
  action,
}: {
  values: UserFormValues;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [role, setRole] = useState(values.role);

  return (
    <div className="mt-8 max-w-xl">
      {/*
        The temporary password is shown once, here, and never again — it is
        hashed on save and cannot be read back. The admin passes it on; the
        user is forced to replace it on first sign-in.
      */}
      {state?.temporaryPassword ? (
        <div className="mb-6 rounded-card border border-accent-hover bg-accent-tint p-5">
          <p className="text-body text-foreground">{state.success}</p>
          <p className="mt-3 text-caption text-muted">
            Temporary password — copy it now, it is not shown again:
          </p>
          <p className="tabular mt-1 text-heading text-accent-text">
            {state.temporaryPassword}
          </p>
          <p className="mt-3 text-caption text-muted">
            They will be asked to change it the first time they sign in.
          </p>
        </div>
      ) : null}

      <form action={formAction} className="flex flex-col gap-5">
        <FormError message={state?.error} />
        {state?.success && !state.temporaryPassword ? (
          <FormSuccess message={state.success} />
        ) : null}

        <Field label="Name" htmlFor="name">
          <Input id="name" name="name" defaultValue={values.name} required />
        </Field>

        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={values.email}
            required
          />
        </Field>

        <Field label="Role" htmlFor="role">
          <Select
            id="role"
            name="role"
            defaultValue={values.role}
            onChange={(event) => setRole(event.target.value)}
            required
          >
            <option value="">Choose a role</option>
            {options(userRoleLabels).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        {/* Only sales users carry a track — the schema is explicit that it is
            null for the other two roles, so the field is removed rather than
            disabled when it does not apply. */}
        {role === "SALES" ? (
          <Field
            label="Sales track"
            htmlFor="salesTrack"
            hint="Decides which listings and enquiries this user can see."
          >
            <Select
              id="salesTrack"
              name="salesTrack"
              defaultValue={values.salesTrack}
              required
            >
              <option value="">Choose a track</option>
              {options(salesTrackLabels).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}

        <div className="flex items-center gap-4 border-t border-line pt-6">
          <button
            type="submit"
            disabled={pending}
            className="min-h-11 cursor-pointer rounded-full bg-primary px-6 text-body text-ivory-light transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
          >
            {pending
              ? "Saving…"
              : values.id
                ? "Save changes"
                : "Create user"}
          </button>
          <Link
            href="/admin/users"
            className="text-body text-muted hover:text-foreground"
          >
            Back to users
          </Link>
        </div>
      </form>
    </div>
  );
}
