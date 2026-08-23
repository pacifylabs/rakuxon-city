import { z } from "zod";
import { nigerianPhoneSchema } from "./enquiry";

/**
 * Banded, never a figure. The site collects a range privately and publishes
 * nothing back — FR-4.2 and the SEC exposure logged in PRD §8.
 */
export const capitalBands = [
  "under-50m",
  "50m-150m",
  "150m-500m",
  "above-500m",
  "prefer-not-to-say",
] as const;

export const projectInterests = [
  "land-development",
  "residential-build",
  "mixed-use",
  "undecided",
] as const;

export const investorEnquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  organisation: z.string().trim().max(160).nullable().optional(),
  email: z.email("Enter an email address we can reply to"),
  phone: nigerianPhoneSchema,
  capitalBand: z.enum(capitalBands),
  projectInterest: z.enum(projectInterests),
  message: z.string().trim().min(10).max(2000),
  consent: z.literal(true, "Please confirm you have read the privacy policy"),
});

export type InvestorEnquiryInput = z.infer<typeof investorEnquirySchema>;
