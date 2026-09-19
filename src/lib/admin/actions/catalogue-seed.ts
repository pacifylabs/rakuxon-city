"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/access";
import { runCatalogueSeed } from "@/lib/admin/catalogue-seed";

export async function seedCatalogueAction(_formData: FormData): Promise<void> {
  await requireAdmin();

  try {
    await runCatalogueSeed();
  } catch (error) {
    console.error("[admin] catalogue seed failed", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Could not load demo catalogue data.",
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/listings/land");
  revalidatePath("/admin/listings/homes");
  revalidatePath("/admin/estates");
  revalidatePath("/admin/articles");
  revalidatePath("/admin/media");
  revalidatePath("/");
  revalidatePath("/land");
  revalidatePath("/homes");
  revalidatePath("/estates");
  revalidatePath("/guides");
}
