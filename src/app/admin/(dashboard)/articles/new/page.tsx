import { requireAdmin } from "@/lib/admin/access";
import { allMediaOptions } from "@/lib/admin/queries/media";
import { saveArticle } from "@/lib/admin/actions/articles";
import { ArticleForm } from "@/components/admin/article-form";
import { PageHeader } from "@/components/admin/ui";

export default async function NewArticlePage() {
  await requireAdmin();
  const media = await allMediaOptions();

  return (
    <div>
      <PageHeader eyebrow="Content" title="New guide" />
      <ArticleForm
        values={{
          id: null,
          slug: "",
          title: "",
          category: "",
          excerpt: "",
          body: "",
          coverImageId: "",
          status: "DRAFT",
        }}
        mediaOptions={media}
        action={saveArticle.bind(null, null)}
      />
    </div>
  );
}
