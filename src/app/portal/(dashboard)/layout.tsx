import type { ReactNode } from "react";
import { verifyPortalSession } from "@/lib/portal/access";
import { getPlacement } from "@/lib/media";
import { PortalShell } from "@/components/portal/shell";

const LOGO_FALLBACK = {
  url: "/logo.png",
  alt: "Rakuxon City",
  width: 2172,
  height: 724,
};

export default async function PortalDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await verifyPortalSession();
  const logo = (await getPlacement("site.logo")) ?? LOGO_FALLBACK;

  return (
    <PortalShell user={user} logo={logo}>
      {children}
    </PortalShell>
  );
}
