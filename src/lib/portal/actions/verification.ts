"use server";

import { db } from "@/lib/db";
import { sendListerVerificationEmail } from "@/lib/portal/register-lister-core";
import { UserRole } from "@/generated/prisma/enums";

export type ResendState = { error?: string; sent?: boolean } | null;

export async function resendListerVerification(
  _prev: ResendState,
  formData: FormData,
): Promise<ResendState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email.includes("@")) {
    return { error: "Enter a valid email address." };
  }

  const user = await db.user.findUnique({
    where: { email },
    select: { name: true, role: true, emailVerified: true, isActive: true },
  });

  if (
    user &&
    user.isActive &&
    user.role === UserRole.LISTER &&
    !user.emailVerified
  ) {
    await sendListerVerificationEmail(email, user.name);
  }

  return { sent: true };
}
