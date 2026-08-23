import "server-only";
import { z } from "zod";
import { VideoKind } from "@/generated/prisma/enums";

/** FR-V1.4 — the hub paginates at twelve, matching the listing hubs. */
export const VIDEOS_PER_PAGE = 12;

/** A blank string from a cleared filter is "no filter", not an invalid value. */
const optional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    schema.optional(),
  );

export const videoFilterSchema = z.object({
  kind: optional(z.enum(VideoKind)),
  estate: optional(z.string().max(120)),
  page: z.preprocess(
    (value) => (value === "" || value === undefined ? 1 : Number(value)),
    z.number().int().min(1).catch(1),
  ),
});

export type VideoFilters = z.infer<typeof videoFilterSchema>;

/** Anything unrecognised is dropped rather than rejected, as on the listing hubs. */
export function parseVideoFilters(
  searchParams: Record<string, string | string[] | undefined>,
): VideoFilters {
  const flat = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

  const parsed = videoFilterSchema.safeParse(flat);
  return parsed.success ? parsed.data : videoFilterSchema.parse({});
}

export function hasActiveVideoFilters(filters: VideoFilters): boolean {
  return Boolean(filters.kind || filters.estate);
}

/**
 * The estate filter matches a video's own estate *or* the estate of the listing
 * it hangs off, so filtering by Emerald Ridge returns the estate overview and
 * the drone tour of a plot inside it. Filtering only on the direct relation
 * would hide most of an estate's footage.
 */
export function buildVideoWhere(filters: VideoFilters) {
  const and: Record<string, unknown>[] = [];

  if (filters.kind) and.push({ kind: filters.kind });
  if (filters.estate) {
    and.push({
      OR: [
        { estate: { slug: filters.estate } },
        { listing: { estate: { slug: filters.estate } } },
      ],
    });
  }

  // Drafts never reach a public surface, and neither does a video whose parent
  // listing is still a draft.
  and.push({
    OR: [{ listingId: null }, { listing: { status: { not: "DRAFT" } } }],
  });

  return and.length > 0 ? { AND: and } : {};
}

/** Rebuilds the query string, dropping defaults so shared URLs stay readable. */
export function buildVideoQueryString(
  filters: Partial<VideoFilters>,
  changes: Record<string, string | number | undefined> = {},
): string {
  const params = new URLSearchParams();
  const merged: Record<string, unknown> = { ...filters, ...changes };

  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || value === "" || value === null) continue;
    if (key === "page" && Number(value) === 1) continue;
    params.set(key, String(value));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}
