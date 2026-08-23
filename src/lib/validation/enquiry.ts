import { z } from "zod";
import { EnquirySource } from "@/generated/prisma/enums";

/**
 * Nigerian numbers arrive as 0803…, +234803… or 234803…. All three are valid
 * input; normalising is the API route's job, not the validator's.
 */
export const nigerianPhoneSchema = z
  .string()
  .trim()
  .regex(
    /^(?:\+?234|0)[789]\d{9}$/,
    "Enter a phone number we can reach you on, like 0803 123 4567",
  );

export const enquirySchema = z.object({
  source: z.enum(EnquirySource),
  listingId: z.string().nullable().optional(),
  pagePath: z.string().min(1),
  campaign: z.string().max(120).nullable().optional(),
  name: z.string().trim().min(2, "Tell us your name").max(120),
  email: z.email("Enter an email address we can reply to"),
  phone: nigerianPhoneSchema,
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little about what you're looking for")
    .max(2000),
  preferredInspectionDate: z.date().nullable().optional(),
  /** FR-3.5 — explicit, never pre-ticked, never inferred from submission. */
  consent: z.literal(true, "Please confirm you have read the privacy policy"),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
