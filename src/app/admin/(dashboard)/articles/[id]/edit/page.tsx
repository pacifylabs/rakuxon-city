import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/access";
import { db } from "@/lib/db";
import { allMediaOptions } from "@/lib/admin/queries/media";
import { saveArticle } from "@/lib/admin/actions/articles";
import { ArticleForm } from "@/components/admin/article-form";
import { PageHeader } from "@/components/admin/ui";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [article, media] = await Promise.all([
    db.article.findUnique({ where: { id } }),
    allMediaOptions(),
  ]);
  if (!article) notFound();

  return (
    <div>
      <PageHeader eyebrow="Content" title={article.title} />
      <ArticleForm
        values={{
          id: article.id,
          slug: article.slug,
          title: article.title,
          category: article.category,
          excerpt: article.excerpt,
          body: article.body,
          coverImageId: article.coverImageId ?? "",
          status: article.status,
        }}
        mediaOptions={media}
        action={saveArticle.bind(null, id)}
      />
    </div>
  );
}
