import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { formatMonthYear } from "@/lib/format";
import type { ArticleCategory } from "@/generated/prisma/enums";

type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  publishedAt: Date | null;
  coverImage: {
    url: string;
    alt: string;
    isStandIn: boolean;
    attribution: string | null;
  } | null;
};

const categoryLabels: Record<ArticleCategory, string> = {
  TITLE_AND_DOCUMENTATION: "Title and documentation",
  BUYING_PROCESS: "Buying process",
  PAYMENT_PLANS: "Payment plans",
  ESTATE_LIVING: "Estate living",
};

/**
 * 01_SITE_ARCHITECTURE.md §5.1 item 6 — conversion work, not blog filler. A
 * buyer who understands what a C of O proves is a buyer who can be sold to
 * honestly.
 */
export function ResourcesTeaser({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  return (
    <Section>
      <Container>
        <SectionHeading
          heading="Before you buy land in Nigeria"
          supporting="Short, practical guides to title, verification and payment plans — written for buyers, not for search engines."
          action={
            <ButtonLink variant="secondary" href="/resources">
              Explore articles
            </ButtonLink>
          }
        />

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-6">
          {articles.map((article, index) => (
            <ScrollReveal key={article.slug} delayMs={index * 60}>
              <article className="group">
                <Link href={`/resources/${article.slug}`} className="block">
                  <div className="relative aspect-16/9 overflow-hidden rounded-image-l">
                    {article.coverImage ? (
                      <Image
                        src={article.coverImage.url}
                        alt={article.coverImage.alt}
                        fill
                        sizes="(min-width: 1024px) 45vw, 100vw"
                        className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="size-full bg-accent-tint" />
                    )}
                  </div>

                  <div className="mt-6 flex gap-6">
                    <span className="tabular shrink-0 text-display-m text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-heading text-ink transition-colors group-hover:text-accent">
                        {article.title}
                      </h3>
                      <p className="mt-2 text-caption text-ink-muted">
                        {categoryLabels[article.category]}
                        {article.publishedAt
                          ? ` · ${formatMonthYear(article.publishedAt)}`
                          : ""}
                      </p>
                      <p className="mt-3 max-w-[46ch] text-body text-ink-secondary">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>
                </Link>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
