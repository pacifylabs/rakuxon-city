import "server-only";
import { redirect } from "next/navigation";
import { getSession, type SessionUser } from "@/lib/auth/session";

/**
 * The Data Access Layer's session check — Next's own recommended pattern
 * (see the authentication guide's "Creating a Data Access Layer" section).
 *
 * `proxy.ts` only does an optimistic check (cookie present or not, per
 * Next's own guidance to avoid a database round trip on every prefetched
 * route). This is the real, secure check: it hits the database, confirms
 * the session still exists and hasn't expired, and is what every `/admin`
 * page and Server Action should actually call before doing anything.
 */
export async function verifySession(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  return user;
}

/** For pages/actions that need a specific role, not just any session. */
export async function requireRole(
  ...roles: SessionUser["role"][]
): Promise<SessionUser> {
  const user = await verifySession();
  if (!roles.includes(user.role)) redirect("/admin");
  return user;
}
