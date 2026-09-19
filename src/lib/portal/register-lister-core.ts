import "server-only";
import { db, hasDatabase } from "@/lib/db";
import { env } from "@/lib/env";
import { origin } from "@/lib/seo";
import { hashPassword } from "@/lib/auth/password";
import { createEmailVerificationToken } from "@/lib/auth/email-verification";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { portalRegisterSchema } from "@/lib/validation/portal-register";
import { sendEmail } from "@/lib/email/send";
import { emailVerificationEmail } from "@/lib/email/templates";
import { UserRole } from "@/generated/prisma/enums";

const REGISTER_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };

export type RegisterListerErrorCode =
  | "unavailable"
  | "rate_limited"
  | "invalid"
  | "duplicate"
  | "disposable_email";

export type RegisterListerResult =
  | { ok: true; email: string }
  | { ok: false; code: RegisterListerErrorCode };

export async function sendListerVerificationEmail(
  email: string,
  displayName: string,
): Promise<void> {
  const token = await createEmailVerificationToken(email);
  if (!token) return;

  const verifyUrl = `${origin()}/portal/verify-email?token=${encodeURIComponent(token)}`;
  const message = emailVerificationEmail({ name: displayName, verifyUrl });
  void sendEmail({
    to: email,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });
}

/**
 * Shared registration logic — used by the POST route so sign-up does not depend
 * on Server Action IDs (which break when HTML/JS and the server are on
 * different Vercel deployments).
 */
export async function registerListerFromForm(
  formData: FormData,
  headers: { get(name: string): string | null },
): Promise<RegisterListerResult> {
  if (!hasDatabase || !env.AUTH_SECRET) {
    return { ok: false, code: "unavailable" };
  }

  const ip = clientIp(headers);
  const limited = rateLimit(`portal-register:${ip ?? "unknown"}`, REGISTER_LIMIT);
  if (!limited.allowed) {
    return { ok: false, code: "rate_limited" };
  }

  const parsed = portalRegisterSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
    phone: formData.get("phone"),
    organisation: formData.get("organisation") || undefined,
    listerKind: formData.get("listerKind"),
    consent: formData.get("consent") === "on",
  });

  if (!parsed.success) {
    const disposable = parsed.error.issues.some((i) =>
      i.message.includes("disposable"),
    );
    return { ok: false, code: disposable ? "disposable_email" : "invalid" };
  }

  const input = parsed.data;

  const existing = await db.user.findUnique({
    where: { email: input.email },
    select: { id: true, emailVerified: true },
  });
  if (existing) {
    if (!existing.emailVerified) {
      await sendListerVerificationEmail(input.email, input.displayName);
      return { ok: true, email: input.email };
    }
    return { ok: false, code: "duplicate" };
  }

  await db.user.create({
    data: {
      email: input.email,
      passwordHash: hashPassword(input.password),
      name: input.displayName,
      role: UserRole.LISTER,
      listerProfile: {
        create: {
          displayName: input.displayName,
          phone: input.phone,
          organisation: input.organisation ?? null,
          listerKind: input.listerKind,
        },
      },
    },
  });

  await sendListerVerificationEmail(input.email, input.displayName);

  return { ok: true, email: input.email };
}

export const registerListerErrorMessages: Record<
  RegisterListerErrorCode,
  string
> = {
  unavailable: "Registration is not available on this deployment yet.",
  rate_limited: "Too many attempts. Wait a few minutes and try again.",
  invalid: "Check the form and try again.",
  duplicate: "An account with this email already exists.",
  disposable_email:
    "Use a permanent email address. Temporary or disposable inboxes are not allowed.",
};
