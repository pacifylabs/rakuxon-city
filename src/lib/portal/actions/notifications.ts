"use server";

import { revalidatePath } from "next/cache";
import { verifyPortalSession } from "@/lib/portal/access";
import {
  markAllPortalNotificationsRead,
  markPortalNotificationRead,
} from "@/lib/portal/notifications";

export async function markNotificationRead(formData: FormData): Promise<void> {
  const user = await verifyPortalSession();
  const id = String(formData.get("notificationId") ?? "");
  if (!id) return;
  await markNotificationReadForUser(user.id, id);
}

export async function markNotificationReadById(notificationId: string): Promise<void> {
  const user = await verifyPortalSession();
  await markNotificationReadForUser(user.id, notificationId);
}

async function markNotificationReadForUser(
  userId: string,
  notificationId: string,
): Promise<void> {
  await markPortalNotificationRead(userId, notificationId);
  revalidatePath("/portal", "layout");
}

export async function markAllNotificationsRead(): Promise<void> {
  const user = await verifyPortalSession();
  await markAllPortalNotificationsRead(user.id);
  revalidatePath("/portal", "layout");
}
