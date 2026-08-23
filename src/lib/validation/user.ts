import { z } from "zod";
import { SalesTrack, UserRole } from "@/generated/prisma/enums";

export const userSchema = z
  .object({
    email: z.email(),
    name: z.string().trim().min(2).max(120),
    role: z.enum(UserRole),
    salesTrack: z.enum(SalesTrack).nullable().optional(),
    isActive: z.boolean().default(true),
  })
  .superRefine((value, ctx) => {
    // A sales user without a track receives no round-robin assignment and their
    // inbox scopes to nothing — silent, and the reason enquiries would vanish.
    if (value.role === UserRole.SALES && !value.salesTrack) {
      ctx.addIssue({
        code: "custom",
        path: ["salesTrack"],
        message: "Sales users need a track: land, homes, or both",
      });
    }

    if (value.role !== UserRole.SALES && value.salesTrack) {
      ctx.addIssue({
        code: "custom",
        path: ["salesTrack"],
        message: "Only sales users carry a track",
      });
    }
  });

export type UserInput = z.infer<typeof userSchema>;
