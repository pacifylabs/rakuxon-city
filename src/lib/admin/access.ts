import "server-only";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/dal";
import type { SessionUser } from "@/lib/auth/session";
import { ListingType } from "@/generated/prisma/enums";

/**
 * The access matrix from docs/PHASE_7_ADMIN_DASHBOARD.md, enforced in the
 * query layer rather than only in the sidebar.
 *
 * 03_IMPLEMENTATION_PLAN.md Phase 7 item 2 is explicit about this: "Role and
 * track scoping enforced in middleware **and** in the query layer", and the
 * phase's own verify step is "a land-track sales user cannot reach homes
 * enquiries by URL manipulation". A hidden nav link is a courtesy; these
 * functions are the actual boundary, and every admin page calls one.
 */

/** Which listing track a user may act on. `null` = both. */
export function trackFor(user: SessionUser): ListingType | null {
  if (user.role !== "SALES") return null;
  if (user.salesTrack === "LAND") return ListingType.LAND;
  if (user.salesTrack === "HOMES") return ListingType.HOME;
  return null; // BOTH
}

export function canAccessTrack(user: SessionUser, type: ListingType): boolean {
  if (user.role === "ADMIN") return true;
  if (user.role === "INVESTOR_MANAGER") return false;
  const scope = trackFor(user);
  return scope === null || scope === type;
}

/**
 * Session + track gate for the listing and enquiry surfaces. Redirects rather
 * than 403s: a signed-in user who lands somewhere they can't be is better off
 * on their dashboard than on an error page, and the redirect is what makes
 * URL manipulation a dead end rather than a leak.
 */
export async function requireTrack(type: ListingType): Promise<SessionUser> {
  const user = await verifySession();
  if (!canAccessTrack(user, type)) redirect("/admin");
  return user;
}

/** Admin-only surfaces: articles, users, import, settings. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await verifySession();
  if (user.role !== "ADMIN") redirect("/admin");
  return user;
}

/** Estates and media: everyone except the investor manager. */
export async function requireStaff(): Promise<SessionUser> {
  const user = await verifySession();
  if (user.role === "INVESTOR_MANAGER") redirect("/admin");
  return user;
}

/** Investor enquiries: admin and investor manager only. */
export async function requireInvestorAccess(): Promise<SessionUser> {
  const user = await verifySession();
  if (user.role !== "ADMIN" && user.role !== "INVESTOR_MANAGER") {
    redirect("/admin");
  }
  return user;
}
