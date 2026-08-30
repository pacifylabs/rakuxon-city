"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import { origin } from "@/lib/seo";
import { sendEmail } from "@/lib/email/send";
import {
  createResetToken,
  consumeResetToken,
} from "@/lib/auth/reset";
import {
  hashPassword,
  validatePasswordStrength,
} from "@/lib/auth/password";

export type ResetState = { error?: string; sent?: boolean } | null;

/**
 * Step one — request a link.
 *
 * Always reports the same thing, whether or not the address belongs to an
 * account. Saying "no user with that email" would let anyone test which
 * addresses are staff accounts, which is a real disclosure on a small team
 * whose names are on the About page.
 */
export async function requestPasswordReset(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  if (!hasDatabase) {
    return { error: "The admin is not configured." };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email.includes("@")) {
    return { error: "Enter the email address you sign in with." };
  }

  const token = await createResetToken(email);

  if (token) {
    const link = `${origin()}/admin/reset?token=${encodeURIComponent(token)}`;

    // Never fails the request. If the send fails the token still exists, and
    // an admin can issue a reset from Team — telling the visitor it broke
    // would only get the form submitted again.
    const result = await sendEmail({
      to: email,
      subject: "Reset your Rakuxon City admin password",
      text: [
        "Someone asked to reset the password on your Rakuxon City admin account.",
        "",
        `Open this link to set a new one: ${link}`,
        "",
        "The link works once and expires in an hour.",
        "If this wasn't you, ignore this email — nothing has changed.",
      ].join("\n"),
      html: `
        <p>Someone asked to reset the password on your Rakuxon City admin account.</p>
        <p><a href="${link}">Set a new password</a></p>
        <p>The link works once and expires in an hour.</p>
        <p>If this wasn't you, ignore this email — nothing has changed.</p>
      `,
    });

    if (result.status !== "sent") {
      console.warn("[admin] reset email not delivered:", result);
    }
  }

  return { sent: true };
}

/** Step two — set the new password against a token. */
export async function completePasswordReset(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const token = String(formData.get("token") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (next !== confirm) {
    return { error: "The two passwords don't match." };
  }

  const strength = validatePasswordStrength(next);
  if (!strength.valid) {
    return { error: strength.errors[0] };
  }

  // Consumed here, not at render time — a token must survive being looked at
  // and die on being used.
  const check = await consumeResetToken(token);
  if (!check.valid) {
    return {
      error: "That link has expired or has already been used. Request a new one.",
    };
  }

  const user = await db.user.findUnique({
    where: { email: check.email },
    select: { id: true },
  });
  if (!user) {
    return { error: "That link is no longer valid." };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      passwordHash: hashPassword(next),
      mustChangePassword: false,
      passwordChangedAt: new Date(),
    },
  });

  // Whoever prompted this reset may have had a live session. Drop them all.
  await db.session.deleteMany({ where: { userId: user.id } });

  redirect("/admin/login?reset=1");
}
