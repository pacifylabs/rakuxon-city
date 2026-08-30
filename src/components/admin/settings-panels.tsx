"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { Field, Input } from "@/components/ui/field";
import { FormError, FormSuccess } from "@/components/admin/ui";
import { ConfirmAction } from "@/components/admin/confirm-action";
import {
  changeOwnPassword,
  updateProfilePicture,
  removeProfilePicture,
  signOutEverywhere,
} from "@/lib/admin/actions/profile";

/**
 * Identity — avatar and name, side by side with the picture control.
 *
 * Previously a full-width card holding one small circle and a file input,
 * which left most of its own row empty. Now it is the compact left column of
 * a two-column settings layout, and the upload control only appears once
 * someone chooses to change the picture — a file input sitting permanently
 * open is visual noise for something done roughly once.
 */
export function IdentityPanel({
  name,
  email,
  roleLabel,
  image,
  storageConfigured,
  lastLoginAt,
  createdAt,
}: {
  name: string;
  email: string;
  roleLabel: string;
  image: string | null;
  storageConfigured: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateProfilePicture,
    null,
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  return (
    <section className="flex h-full flex-col rounded-card border border-line bg-surface p-6">
      <div className="flex items-center gap-4">
        {preview || image ? (
          <Image
            src={preview ?? image ?? ""}
            alt=""
            width={64}
            height={64}
            unoptimized={Boolean(preview)}
            className="size-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-accent-tint text-heading text-accent-text">
            {name.slice(0, 1).toUpperCase()}
          </span>
        )}

        <div className="min-w-0">
          <p className="truncate text-heading text-foreground">{name}</p>
          <p className="truncate text-caption text-muted">{email}</p>
          <p className="mt-1 inline-flex rounded-full bg-surface-muted px-2.5 py-0.5 text-caption text-muted">
            {roleLabel}
          </p>
        </div>
      </div>

      {/*
        The card is `h-full` so it squares up with the two beside it, and that
        left a hollow middle. These two facts fill it with something worth
        reading: "when was this account last used" is the first thing you check
        when you suspect someone else has your password.
      */}
      <dl className="mt-6 flex flex-col gap-3 border-t border-line pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-caption text-muted">Last signed in</dt>
          <dd className="text-caption text-foreground">
            {lastLoginAt ?? "This is your first session"}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-caption text-muted">Account created</dt>
          <dd className="text-caption text-foreground">{createdAt}</dd>
        </div>
      </dl>

      <div className="mt-auto border-t border-line pt-5">
        {!storageConfigured ? (
          <p className="text-caption text-muted">
            Picture uploads are not switched on yet. Ask your developer to
            enable image storage.
          </p>
        ) : !editing ? (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="min-h-10 cursor-pointer rounded-full border border-line px-4 text-body text-foreground transition-colors hover:bg-surface-muted"
            >
              {image ? "Change picture" : "Add a picture"}
            </button>
            {image ? (
              <ConfirmAction
                action={removeProfilePicture}
                title="Remove your profile picture?"
                body="Your initial will be shown instead. You can upload a new one at any time."
                confirmLabel="Remove picture"
                successMessage="Profile picture removed."
                className="min-h-10 rounded-full border border-line px-4 text-body"
              >
                Remove
              </ConfirmAction>
            ) : null}
          </div>
        ) : (
          <form action={formAction} className="flex flex-col gap-3">
            <FormError message={state?.error} />
            <FormSuccess message={state?.success} />

            <input
              type="file"
              name="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              required
              onChange={(event) => {
                const file = event.target.files?.[0];
                setPreview(file ? URL.createObjectURL(file) : null);
              }}
              className="w-full rounded-control border border-line-input bg-surface px-3 py-2 text-caption text-foreground"
            />
            <p className="text-caption text-muted">
              Square works best. JPEG, PNG, WebP or AVIF, up to 4MB.
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={pending}
                className="min-h-10 cursor-pointer rounded-full bg-primary px-4 text-body text-ivory-light transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
              >
                {pending ? "Uploading…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setPreview(null);
                }}
                className="min-h-10 cursor-pointer rounded-full px-4 text-body text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export function PasswordPanel() {
  const [state, formAction, pending] = useActionState(changeOwnPassword, null);

  return (
    <section className="flex h-full flex-col rounded-card border border-line bg-surface p-6">
      <h2 className="text-heading text-foreground">Password</h2>
      <p className="mt-1 text-caption text-muted">
        At least 12 characters, with an uppercase letter, a lowercase letter and
        a number.
      </p>

      <form action={formAction} className="mt-5 flex flex-col gap-4">
        <FormError message={state?.error} />
        <FormSuccess message={state?.success} />

        <Field label="Current password" htmlFor="current">
          <Input
            id="current"
            name="current"
            type="password"
            required
            autoComplete="current-password"
          />
        </Field>

        {/* Two-up: the new password and its confirmation belong together, and
            stacking three identical fields made this the tallest thing on the
            page for no reason. */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New password" htmlFor="next">
            <Input
              id="next"
              name="next"
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirm" htmlFor="confirm">
            <Input
              id="confirm"
              name="confirm"
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="min-h-10 cursor-pointer self-start rounded-full bg-primary px-5 text-body text-ivory-light transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Changing…" : "Change password"}
        </button>
      </form>
    </section>
  );
}

export function SessionsPanel() {
  return (
    <section className="flex h-full flex-col rounded-card border border-line bg-surface p-6">
      <h2 className="text-heading text-foreground">Devices</h2>
      <p className="mt-1 text-caption text-muted">
        If you have signed in somewhere you no longer trust — a shared machine,
        a lost phone — this ends every session, including this one.
      </p>
      <div className="mt-4">
        <ConfirmAction
          action={signOutEverywhere}
          title="Sign out everywhere?"
          body="Every device is signed out, including this one. You will need to sign in again."
          confirmLabel="Sign out everywhere"
          successMessage="Signed out on all devices."
          tone="danger"
          className="min-h-10 rounded-full border border-line px-4 text-body"
        >
          Sign out everywhere
        </ConfirmAction>
      </div>
    </section>
  );
}
