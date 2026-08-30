"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/access";
import { toTable } from "@/lib/admin/import/parser";
import { validateRows, type ValidatedRow } from "@/lib/admin/import/validate";
import { ListingType } from "@/generated/prisma/enums";

/** The four fields the shared preview table renders, whatever the entity. */
export type PreviewRow = {
  lineNumber: number;
  reference: string;
  title: string;
  errors: { column: string; message: string }[];
};

export type ImportPreview = {
  filename: string;
  rows: PreviewRow[];
  validCount: number;
  errorCount: number;
  /** Serialised valid rows, round-tripped through the commit step. */
  payload: string;
} | null;

export type ImportState =
  | { error?: string; preview?: ImportPreview; committed?: ImportResult }
  | null;

export type ImportResult = {
  created: number;
  updated: number;
  skipped: number;
};

const MAX_ROWS = 500;

/**
 * Step one: parse, validate, and show what would happen. Nothing is written.
 *
 * The valid rows are serialised into the returned state and posted back on
 * commit, so the file is parsed exactly once and the admin commits precisely
 * the rows they reviewed — re-reading the upload on commit would let a
 * changed file slip past the preview.
 */
export async function previewImport(
  /** Bound by the route — /admin/import/land vs /admin/import/homes. */
  defaultType: ListingType,
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

  const text = await file.text();
  const table = toTable(text);

  if (table.rows.length === 0) {
    return { error: "No data rows found. Is the header row present?" };
  }
  if (table.rows.length > MAX_ROWS) {
    return {
      error: `That file has ${table.rows.length} rows. Split it into batches of ${MAX_ROWS} or fewer.`,
    };
  }

  const estates = await db.estate.findMany({ select: { id: true, slug: true } });
  const estatesBySlug = new Map(estates.map((e) => [e.slug, e.id]));

  const rows = validateRows(table, estatesBySlug, defaultType);
  const valid = rows.filter((row) => row.errors.length === 0);

  return {
    preview: {
      filename: file.name,
      rows,
      validCount: valid.length,
      errorCount: rows.length - valid.length,
      payload: JSON.stringify(valid.map((row) => row.data)),
    },
  };
}

type ImportRow = NonNullable<ValidatedRow["data"]>;

/**
 * Step two: write the valid rows.
 *
 * Idempotent on `reference` — FR-6.6 and the plan's own verify step ("importing
 * the same CSV twice updates rather than duplicates"). An existing reference
 * is updated in place, keeping its id, its media, its enquiries and its
 * status; a new one is created as a draft.
 *
 * Status is deliberately never touched on update: re-importing a price
 * correction must not un-publish a live listing, or quietly publish a draft.
 */
export async function commitImport(
  _prev: ImportState,
  formData: FormData,
): Promise<ImportState> {
  const user = await requireAdmin();

  const filename = String(formData.get("filename") ?? "import.csv");
  let rows: ImportRow[];
  try {
    rows = JSON.parse(String(formData.get("payload") ?? "[]")) as ImportRow[];
  } catch {
    return { error: "That preview has expired. Upload the file again." };
  }

  if (rows.length === 0) return { error: "Nothing valid to import." };

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    try {
      const existing = await db.listing.findUnique({
        where: { reference: row.reference },
        select: { id: true, type: true },
      });

      if (existing) {
        // A reference that changed track would mean rebuilding the detail
        // row too; safer to skip and let a human look at it.
        if (existing.type !== row.type) {
          skipped++;
          continue;
        }
        await updateExisting(existing.id, row);
        updated++;
      } else {
        await createNew(row);
        created++;
      }
    } catch (error) {
      console.error("[admin] import row failed", row.reference, error);
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

  revalidatePath("/admin/listings/land");
  revalidatePath("/admin/listings/homes");
  revalidatePath("/admin/import");

  return { committed: { created, updated, skipped } };
}

async function createNew(row: ImportRow) {
  const base = {
    slug: row.slug,
    reference: row.reference,
    type: row.type,
    title: row.title,
    description: row.description,
    estateId: row.estateId,
    location: row.location,
    state: row.state,
    price: row.price,
    priceOnRequest: row.priceOnRequest,
    status: row.status,
    paymentPlanAvailable: false,
    featured: false,
  };

  if ("landDetail" in row) {
    await db.listing.create({
      data: {
        ...base,
        landDetail: {
          create: {
            plotSize: row.landDetail.plotSize,
            plotUnit: row.landDetail.plotUnit,
            titleType: row.landDetail.titleType,
            additionalTitleTypes: row.landDetail.additionalTitleTypes,
            surveyNumber: row.landDetail.surveyNumber,
            topography: row.landDetail.topography,
            roadAccess: row.landDetail.roadAccess,
            documents: {
              create: row.landDetail.documents.map((doc, index) => ({
                type: doc.type,
                note: doc.note,
                position: index,
              })),
            },
          },
        },
      },
    });
    return;
  }

  await db.listing.create({
    data: {
      ...base,
      homeDetail: {
        create: {
          bedrooms: row.homeDetail.bedrooms,
          bathrooms: row.homeDetail.bathrooms,
          houseType: row.homeDetail.houseType,
          buildStage: row.homeDetail.buildStage,
          handoverDate: row.homeDetail.handoverDate,
          builtArea: row.homeDetail.builtArea,
          landArea: row.homeDetail.landArea,
          finishingSpec: row.homeDetail.finishingSpec,
          features: row.homeDetail.features,
        },
      },
    },
  });
}

async function updateExisting(id: string, row: ImportRow) {
  const base = {
    slug: row.slug,
    title: row.title,
    description: row.description,
    estateId: row.estateId,
    location: row.location,
    state: row.state,
    price: row.price,
    priceOnRequest: row.priceOnRequest,
    // `status` is intentionally absent — see the note on commitImport.
  };

  if ("landDetail" in row) {
    await db.$transaction(async (tx) => {
      await tx.listing.update({ where: { id }, data: base });
      await tx.landDetail.update({
        where: { listingId: id },
        data: {
          plotSize: row.landDetail.plotSize,
          plotUnit: row.landDetail.plotUnit,
          titleType: row.landDetail.titleType,
          additionalTitleTypes: row.landDetail.additionalTitleTypes,
          surveyNumber: row.landDetail.surveyNumber,
          topography: row.landDetail.topography,
          roadAccess: row.landDetail.roadAccess,
        },
      });
      await tx.landDocument.deleteMany({ where: { landDetailId: id } });
      if (row.landDetail.documents.length > 0) {
        await tx.landDocument.createMany({
          data: row.landDetail.documents.map((doc, index) => ({
            landDetailId: id,
            type: doc.type,
            note: doc.note,
            position: index,
          })),
        });
      }
    });
    return;
  }

  await db.$transaction([
    db.listing.update({ where: { id }, data: base }),
    db.homeDetail.update({
      where: { listingId: id },
      data: {
        bedrooms: row.homeDetail.bedrooms,
        bathrooms: row.homeDetail.bathrooms,
        houseType: row.homeDetail.houseType,
        buildStage: row.homeDetail.buildStage,
        handoverDate: row.homeDetail.handoverDate,
        builtArea: row.homeDetail.builtArea,
        landArea: row.homeDetail.landArea,
        finishingSpec: row.homeDetail.finishingSpec,
        features: row.homeDetail.features,
      },
    }),
  ]);
}
