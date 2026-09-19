"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db, hasDatabase } from "@/lib/db";
import { env } from "@/lib/env";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { portalRegisterSchema } from "@/lib/validation/portal-register";
import { UserRole } from "@/generated/prisma/enums";

const REGISTER_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };

export type RegisterState = { error?: string } | null;

export async function registerLister(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  if (!hasDatabase || !env.AUTH_SECRET) {
    return { error: "Registration is not available on this deployment yet." };
  }

  const ip = clientIp(await headers());
  const limited = rateLimit(`portal-register:${ip ?? "unknown"}`, REGISTER_LIMIT);
  if (!limited.allowed) {
    return { error: "Too many attempts. Wait a few minutes and try again." };
  }

  const parsed = portalRegisterSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
    phone: formData.get("phone"),
    organisation: formData.get("organisation") || undefined,
    listerKind: formData.get("listerKind"),
    consent: formData.get("consent") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const input = parsed.data;

  const existing = await db.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const user = await db.user.create({
    data: {
      email: input.email,
      passwordHash: hashPassword(input.password),
      name: input.displayName,
      role: UserRole.LISTER,
      listerProfile: {
        create: {
          displayName: input.displayName,
          phone: input.phone,
          organisation: input.organisation ?? null,
          listerKind: input.listerKind,
        },
      },
    },
  });

  await createSession(user.id);
  redirect("/portal");
}
