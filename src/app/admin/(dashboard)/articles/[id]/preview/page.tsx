import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/access";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { articleCategoryLabels, articleStatusLabels } from "@/lib/admin/labels";

/**
 * Admin preview for a buyer guide.
 *
 * Replaces the old "View" link, which pointed at `/resources/[slug]` on the
 * public site. That was wrong twice over: a DRAFT guide has no public page,
 * so the link 404d for exactly the guides most likely to need reviewing, and
 * even for a published one it threw the reviewer out of the console.
 *
 * This renders the body through the same `\n\n` paragraph split and
 * `**bold**` parsing the public page uses, so what you read here is what a
 * visitor gets — without the guide having to be published first.
 */
export default async function ArticlePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const article = await db.article.findUnique({
    where: { id },
    include: { coverImage: true },
  });
  if (!article) notFound();

  const paragraphs = article.body.split("\n\n").filter((p) => p.trim() !== "");
  const words = article.body.trim().split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(words / 200));

  return (
    <div>
      <PageHeader
        eyebrow="Preview"
        title={article.title}
        description={`${articleCategoryLabels[article.category]} · ${articleStatusLabels[article.status]}`}
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/admin/articles/${article.id}/edit`}
              className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-body text-ivory-light transition-colors hover:bg-primary-hover"
            >
              Edit
            </Link>
            {article.status === "PUBLISHED" ? (
              <Link
                href={`/resources/${article.slug}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-body text-foreground transition-colors hover:bg-surface-muted"
              >
                Open live page
              </Link>
            ) : null}
          </div>
        }
      />

      {article.status === "DRAFT" ? (
        <p className="mt-6 rounded-control border border-accent-hover bg-accent-tint px-4 py-3 text-caption text-accent-text">
          This guide is a draft. It has no public page yet — publish it from the
          edit screen when it is ready.
        </p>
      ) : null}

      {/*
        Full width like every other admin page, but the prose itself stays at a
        readable measure — a paragraph set across 1400px is a page nobody can
        track a line on. The width goes to a details column instead of into the
        line length, so the screen is filled with something worth reading.
      */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3 lg:gap-10">
        <article className="min-w-0 lg:col-span-2">
          {article.coverImage ? (
            <div className="relative mb-8 aspect-16/9 overflow-hidden rounded-image-l bg-surface-muted">
              <Image
                src={article.coverImage.url}
                alt={article.coverImage.alt}
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}

          <p className="text-body-l text-foreground">{article.excerpt}</p>

          <div className="mt-8">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="mb-6 text-body-l text-muted">
                {paragraph.split(/(\*\*[^*]+\*\*)/g).map((run, runIndex) =>
                  run.startsWith("**") && run.endsWith("**") ? (
                    <span key={runIndex} className="text-foreground">
                      {run.slice(2, -2)}
                    </span>
                  ) : (
                    <span key={runIndex}>{run}</span>
                  ),
                )}
              </p>
            ))}
          </div>
        </article>

        <aside className="min-w-0 lg:col-span-1">
          <div className="rounded-card border border-line bg-surface p-6 lg:sticky lg:top-24">
            <h2 className="text-heading text-foreground">Details</h2>
            <dl className="mt-4 flex flex-col gap-4">
              <Detail
                label="Status"
                value={articleStatusLabels[article.status]}
              />
              <Detail
                label="Category"
                value={articleCategoryLabels[article.category]}
              />
              <Detail
                label="Reading time"
                value={`${readingMinutes} min · ${words} words`}
              />
              <Detail
                label="Published"
                value={
                  article.publishedAt
                    ? article.publishedAt.toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Not published"
                }
              />
              <Detail
                label="Last edited"
                value={article.updatedAt.toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
              <Detail
                label="Web address"
                value={`/resources/${article.slug}`}
              />
              {article.coverImage ? (
                <Detail label="Cover image" value={article.coverImage.alt} />
              ) : (
                <Detail label="Cover image" value="None set" />
              )}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-caption text-muted">{label}</dt>
      <dd className="mt-0.5 text-body break-words text-foreground">{value}</dd>
    </div>
  );
}
