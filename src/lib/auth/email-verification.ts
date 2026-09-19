import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { db } from "@/lib/db";
import { UserRole } from "@/generated/prisma/enums";

const TOKEN_TTL_HOURS = 48;

function hash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function verifyIdentifier(email: string): string {
  return `email-verify:${email}`;
}

export async function createEmailVerificationToken(
  email: string,
): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, role: true, emailVerified: true, isActive: true },
  });
  if (!user || !user.isActive || user.role !== UserRole.LISTER) return null;
  if (user.emailVerified) return null;

  const identifier = verifyIdentifier(email);
  await db.verificationToken.deleteMany({ where: { identifier } });

  const token = randomBytes(32).toString("base64url");
  await db.verificationToken.create({
    data: {
      identifier,
      token: hash(token),
      expires: new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000),
    },
  });

  return token;
}

export type EmailVerifyCheck =
  | { valid: true; email: string; userId: string }
  | { valid: false };

export async function consumeEmailVerificationToken(
  token: string,
): Promise<EmailVerifyCheck> {
  const row = await db.verificationToken.findUnique({
    where: { token: hash(token) },
  });

  if (!row || row.expires < new Date() || !row.identifier.startsWith("email-verify:")) {
    return { valid: false };
  }

  const email = row.identifier.slice("email-verify:".length);
  await db.verificationToken.deleteMany({ where: { token: hash(token) } });

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, role: true, isActive: true },
  });

  if (!user || !user.isActive || user.role !== UserRole.LISTER) {
    return { valid: false };
  }

  await db.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });

  return { valid: true, email, userId: user.id };
}
