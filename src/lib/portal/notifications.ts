import "server-only";
import { db } from "@/lib/db";
import { PortalNotificationKind } from "@/generated/prisma/enums";

export async function listPortalNotifications(userId: string, limit = 20) {
  return db.portalNotification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function countUnreadPortalNotifications(userId: string) {
  return db.portalNotification.count({
    where: { userId, readAt: null },
  });
}

export async function createPortalNotification(input: {
  userId: string;
  kind: PortalNotificationKind;
  title: string;
  body?: string;
  href?: string;
}) {
  return db.portalNotification.create({ data: input });
}

export async function markPortalNotificationRead(
  userId: string,
  notificationId: string,
): Promise<void> {
  await db.portalNotification.updateMany({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  });
}

export async function markAllPortalNotificationsRead(userId: string): Promise<void> {
  await db.portalNotification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
