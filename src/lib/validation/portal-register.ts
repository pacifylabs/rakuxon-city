import { z } from "zod";
import { ListerKind } from "@/generated/prisma/enums";
import { validatePasswordStrength } from "@/lib/auth/password-policy";
import { isDisposableEmail } from "@/lib/validation/disposable-email";

export const portalRegisterSchema = z.object({
  email: z
    .email()
    .transform((value) => value.trim().toLowerCase())
    .superRefine((value, ctx) => {
      if (isDisposableEmail(value)) {
        ctx.addIssue({
          code: "custom",
          message:
            "Use a permanent email address. Temporary or disposable inboxes are not allowed.",
        });
      }
    }),
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
