"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/access";
import {
  hashPassword,
  generateTemporaryPassword,
} from "@/lib/auth/password";
import { UserRole, SalesTrack } from "@/generated/prisma/enums";
import { z } from "zod";

export type ActionState =
  | { error?: string; success?: string; temporaryPassword?: string }
  | null;

const userFormSchema = z
  .object({
    name: z.string().min(2).max(120),
    email: z.email(),
    role: z.enum(UserRole),
    salesTrack: z.enum(SalesTrack).nullable(),
  })
  .refine(
    (value) => value.role !== UserRole.SALES || value.salesTrack !== null,
    {
      path: ["salesTrack"],
      message: "A sales user needs a track",
    },
  );

function readForm(formData: FormData) {
  const role = String(formData.get("role") ?? "") as UserRole;
  const rawTrack = String(formData.get("salesTrack") ?? "");
  return {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    role,
    // The schema comment on `User.salesTrack` is explicit: null for admin and
    // investor_manager, set for sales. Forcing it null for the other roles
    // here stops a stale select value persisting a track that would then be
    // used for scoping a user who should not be scoped at all.
    salesTrack:
      role === UserRole.SALES && rawTrack
        ? (rawTrack as SalesTrack)
        : null,
  };
}

/**
 * Creating a user issues a temporary password and sets `mustChangePassword`,
 * so the admin never chooses someone else's real credential and the account
 * cannot be used until its owner replaces it (FR-M1.1.3/FR-M1.1.4).
 *
 * The generated password is returned to the caller once, for the admin to
 * pass on. It is not stored in plain form anywhere and cannot be retrieved
 * again — a reset issues a new one.
 */
export async function createUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = userFormSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue?.message ?? "Check the form and try again." };
  }

  const temporaryPassword = generateTemporaryPassword();

  try {
    await db.user.create({
      data: {
        ...parsed.data,
        passwordHash: hashPassword(temporaryPassword),
        mustChangePassword: true,
      },
    });
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code: unknown }).code)
        : null;
    if (code === "P2002") {
      return { error: "A user with that email already exists." };
    }
    console.error("[admin] user create failed", code ?? error);
    return { error: "Could not create the user. Please try again." };
  }

  revalidatePath("/admin/users");
  return {
    success: `${parsed.data.name} created.`,
    temporaryPassword,
  };
}

export async function updateUser(
  userId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = userFormSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue?.message ?? "Check the form and try again." };
  }

  try {
    await db.user.update({ where: { id: userId }, data: parsed.data });
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code: unknown }).code)
        : null;
    if (code === "P2002") {
      return { error: "A user with that email already exists." };
    }
    console.error("[admin] user update failed", code ?? error);
    return { error: "Could not save the user. Please try again." };
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?saved=1");
}

/**
 * Deactivation, not deletion — a user is referenced by enquiries they were
 * assigned, notes they wrote and status changes they made, and those records
 * should keep naming them.
 *
 * Guarded two ways: an admin cannot deactivate themselves (an instant
 * lockout), and the last active admin cannot be deactivated at all, which
 * would leave nobody able to manage users.
 */
export async function setUserActive(formData: FormData): Promise<void> {
  const actor = await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const isActive = formData.get("isActive") === "1";

  // Guards return rather than redirect — these are called from confirmation
  // modals now, and a redirect thrown inside a transition escapes past the
  // dialog instead of closing it. The controls are not offered in either of
  // these cases anyway; this is the second line of defence.
  if (!isActive && userId === actor.id) return;

  if (!isActive) {
    const target = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (target?.role === UserRole.ADMIN) {
      const activeAdmins = await db.user.count({
        where: { role: UserRole.ADMIN, isActive: true },
      });
      if (activeAdmins <= 1) return;
    }
  }

  await db.user.update({ where: { id: userId }, data: { isActive } });

  // Sessions are database rows, so revoking access is immediate rather than
  // waiting for a token to expire — a deactivated user is signed out now.
  if (!isActive) {
    await db.session.deleteMany({ where: { userId } });
  }

  revalidatePath("/admin/users");
}

/** Issues a fresh temporary password and forces a change on next sign-in. */
export async function resetUserPassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const temporaryPassword = generateTemporaryPassword();

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  if (!user) return { error: "User not found." };

  await db.user.update({
    where: { id: userId },
    data: {
      passwordHash: hashPassword(temporaryPassword),
      mustChangePassword: true,
      passwordChangedAt: null,
    },
  });

  // Every existing session is dropped, or the old one would keep working
  // and the reset would be cosmetic.
  await db.session.deleteMany({ where: { userId } });

  revalidatePath("/admin/users");
  return {
    success: `New temporary password for ${user.name}.`,
    temporaryPassword,
  };
}
