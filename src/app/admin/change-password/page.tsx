import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/auth/dal";
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from "@/lib/auth/password";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const ERROR_MESSAGES: Record<string, string> = {
  current: "Current password is incorrect.",
  mismatch: "New password and confirmation don't match.",
  weak: "New password needs 12+ characters, an uppercase letter, a lowercase letter, and a number.",
};

/**
 * FR-M1.1.4 — reached after login when `mustChangePassword` is set (a new
 * staff account's temporary password), and reachable any time after that
 * for a voluntary change. Requires the current password, not just a valid
 * session — someone at an unlocked, unattended workstation should not be
 * able to lock the real owner out.
 */
export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await verifySession();
  const { error } = await searchParams;

  async function changePassword(formData: FormData) {
    "use server";

    const current = String(formData.get("current") ?? "");
    const next = String(formData.get("next") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    const record = await db.user.findUnique({ where: { id: user.id } });
    if (!record || !verifyPassword(current, record.passwordHash)) {
      redirect("/admin/change-password?error=current");
    }

    if (next !== confirm) {
      redirect("/admin/change-password?error=mismatch");
    }

    const strength = validatePasswordStrength(next);
    if (!strength.valid) {
      redirect("/admin/change-password?error=weak");
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashPassword(next),
        mustChangePassword: false,
        passwordChangedAt: new Date(),
      },
    });

    redirect("/admin");
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <p className="text-eyebrow text-muted">Rakuxon City</p>
        <h1 className="mt-2 text-display-m text-foreground">
          Change your password
        </h1>
        {user.mustChangePassword ? (
          <p className="mt-3 text-body text-muted">
            This account was created with a temporary password. Set a real
            one to continue.
          </p>
        ) : null}

        {error && ERROR_MESSAGES[error] ? (
          <p
            role="alert"
            className="mt-4 rounded-control border border-error/30 bg-error/5 px-4 py-3 text-caption text-error"
          >
            {ERROR_MESSAGES[error]}
          </p>
        ) : null}

        <form action={changePassword} className="mt-8 flex flex-col gap-5">
          <Field label="Current password" htmlFor="cp-current">
            <Input
              id="cp-current"
              name="current"
              type="password"
              required
              autoComplete="current-password"
            />
          </Field>
          <Field label="New password" htmlFor="cp-next">
            <Input
              id="cp-next"
              name="next"
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirm new password" htmlFor="cp-confirm">
            <Input
              id="cp-confirm"
              name="confirm"
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
            />
          </Field>
          <Button type="submit" className="mt-2 cursor-pointer">
            Change password
          </Button>
        </form>
      </div>
    </main>
  );
}
