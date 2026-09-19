"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/access";
import { purgeCatalogueContent } from "@/lib/admin/catalogue-purge";

export async function purgeSeededCatalogueAction(
  _formData: FormData,
): Promise<void> {
  await requireAdmin();

  try {
    await purgeCatalogueContent();
  } catch (error) {
    console.error("[admin] catalogue purge failed", error);
    throw new Error("Could not clear catalogue data.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/listings/land");
  revalidatePath("/admin/listings/homes");
  revalidatePath("/land");
  revalidatePath("/homes");
}
