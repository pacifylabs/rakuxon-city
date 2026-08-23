import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/listings/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { getArticle, getArticleSlugs } from "@/lib/content";
import { formatMonthYear } from "@/lib/format";
import { isPlaceholder } from "@/lib/media";
import type { ArticleCategory } from "@/generated/prisma/enums";

export const revalidate = 3600;

const categoryLabels: Record<ArticleCategory, string> = {
  TITLE_AND_DOCUMENTATION: "Title and documentation",
  BUYING_PROCESS: "Buying process",
  PAYMENT_PLANS: "Payment plans",
  ESTATE_LIVING: "Estate living",
};

export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/resources/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article not found — Rakuxon City" };

  return {
    title: `${article.title} — Rakuxon City`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({
  params,
}: PageProps<"/resources/[slug]">) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  return (
    <>
      <Section className="pt-10 pb-0 lg:pt-16 lg:pb-0">
        <Container>
          <Breadcrumbs
            trail={[
              { label: "Home", href: "/" },
              { label: "Buyer guides", href: "/resources" },
              { label: article.title },
            ]}
          />

          <p className="mt-8 text-eyebrow text-ink-muted">
            {categoryLabels[article.category]}
          </p>
          <h1 className="mt-4 max-w-[22ch] text-display-l text-ink">
            {article.title}
          </h1>
          {article.publishedAt ? (
            <p className="mt-4 text-caption text-ink-muted">
              {formatMonthYear(article.publishedAt)}
            </p>
          ) : null}

          {article.coverImage ? (
            <figure className="relative mt-10 aspect-16/9 overflow-hidden rounded-image-l">
              <Image
                src={article.coverImage.url}
                alt={article.coverImage.alt}
                fill
                priority
                sizes="(min-width: 1024px) 70vw, 100vw"
                className="object-cover"
              />
              {isPlaceholder(article.coverImage.url) ? (
                <figcaption className="absolute bottom-3 left-3 rounded-full bg-canvas/85 px-3 py-1 text-caption text-ink-muted">
                  Photography pending
                </figcaption>
              ) : null}
            </figure>
          ) : null}
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="max-w-[68ch]">
            {/*
              Plain paragraphs for now. FR-5.3 wants headings, images, tables and
              internal links to listings — that arrives with the rich text editor
              in Phase 7, alongside the client's real copy.
            */}
            {article.body.split("\n\n").map((paragraph) => (
              <p
                key={paragraph}
                className="mb-6 text-body-l text-ink-secondary"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* FR-5.2 — every article closes with a contextual enquiry action. */}
          <div className="mt-12 rounded-card border border-hairline bg-accent-tint p-8 lg:mt-16 lg:p-12">
            <p className="max-w-[24ch] text-display-m text-ink">
              Still deciding what to buy?
            </p>
            <p className="mt-5 max-w-[56ch] text-body text-ink-secondary">
              Tell us the size, the area and the budget. We will tell you what
              fits and what the documentation position is on each one.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/contact">
                Tell us what you are looking for
              </ButtonLink>
              <ButtonLink variant="secondary" href="/land">
                Browse plots
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
