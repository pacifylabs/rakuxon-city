import "server-only";
import { redirect } from "next/navigation";
import { UserRole } from "@/generated/prisma/enums";
import { getSession } from "@/lib/auth/session";

/** Signed-in lister with a verified email. Staff go to admin. */
export async function verifyPortalSession() {
  const user = await getSession();
  if (!user) redirect("/portal/login");
  if (user.role !== UserRole.LISTER) redirect("/admin");
  if (!user.emailVerified) {
    redirect(
      `/portal/register/success?email=${encodeURIComponent(user.email)}`,
    );
  }
  return user;
}
