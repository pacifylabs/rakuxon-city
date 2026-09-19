import { z } from "zod";
import { ListerKind } from "@/generated/prisma/enums";
import { validatePasswordStrength } from "@/lib/auth/password";

export const portalRegisterSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z
    .string()
    .superRefine((value, ctx) => {
      for (const message of validatePasswordStrength(value).errors) {
        ctx.addIssue({ code: "custom", message });
      }
    }),
  displayName: z.string().min(2).max(120),
  phone: z.string().min(10).max(20),
  organisation: z.string().max(120).optional(),
  listerKind: z.enum(ListerKind),
  consent: z.literal(
    true,
    "You must accept the privacy policy to register",
  ),
});
