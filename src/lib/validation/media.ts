import { z } from "zod";

export const mediaSchema = z.object({
  url: z.string().min(1),
  /** Required at the boundary. Alt text is enforced on upload, not audited later. */
  alt: z
    .string()
    .trim()
    .min(3, "Describe the image for screen readers")
    .max(300),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  mimeType: z.string().regex(/^image\/[a-z0-9.+-]+$/),
  sizeBytes: z.number().int().positive(),
});

export type MediaInput = z.infer<typeof mediaSchema>;
