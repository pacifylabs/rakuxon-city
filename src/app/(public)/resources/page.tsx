import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container, Section } from "@/components/ui/container";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getArticles } from "@/lib/content";
import { formatMonthYear } from "@/lib/format";
import { StandInLabel } from "@/components/ui/stand-in-label";
import { ArticleCategory } from "@/generated/prisma/enums";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Buyer guides — Rakuxon City",
  description:
    "Practical guides to title, verification, payment plans and estate living — written for Nigerian land and home buyers.",
};

/** FR-5.1 — the four categories, in the order a buyer meets them. */
const categoryOrder: ArticleCategory[] = [
  ArticleCategory.TITLE_AND_DOCUMENTATION,
  ArticleCategory.BUYING_PROCESS,
  ArticleCategory.PAYMENT_PLANS,
  ArticleCategory.ESTATE_LIVING,
];

const categoryLabels: Record<ArticleCategory, string> = {
  TITLE_AND_DOCUMENTATION: "Title and documentation",
  BUYING_PROCESS: "Buying process",
  PAYMENT_PLANS: "Payment plans",
  ESTATE_LIVING: "Estate living",
};

export default async function ResourcesPage() {
  const articles = await getArticles();

  return (
    <Section className="pt-10 lg:pt-16">
      <Container>
        <SectionHeading
          eyebrow="Buyer guides"
          heading="What to know before you buy land in Nigeria"
          supporting="Short, practical guides written for buyers rather than for search engines. A buyer who understands what a C of O proves is a buyer we can sell to honestly."
        />

        <div className="mt-12 space-y-16 lg:mt-16">
          {categoryOrder.map((category) => {
            const inCategory = articles.filter((a) => a.category === category);
            if (inCategory.length === 0) return null;

            return (
              <section key={category}>
                <h2 className="border-b border-hairline pb-4 text-heading text-ink">
                  {categoryLabels[category]}
                </h2>

                <div className="mt-8 grid gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                  {inCategory.map((article, index) => (
                    <ScrollReveal key={article.slug} delayMs={(index % 3) * 60}>
                      <article className="group">
                        <Link href={`/resources/${article.slug}`}>
                          <div className="relative aspect-4/3 overflow-hidden rounded-card">
                            {article.coverImage ? (
                              <Image
                                src={article.coverImage.url}
                                alt={article.coverImage.alt}
                                fill
                                sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                                className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.02]"
                              />
                            ) : (
                              <div className="size-full bg-accent-tint" />
                            )}
                            <StandInLabel
                              show={Boolean(article.coverImage?.isStandIn)}
                              attribution={article.coverImage?.attribution}
                            />
                          </div>

                          <h3 className="mt-5 text-heading text-ink transition-colors group-hover:text-accent">
                            {article.title}
                          </h3>
                          {article.publishedAt ? (
                            <p className="mt-2 text-caption text-ink-muted">
                              {formatMonthYear(article.publishedAt)}
                            </p>
                          ) : null}
                          <p className="mt-3 text-body text-ink-secondary">
                            {article.excerpt}
                          </p>
                        </Link>
                      </article>
                    </ScrollReveal>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
