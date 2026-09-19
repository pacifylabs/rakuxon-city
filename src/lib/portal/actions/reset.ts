"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import { origin } from "@/lib/seo";
import { sendEmail } from "@/lib/email/send";
import {
  passwordChangedEmail,
  passwordResetEmail,
} from "@/lib/email/templates";
import {
  createResetToken,
  consumeResetToken,
} from "@/lib/auth/reset";
import {
  hashPassword,
  validatePasswordStrength,
} from "@/lib/auth/password";
import { UserRole } from "@/generated/prisma/enums";

export type ResetState = { error?: string; sent?: boolean } | null;

export async function requestPortalPasswordReset(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  if (!hasDatabase) {
    return { error: "The portal is not configured." };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email.includes("@")) {
    return { error: "Enter the email address you registered with." };
  }

  const token = await createResetToken(email, { roles: [UserRole.LISTER] });
  if (token) {
    const link = `${origin()}/portal/reset?token=${encodeURIComponent(token)}`;
    const message = passwordResetEmail({
      resetUrl: link,
      accountLabel: "lister portal",
    });

    const result = await sendEmail({
      to: email,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });

    if (result.status !== "sent") {
      console.warn("[portal] reset email not delivered:", result);
    }
  }

  return { sent: true };
}

export async function completePortalPasswordReset(
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

  const check = await consumeResetToken(token);
  if (!check.valid) {
    return {
      error: "That link has expired or has already been used. Request a new one.",
    };
  }

  const user = await db.user.findUnique({
    where: { email: check.email },
    select: { id: true, name: true, role: true },
  });
  if (!user || user.role !== UserRole.LISTER) {
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

  await db.session.deleteMany({ where: { userId: user.id } });

  const changed = passwordChangedEmail({
    name: user.name,
    signInUrl: `${origin()}/portal/login`,
  });
  void sendEmail({
    to: check.email,
    subject: changed.subject,
    html: changed.html,
    text: changed.text,
  });

  redirect("/portal/login?reset=1");
}
