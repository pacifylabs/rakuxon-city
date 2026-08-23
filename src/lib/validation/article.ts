import { z } from "zod";
import { ArticleCategory, ArticleStatus } from "@/generated/prisma/enums";
import { slugSchema } from "./listing";

export const articleSchema = z.object({
  slug: slugSchema,
  title: z.string().min(3).max(160),
  category: z.enum(ArticleCategory),
  excerpt: z.string().min(20).max(320),
  body: z.string().min(50),
  coverImageId: z.string().nullable().optional(),
  status: z.enum(ArticleStatus).default(ArticleStatus.DRAFT),
});

export type ArticleInput = z.infer<typeof articleSchema>;
