import "server-only";
import { redirect } from "next/navigation";
import { UserRole } from "@/generated/prisma/enums";
import { getSession } from "@/lib/auth/session";

/** Signed-in lister only. Sends staff accounts to the admin console. */
export async function verifyPortalSession() {
  const user = await getSession();
  if (!user) redirect("/portal/login");
  if (user.role !== UserRole.LISTER) redirect("/admin");
  return user;
}
