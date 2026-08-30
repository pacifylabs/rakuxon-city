"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/access";
import { ArticleCategory, ArticleStatus } from "@/generated/prisma/enums";
import { z } from "zod";
import { slugSchema } from "@/lib/validation/listing";

export type ActionState = { error?: string; success?: string } | null;

const articleFormSchema = z.object({
  slug: slugSchema,
  title: z.string().min(3).max(160),
  category: z.enum(ArticleCategory),
  excerpt: z.string().min(20).max(400),
  body: z.string().min(50),
  coverImageId: z.string().nullable(),
  status: z.enum(ArticleStatus),
});

export async function saveArticle(
  articleId: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const coverImageId = String(formData.get("coverImageId") ?? "");

  const parsed = articleFormSchema.safeParse({
    slug: String(formData.get("slug") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    category: String(formData.get("category") ?? ""),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    coverImageId: coverImageId === "" ? null : coverImageId,
    status: String(formData.get("status") ?? ArticleStatus.DRAFT),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path.filter(Boolean).join(" → ");
    return {
      error: field
        ? `${field}: ${issue.message}`
        : (issue?.message ?? "Check the form and try again."),
    };
  }

  const input = parsed.data;

  /*
   * `publishedAt` is set the first time an article goes live and never
   * moved afterwards — the public resources page sorts by it, so rewriting
   * it on every edit would jump an old guide to the top of the list for a
   * typo fix.
   */
  const existing = articleId
    ? await db.article.findUnique({
        where: { id: articleId },
        select: { publishedAt: true },
      })
    : null;

  const publishedAt =
    input.status === ArticleStatus.PUBLISHED
      ? (existing?.publishedAt ?? new Date())
      : null;

  try {
    if (articleId) {
      await db.article.update({
        where: { id: articleId },
        data: { ...input, publishedAt },
      });
    } else {
      await db.article.create({ data: { ...input, publishedAt } });
    }
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code: unknown }).code)
        : null;
    if (code === "P2002") {
      return { error: "That slug is already used by another article." };
    }
    console.error("[admin] article write failed", code ?? error);
    return { error: "Could not save the article. Please try again." };
  }

  revalidatePath("/admin/articles");
  revalidatePath("/resources");
  revalidatePath(`/resources/${input.slug}`);
  redirect("/admin/articles?saved=1");
}

export async function deleteArticle(articleId: string): Promise<void> {
  await requireAdmin();

  const article = await db.article.findUnique({
    where: { id: articleId },
    select: { slug: true },
  });
  if (!article) return;

  await db.article.delete({ where: { id: articleId } });

  revalidatePath("/admin/articles");
  revalidatePath("/resources");
  revalidatePath(`/resources/${article.slug}`);
}
