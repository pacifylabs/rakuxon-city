import type { ReactNode } from "react";
import { verifyPortalSession } from "@/lib/portal/access";
import { getPlacement } from "@/lib/media";
import {
  countUnreadPortalNotifications,
  listPortalNotifications,
} from "@/lib/portal/notifications";
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

  const [notifications, unreadCount] = await Promise.all([
    listPortalNotifications(user.id),
    countUnreadPortalNotifications(user.id),
  ]);

  return (
    <PortalShell
      user={user}
      logo={logo}
      unreadCount={unreadCount}
      notifications={notifications.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        href: n.href,
        readAt: n.readAt,
        createdAt: n.createdAt,
      }))}
    >
      {children}
    </PortalShell>
  );
}
