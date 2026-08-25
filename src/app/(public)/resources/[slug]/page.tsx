import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import Link from "next/link";
import { getArticle, getArticleSlugs, getArticles } from "@/lib/content";
import { formatMonthYear } from "@/lib/format";
import type { ArticleCategory } from "@/generated/prisma/enums";
import { BackLink } from "@/components/layout/back-link";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/schema";

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
  if (!article) return { title: "Guide not found" };

  const image = article.coverImage;

  return pageMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/resources/${article.slug}`,
    images: image
      ? [
          {
            url: image.url,
            width: image.width,
            height: image.height,
            alt: image.alt,
          },
        ]
      : undefined,
  });
}

export default async function ArticlePage({
  params,
}: PageProps<"/resources/[slug]">) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  /*
   * Three more guides for the sidebar — same category first, then anything
   * else. The body is capped at 68ch for readability, which left the right
   * half of the page empty; this fills it with the obvious next thing to read
   * rather than widening the measure.
   */
  const others = (await getArticles()).filter(
    (entry) => entry.slug !== article.slug,
  );
  const related = [
    ...others.filter((entry) => entry.category === article.category),
    ...others.filter((entry) => entry.category !== article.category),
  ].slice(0, 3);

  return (
    <>
      <JsonLd
        data={articleJsonLd({
          slug: article.slug,
          title: article.title,
          excerpt: article.excerpt,
          publishedAt: article.publishedAt,
          coverImage: article.coverImage,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Buyer guides", path: "/resources" },
          { name: article.title, path: `/resources/${article.slug}` },
        ])}
      />
      <Section className="pt-10 pb-0 lg:pt-16 lg:pb-0">
        <Container>
          <BackLink href="/resources" label="All buyer guides" />

          <p className="text-eyebrow text-muted">
            {categoryLabels[article.category]}
          </p>
          <h1 className="mt-4 max-w-[22ch] text-display-l text-foreground">
            {article.title}
          </h1>
          {article.publishedAt ? (
            <p className="mt-4 text-caption text-muted">
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
            </figure>
          ) : null}
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="max-w-[68ch] lg:col-span-7">
              {/*
                Paragraphs, with `**lead-in**` emphasis at the start of a line.
                Several guides are structured as checklists where each point
                opens with its own short heading, and rendering those as literal
                asterisks was worse than not having them.

                Deliberately the whole of the formatting supported. FR-5.3 wants
                headings, images, tables and internal links to listings, which
                arrives with the rich text editor in Phase 7 — this is enough to
                render the copy that exists, and no more.
              */}
              {article.body.split("\n\n").map((paragraph) => (
                <p
                  key={paragraph}
                  className="mb-6 text-body-l text-muted"
                >
                  {renderEmphasis(paragraph)}
                </p>
              ))}
            </div>

            {related.length > 0 ? (
              <aside className="lg:col-span-4 lg:col-start-9">
                <p className="text-eyebrow text-muted">Read next</p>
                <ul className="mt-5 divide-y divide-line border-t border-line">
                  {related.map((entry) => (
                    <li key={entry.slug}>
                      <Link
                        href={`/resources/${entry.slug}`}
                        className="group block py-5"
                      >
                        <p className="text-caption text-muted">
                          {categoryLabels[entry.category]}
                        </p>
                        <p className="mt-2 text-body text-foreground transition-colors group-hover:text-accent-text">
                          {entry.title}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 rounded-card border border-line p-6">
                  <p className="text-body text-foreground">Not sure what applies?</p>
                  <p className="mt-3 text-caption text-muted">
                    Send us the plot or the area you are looking at and we will
                    tell you what the documentation position actually is.
                  </p>
                  <Link
                    href={`/contact?from=resource&guide=${article.slug}`}
                    className="mt-5 inline-block text-body text-accent-text underline underline-offset-4 transition-colors hover:text-foreground"
                  >
                    Ask us
                  </Link>
                </div>
              </aside>
            ) : null}
          </div>

          {/* FR-5.2 — every article closes with a contextual enquiry action. */}
          <div className="mt-12 rounded-card border border-line bg-accent-tint p-8 lg:mt-16 lg:p-12">
            <p className="max-w-[24ch] text-display-m text-foreground">
              Still deciding what to buy?
            </p>
            <p className="mt-5 max-w-[56ch] text-body text-muted">
              Tell us the size, the area and the budget. We will tell you what
              fits and what the documentation position is on each one.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {/*
                Carries the guide it came from. Without this an enquiry that
                started on "What a C of O actually proves" arrives on the sales
                desk indistinguishable from a cold contact, and the one useful
                thing about it — that this buyer is reading about title before
                they buy — is lost.
              */}
              <ButtonLink href={`/contact?from=resource&guide=${article.slug}`}>
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

/**
 * Splits a paragraph on `**...**` and renders those runs as `ink` rather than
 * `ink-secondary`. Weight is not used — no font-weight above 500 exists in this
 * type scale, so emphasis is carried by colour, as it is everywhere else here.
 */
function renderEmphasis(paragraph: string) {
  return paragraph.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index} className="font-medium text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}
