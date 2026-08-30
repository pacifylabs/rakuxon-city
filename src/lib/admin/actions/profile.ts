"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hasCloudinary } from "@/lib/env";
import { verifySession } from "@/lib/auth/dal";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "@/lib/admin/cloudinary";
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from "@/lib/auth/password";
import { deleteSession } from "@/lib/auth/session";

export type ProfileState = { error?: string; success?: string } | null;

const MAX_AVATAR_BYTES = 4 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Your own password, changed from Settings.
 *
 * Distinct from `resetUserPassword` in actions/users.ts, which is an admin
 * resetting somebody else's and issuing a temporary one. This is a person
 * changing their own, so it requires the current password — a session alone
 * is not enough when the attack is an unattended unlocked laptop.
 */
export async function changeOwnPassword(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await verifySession();

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const record = await db.user.findUnique({ where: { id: user.id } });
  if (!record || !verifyPassword(current, record.passwordHash)) {
    return { error: "Your current password is incorrect." };
  }
  if (next !== confirm) {
    return { error: "The new password and its confirmation don't match." };
  }
  if (verifyPassword(next, record.passwordHash)) {
    return { error: "That is already your current password." };
  }

  const strength = validatePasswordStrength(next);
  if (!strength.valid) {
    return { error: strength.errors[0] };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      passwordHash: hashPassword(next),
      mustChangePassword: false,
      passwordChangedAt: new Date(),
    },
  });

  revalidatePath("/admin/settings");
  return {
    success:
      "Password changed. Use \u201cSign out everywhere\u201d below if you think someone else had the old one.",
  };
}

/** Profile picture. Stored on `User.image`, uploaded to Cloudinary. */
export async function updateProfilePicture(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await verifySession();

  if (!hasCloudinary) {
    return {
      error:
        "Image uploads are not switched on yet. Ask your developer to enable image storage.",
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image." };
  }
  if (!ACCEPTED.includes(file.type)) {
    return { error: "Upload a JPEG, PNG, WebP or AVIF image." };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { error: "That image is larger than 4MB." };
  }

  try {
    const uploaded = await uploadToCloudinary(file, "rakuxon/avatars");

    const previous = await db.user.findUnique({
      where: { id: user.id },
      select: { image: true },
    });

    await db.user.update({
      where: { id: user.id },
      data: { image: uploaded.url },
    });

    // Replace, don't accumulate — an avatar changed weekly would otherwise
    // leave every old copy paid for in Cloudinary forever.
    if (previous?.image) await deleteFromCloudinary(previous.image);
  } catch (error) {
    console.error("[admin] avatar upload failed", error);
    return { error: "Upload failed. Please try again." };
  }

  revalidatePath("/admin", "layout");
  return { success: "Profile picture updated." };
}

export async function removeProfilePicture(): Promise<void> {
  const user = await verifySession();

  const record = await db.user.findUnique({
    where: { id: user.id },
    select: { image: true },
  });

  await db.user.update({ where: { id: user.id }, data: { image: null } });
  if (record?.image) await deleteFromCloudinary(record.image);

  revalidatePath("/admin", "layout");
}

/**
 * Ordinary sign-out — this device only.
 *
 * Distinct from `signOutEverywhere` below, which revokes every session the
 * user has. This is the one people reach for daily, and until now it did not
 * exist anywhere in the admin: the sidebar linked to Settings, and Settings
 * only offered the destructive version. Signing off a shared machine should
 * not require ending your session on your own phone too.
 */
export async function signOut(): Promise<void> {
  await deleteSession();
  redirect("/admin/login");
}

/** Signs the current user out of every device, including this one. */
export async function signOutEverywhere(): Promise<void> {
  const user = await verifySession();
  await db.session.deleteMany({ where: { userId: user.id } });
  await deleteSession();
}
