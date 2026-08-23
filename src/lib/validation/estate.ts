import { z } from "zod";
import { EstateStatus } from "@/generated/prisma/enums";
import { slugSchema } from "./listing";

export const estateSchema = z.object({
  slug: slugSchema,
  name: z.string().min(2).max(120),
  location: z.string().min(2).max(120),
  state: z.string().min(2).max(60),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  description: z.string().min(20),
  amenities: z.array(z.string().min(2).max(80)).default([]),
  status: z.enum(EstateStatus).default(EstateStatus.ACTIVE),
});

export type EstateInput = z.infer<typeof estateSchema>;
