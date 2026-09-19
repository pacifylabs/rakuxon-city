import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection for `/admin/*`.
 *
 * Named `proxy.ts`, not `middleware.ts` — Next.js 16 deprecated and renamed
 * the file convention (`middleware.js|ts` is still recognised for backward
 * compatibility, but this is the name Next documents going forward, and
 * proxy now defaults to the Node.js runtime rather than Edge).
 *
 * OPTIMISTIC ONLY, matching Next's own guidance (node_modules/next/dist/docs
 * /01-app/02-guides/authentication.md, "Optimistic checks with Proxy"):
 * "since Proxy runs on every route, including prefetched routes, ... avoid
 * database checks to prevent performance issues." This reads the cookie and
 * nothing else — no lookup, no expiry check. A present-but-expired or
 * present-but-revoked cookie is let through here and caught by
 * `verifySession()` in the DAL, which is the actual security boundary
 * (`src/lib/auth/dal.ts`). This file exists purely so a signed-out visitor
 * doesn't see a flash of a protected page before being redirected.
 *
 * `/admin/login` is excluded from the matcher entirely rather than checked
 * and let through, so there is no redirect loop to reason about.
 */
export default function proxy(request: NextRequest) {
  const hasSessionCookie = request.cookies.has("session");
  const path = request.nextUrl.pathname;

  if (!hasSessionCookie) {
    const loginUrl = new URL(
      path.startsWith("/portal") ? "/portal/login" : "/admin/login",
      request.url,
    );
    loginUrl.searchParams.set("from", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/((?!login|forgot-password|reset).*)",
    "/portal/((?!login|register).*)",
  ],
};
