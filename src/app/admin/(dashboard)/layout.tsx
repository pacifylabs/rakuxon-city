import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/dal";
import { getPlacement } from "@/lib/media";
import { AdminShell } from "@/components/admin/shell";

/** Falls back to the committed file if the slot is missing, so a bad
 *  placement cannot leave the admin without a logo. */
const LOGO_FALLBACK = {
  url: "/logo.png",
  alt: "Rakuxon City",
  width: 2172,
  height: 724,
};

/**
 * The admin shell — everything under `/admin` except `/admin/login` and
 * `/admin/change-password`, which sit outside this route group precisely so
 * they never get the sidebar (a signed-out visitor should never see staff
 * navigation, and someone mid-forced-password-change shouldn't be tempted to
 * click away before finishing it).
 *
 * The logo is the real site mark, resolved from the same `site.logo`
 * placement the public header uses — so swapping it in Media → Placements
 * updates both surfaces at once.
 */
export default async function AdminShellLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await verifySession();

  // FR-M1.1.4 — a temporary password blocks everything else until changed.
  if (user.mustChangePassword) {
    redirect("/admin/change-password");
  }

  const logo = (await getPlacement("site.logo")) ?? LOGO_FALLBACK;

  return (
    <AdminShell user={user} logo={logo}>
      {children}
    </AdminShell>
  );
}
