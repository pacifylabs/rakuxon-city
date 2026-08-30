import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { db } from "@/lib/db";

/**
 * Password-reset tokens.
 *
 * Stored in `VerificationToken`, which has been sitting unused since the
 * next-auth adapter was removed — `identifier` / `token` / `expires` is
 * exactly this shape, so no migration is needed. `identifier` holds the email
 * rather than a user id, so a request for an address that does not exist can
 * be handled identically to one that does (see `requestReset`).
 *
 * The token is hashed before storage, like session tokens: a leaked database
 * dump should not hand over live reset links.
 */
const TOKEN_TTL_MINUTES = 60;

function hash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Issues a token for an email, or returns null if no active user has it.
 *
 * The CALLER must not vary its response on that null — a forgot-password form
 * that says "no account with that email" is a user-enumeration oracle. The
 * page returns the same confirmation either way.
 */
export async function createResetToken(email: string): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, isActive: true },
  });
  if (!user || !user.isActive) return null;

  // One live token per address. Requesting a second link should invalidate
  // the first, or an old email remains usable for the full hour.
  await db.verificationToken.deleteMany({ where: { identifier: email } });

  const token = randomBytes(32).toString("base64url");
  await db.verificationToken.create({
    data: {
      identifier: email,
      token: hash(token),
      expires: new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000),
    },
  });

  return token;
}

export type ResetTokenCheck =
  | { valid: true; email: string }
  | { valid: false };

/** Verifies a token without consuming it, for rendering the set-password form. */
export async function checkResetToken(
  token: string,
): Promise<ResetTokenCheck> {
  const row = await db.verificationToken.findUnique({
    where: { token: hash(token) },
  });

  if (!row || row.expires < new Date()) return { valid: false };
  return { valid: true, email: row.identifier };
}

/** Consumes the token. Single use — deleted whether or not the update succeeds. */
export async function consumeResetToken(
  token: string,
): Promise<ResetTokenCheck> {
  const check = await checkResetToken(token);
  await db.verificationToken.deleteMany({ where: { token: hash(token) } });
  return check;
}

/** Housekeeping — expired rows are dead weight and a small disclosure risk. */
export async function purgeExpiredResetTokens(): Promise<void> {
  await db.verificationToken.deleteMany({
    where: { expires: { lt: new Date() } },
  });
}
