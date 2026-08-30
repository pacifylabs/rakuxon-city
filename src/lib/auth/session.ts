import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { db, hasDatabase } from "@/lib/db";
import type { UserRole, SalesTrack } from "@/generated/prisma/enums";

/**
 * Hand-rolled, database-backed sessions.
 *
 * next-auth@5.0.0-beta.20 was tried first and rejected on hard evidence, not
 * a hunch: `signIn()` called from a Server Action throws inside Next 16's
 * async `headers()` API ("used headers().forEach... headers() returns a
 * Promise"), escalating to an unrecoverable
 * `TypeError: Headers constructor: Key Symbol(async_id_symbol)...`. Separately,
 * and reproduced again on a fully clean `.next` cache, its own
 * `/api/auth/[...nextauth]` route handler fails to bundle under Turbopack:
 * "Could not parse module '.../vendored/contexts/app-router-context.js',
 * file not found." Two independent failures in the credentials flow itself,
 * on the exact Next.js version this project runs. Its own peerDependencies
 * (`^14.0.0-0 || ^15.0.0-0`) already said it didn't claim Next 16 support;
 * this is that gap being real, not theoretical.
 *
 * What's here instead is the pattern from Next's own guide
 * (node_modules/next/dist/docs/01-app/02-guides/authentication.md,
 * "Database Sessions") — a `Session` row per login, an opaque random token
 * in an httpOnly cookie, and a lookup on every authenticated request. It is
 * a genuinely small amount of code for credentials-only auth with no OAuth
 * providers in scope, has no beta dependency, and — unlike the JWT strategy
 * next-auth would have forced for a credentials-only setup — actually
 * satisfies FR-M1.1.2 ("sessions stored in database") and FR-M1.1.5
 * ("logout clears session from database") as written, which next-auth could
 * not have done here regardless of whether it ran.
 *
 * The `Session` table already existed in the schema (added for next-auth's
 * adapter, migrated to the real database before this pivot) and needed no
 * changes — id/sessionToken/userId/expires is exactly this pattern's shape.
 */

const SESSION_COOKIE = "session";
const SESSION_DAYS = 30;

/** Never the raw token — a DB dump should not hand over live sessions. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  salesTrack: SalesTrack | null;
  mustChangePassword: boolean;
  /** Profile picture, uploaded through Settings. Null until they set one. */
  image: string | null;
};

/** FR-M1.1.4/FR-M1.1.2 — creates the row, sets the cookie. Called only after `verifyPassword`. */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  // Stamping `lastLoginAt` here, at the single point where a session is
  // created, is the only way it stays honest. It is read on the Team screen
  // and in Settings to answer "is this account still in use", and nothing was
  // ever writing it — so every user read "Never signed in" no matter how often
  // they signed in, which is worse than showing nothing at all.
  await Promise.all([
    db.session.create({
      data: { sessionToken: hashToken(token), userId, expires },
    }),
    db.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    }),
  ]);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    sameSite: "lax",
    path: "/",
  });
}

/**
 * The one place a session cookie is turned into a user. `cache()`-wrapped so
 * a page that calls this multiple times during one render (layout, page,
 * a leaf component) hits the database once, not once per call — the same
 * technique Next's own DAL example uses.
 */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  if (!hasDatabase) return null;

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { sessionToken: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expires < new Date() || !session.user.isActive) {
    return null;
  }

  const { user } = session;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    salesTrack: user.salesTrack,
    mustChangePassword: user.mustChangePassword,
    image: user.image,
  };
});

/** FR-M1.1.5 — removes the database row, not just the cookie. */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token && hasDatabase) {
    await db.session
      .delete({ where: { sessionToken: hashToken(token) } })
      .catch(() => {
        // Already gone (expired cleanup, or signed out elsewhere) — deleting
        // a session that no longer exists is not a failure worth surfacing.
      });
  }

  cookieStore.delete(SESSION_COOKIE);
}
