"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/access";
import { toTable } from "@/lib/admin/import/parser";
import { EstateStatus } from "@/generated/prisma/enums";
import { z } from "zod";
import { slugSchema } from "@/lib/validation/listing";
import type { ImportState } from "@/lib/admin/actions/import";

/**
 * Estate CSV import.
 *
 * New in this pass — estates were the one entity with no bulk path at all,
 * which is what made the single generic importer misleading: it accepted a
 * file and gave no indication that estates were never a possible destination.
 *
 * Idempotent on `slug` rather than a reference, because estates have no
 * human-quoted code. Re-importing updates in place and never changes
 * `status`, for the same reason listings don't: a spreadsheet correcting a
 * description must not quietly reopen a sold-out estate.
 */
const estateRowSchema = z.object({
  slug: slugSchema,
  name: z.string().min(2).max(120),
  location: z.string().min(2).max(120),
  state: z.string().min(2).max(60),
  description: z.string().min(20),
  amenities: z.array(z.string().min(2).max(80)),
  status: z.enum(EstateStatus),
});

const COLUMNS = {
  slug: ["slug"],
  name: ["name", "estate", "estatename"],
  location: ["location", "town", "area"],
  state: ["state"],
  description: ["description", "desc"],
  amenities: ["amenities", "features"],
  status: ["status"],
} as const;

function pick(row: Record<string, string>, aliases: readonly string[]): string {
  for (const alias of aliases) {
    const value = row[alias];
    if (value !== undefined && value !== "") return value;
  }
  return "";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function matchStatus(value: string): EstateStatus {
  const normalised = value.trim().toUpperCase().replace(/[\s-]+/g, "_");
  const found = (Object.values(EstateStatus) as string[]).find(
    (v) => v === normalised,
  );
  return (found as EstateStatus) ?? EstateStatus.ACTIVE;
}

export async function previewEstateImport(
  _prev: ImportState,
  formData: FormData,
): Promise<ImportState> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a CSV file." };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { error: "That file is larger than 2MB." };
  }

  const table = toTable(await file.text());
  if (table.rows.length === 0) {
    return { error: "No data rows found. Is the header row present?" };
  }
  if (table.rows.length > 200) {
    return { error: "That file has more than 200 rows. Split it up." };
  }

  const rows = table.rows.map((row, index) => {
    const name = pick(row, COLUMNS.name);
    const candidate = {
      slug: pick(row, COLUMNS.slug) || slugify(name),
      name,
      location: pick(row, COLUMNS.location),
      state: pick(row, COLUMNS.state),
      description: pick(row, COLUMNS.description),
      // Pipe-separated, because a comma would need quoting in every row.
      amenities: pick(row, COLUMNS.amenities)
        .split("|")
        .map((a) => a.trim())
        .filter(Boolean),
      status: matchStatus(pick(row, COLUMNS.status)),
    };

    const parsed = estateRowSchema.safeParse(candidate);
    return {
      lineNumber: index + 2,
      reference: candidate.slug,
      title: name,
      errors: parsed.success
        ? []
        : parsed.error.issues.map((issue) => ({
            column: issue.path.filter(Boolean).join(".") || "row",
            message: issue.message,
          })),
      data: parsed.success ? candidate : undefined,
    };
  });

  const valid = rows.filter((row) => row.errors.length === 0);

  return {
    preview: {
      filename: file.name,
      // The shared preview table renders only the four `PreviewRow` fields,
      // so an estate row satisfies it without a parallel component.
      rows: rows.map(({ lineNumber, reference, title, errors }) => ({
        lineNumber,
        reference,
        title,
        errors,
      })),
      validCount: valid.length,
      errorCount: rows.length - valid.length,
      payload: JSON.stringify(valid.map((row) => row.data)),
    },
  };
}

type EstateRow = z.infer<typeof estateRowSchema>;

export async function commitEstateImport(
  _prev: ImportState,
  formData: FormData,
): Promise<ImportState> {
  const user = await requireAdmin();

  const filename = String(formData.get("filename") ?? "estates.csv");
  let rows: EstateRow[];
  try {
    rows = JSON.parse(String(formData.get("payload") ?? "[]")) as EstateRow[];
  } catch {
    return { error: "That preview has expired. Upload the file again." };
  }
  if (rows.length === 0) return { error: "Nothing valid to import." };

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    try {
      const existing = await db.estate.findUnique({
        where: { slug: row.slug },
        select: { id: true },
      });

      if (existing) {
        // `status` deliberately absent — see the note at the top.
        await db.estate.update({
          where: { id: existing.id },
          data: {
            name: row.name,
            location: row.location,
            state: row.state,
            description: row.description,
            amenities: row.amenities,
          },
        });
        updated++;
      } else {
        await db.estate.create({ data: row });
        created++;
      }
    } catch (error) {
      console.error("[admin] estate import row failed", row.slug, error);
      skipped++;
    }
  }

  await db.importBatch.create({
    data: {
      filename,
      rowCount: rows.length,
      successCount: created + updated,
      errorCount: skipped,
      importedByUserId: user.id,
    },
  });

  revalidatePath("/admin/estates");
  revalidatePath("/estates");

  return { committed: { created, updated, skipped } };
}
