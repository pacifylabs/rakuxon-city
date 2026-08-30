import Link from "next/link";
import { requireAdmin } from "@/lib/admin/access";
import { db } from "@/lib/db";
import { deleteArticle } from "@/lib/admin/actions/articles";
import {
  DataTable,
  Td,
  PageHeader,
  FormSuccess,
} from "@/components/admin/ui";
import { articleCategoryLabels, articleStatusLabels } from "@/lib/admin/labels";
import { RowActions, RowLink } from "@/components/admin/row-actions";
import { ConfirmAction } from "@/components/admin/confirm-action";

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const query = await searchParams;

  const articles = await db.article.findMany({
    orderBy: [{ status: "asc" }, { publishedAt: "desc" }, { title: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      status: true,
      publishedAt: true,
    },
  });

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="Buyer guides"
        description="Drafts never appear on the public site. Publishing takes effect immediately."
        action={
          <Link
            href="/admin/articles/new"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-body text-ivory-light hover:bg-primary-hover"
          >
            New guide
          </Link>
        }
      />

      <div className="mt-6 flex flex-col gap-3">
        {query.saved === "1" ? <FormSuccess message="Guide saved." /> : null}
        {query.deleted === "1" ? <FormSuccess message="Guide deleted." /> : null}
      </div>

      <div className="mt-6">
        <DataTable
          headers={["Title", "Category", "Published", "Status", ""]}
          empty={
            articles.length === 0 ? (
              <p className="text-body text-muted">No guides yet.</p>
            ) : undefined
          }
        >
          {articles.map((article) => (
            <tr key={article.id}>
              <Td>
                <Link
                  href={`/admin/articles/${article.id}/edit`}
                  className="text-accent-text underline-offset-4 hover:underline"
                >
                  {article.title}
                </Link>
              </Td>
              <Td className="text-muted">
                {articleCategoryLabels[article.category]}
              </Td>
              <Td className="text-muted">
                {article.publishedAt
                  ? article.publishedAt.toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </Td>
              <Td className="text-muted">
                {articleStatusLabels[article.status]}
              </Td>
              <Td>
                <RowActions
                  editHref={`/admin/articles/${article.id}/edit`}
                  editLabel={`Edit ${article.title}`}
                  extra={
                    <>
                      {/* An admin preview, not the public URL — a draft has no
                          public page at all, so a link there 404s, and even a
                          published guide should be reviewable inside the
                          console rather than by leaving it. */}
                      <RowLink href={`/admin/articles/${article.id}/preview`}>
                        Preview
                      </RowLink>
                      <ConfirmAction
                        action={deleteArticle.bind(null, article.id)}
                        title="Delete this guide?"
                        body={`"${article.title}" will be removed permanently, including from the public site. This cannot be undone.`}
                        confirmLabel="Delete guide"
                        successMessage="Guide deleted."
                        tone="danger"
                      >
                        Delete
                      </ConfirmAction>
                    </>
                  }
                />
              </Td>
            </tr>
          ))}
        </DataTable>
      </div>
    </div>
  );
}
