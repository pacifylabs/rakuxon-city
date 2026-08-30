"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/access";
import { EstateStatus } from "@/generated/prisma/enums";
import { z } from "zod";
import { slugSchema } from "@/lib/validation/listing";

export type ActionState = { error?: string; success?: string } | null;

const estateFormSchema = z.object({
  slug: slugSchema,
  name: z.string().min(2).max(120),
  location: z.string().min(2).max(120),
  state: z.string().min(2).max(60),
  description: z.string().min(20),
  status: z.enum(EstateStatus),
  amenities: z.array(z.string().min(2).max(80)).default([]),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
});

function optionalNumber(value: FormDataEntryValue | null): number | null {
  const text = typeof value === "string" ? value.trim() : "";
  if (text === "") return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function saveEstate(
  estateId: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Estates are read-only for sales per the access matrix, so writing one is
  // admin-only even though the list is visible more widely.
  await requireAdmin();

  const parsed = estateFormSchema.safeParse({
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    status: String(formData.get("status") ?? EstateStatus.ACTIVE),
    // Blank rows are the form's "add another" placeholders; they disappear
    // on save rather than persisting as empty amenities.
    amenities: formData
      .getAll("amenities")
      .map((value) => String(value).trim())
      .filter(Boolean),
    latitude: optionalNumber(formData.get("latitude")),
    longitude: optionalNumber(formData.get("longitude")),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path.filter(Boolean).join(" → ");
    return {
      error: field
        ? `${field}: ${issue.message}`
        : (issue?.message ?? "Something in the form is not valid."),
    };
  }

  const input = parsed.data;

  try {
    if (estateId) {
      await db.estate.update({ where: { id: estateId }, data: input });
    } else {
      await db.estate.create({ data: input });
    }
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code: unknown }).code)
        : null;
    if (code === "P2002") {
      return { error: "That slug is already used by another estate." };
    }
    console.error("[admin] estate write failed", code ?? error);
    return { error: "Could not save the estate. Please try again." };
  }

  revalidatePath("/admin/estates");
  revalidatePath("/estates");
  redirect("/admin/estates?saved=1");
}

/**
 * Delete is guarded, not cascading.
 *
 * `Listing.estateId` is `onDelete: SetNull`, so deleting an estate with
 * listings would silently orphan them rather than fail — the listings would
 * survive with no estate, which is worse than refusing. The spec asks for
 * "Delete estate (only if no listings)"; this is that rule, enforced with a
 * count rather than trusted to the schema.
 */
export async function deleteEstate(estateId: string): Promise<void> {
  await requireAdmin();

  const listingCount = await db.listing.count({ where: { estateId } });
  // Guarded, not cascading — see the note above. Called from a confirmation
  // modal now, so this returns rather than redirecting: the client stays on
  // the list and the toast reports the result.
  if (listingCount > 0) return;

  await db.estate.delete({ where: { id: estateId } });

  revalidatePath("/admin/estates");
  revalidatePath("/estates");
}
