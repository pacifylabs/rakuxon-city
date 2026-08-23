import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container, Section } from "@/components/ui/container";
import { Pagination } from "@/components/listings/pagination";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { StandInLabel } from "@/components/ui/stand-in-label";
import { cn } from "@/lib/cn";
import { getArticles } from "@/lib/content";
import { formatMonthYear } from "@/lib/format";
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

/** Short forms for the chips, where the full labels wrap onto three lines. */
const categoryChipLabels: Record<ArticleCategory, string> = {
  TITLE_AND_DOCUMENTATION: "Title",
  BUYING_PROCESS: "Buying",
  PAYMENT_PLANS: "Payment plans",
  ESTATE_LIVING: "Estate living",
};

const ARTICLES_PER_PAGE = 9;

type ArticleRow = Awaited<ReturnType<typeof getArticles>>[number];

/**
 * The guides hub.
 *
 * Previously this grouped every article under its category heading in a
 * three-column grid. With one article per category that put a single card in a
 * three-wide row four times over, which reads as a broken layout rather than a
 * short list — the page the client described as "aligns to the left, scanty".
 *
 * So the categories become a filter rather than four sparse sections: the most
 * recent guide leads at feature size, and everything else fills one grid that
 * is never wider than the content in it.
 */
export default async function ResourcesPage({
  searchParams,
}: PageProps<"/resources">) {
  const query = await searchParams;
  const all = await getArticles();

  const requested = Array.isArray(query.category)
    ? query.category[0]
    : query.category;
  const category = categoryOrder.find((entry) => entry === requested) ?? null;

  const byRecency = [...all].sort(
    (a, b) =>
      (b.publishedAt ? Date.parse(String(b.publishedAt)) : 0) -
      (a.publishedAt ? Date.parse(String(a.publishedAt)) : 0),
  );

  const selected = category
    ? byRecency.filter((article) => article.category === category)
    : byRecency;

  // The lead only makes sense on an unfiltered first page. Inside a category
  // the set is short enough that promoting one of four is just noise.
  const lead = category === null ? selected[0] : undefined;
  const rest = lead ? selected.slice(1) : selected;

  const pageCount = Math.max(1, Math.ceil(rest.length / ARTICLES_PER_PAGE));
  const page = Math.min(
    Math.max(
      1,
      Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1,
    ),
    pageCount,
  );
  const articles = rest.slice(
    (page - 1) * ARTICLES_PER_PAGE,
    page * ARTICLES_PER_PAGE,
  );

  const hrefFor = (target: ArticleCategory | null, targetPage = 1) => {
    const params = new URLSearchParams();
    if (target) params.set("category", target);
    if (targetPage > 1) params.set("page", String(targetPage));
    const search = params.toString();
    return `/resources${search ? `?${search}` : ""}`;
  };

  return (
    <Section className="pt-10 lg:pt-16">
      <Container>
        <SectionHeading
          eyebrow="Buyer guides"
          heading="What to know before you buy land in Nigeria"
          supporting="Short, practical guides written for buyers rather than for search engines. A buyer who understands what a C of O proves is a buyer we can sell to honestly."
        />

        {lead ? <LeadArticle article={lead} /> : null}

        <nav
          aria-label="Guide categories"
          className={cn("flex flex-wrap gap-3", lead ? "mt-16" : "mt-12")}
        >
          <CategoryChip href={hrefFor(null)} active={category === null}>
            All guides
          </CategoryChip>
          {categoryOrder.map((entry) => (
            <CategoryChip
              key={entry}
              href={hrefFor(entry)}
              active={category === entry}
            >
              {categoryChipLabels[entry]}
            </CategoryChip>
          ))}
        </nav>

        {articles.length === 0 ? (
          <p className="mt-10 max-w-[54ch] text-body text-ink-secondary">
            Nothing published under this heading yet. The other categories have
            guides in them, and we add to these as questions come up.
          </p>
        ) : (
          <>
            <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {articles.map((article, index) => (
                <ScrollReveal key={article.slug} delayMs={(index % 3) * 60}>
                  <ArticleCard article={article} />
                </ScrollReveal>
              ))}
            </div>

            <Pagination
              page={page}
              pageCount={pageCount}
              hrefFor={(target) => hrefFor(category, target)}
            />
          </>
        )}
      </Container>
    </Section>
  );
}

/** The most recent guide, at feature size. Image and text, not a wide card. */
function LeadArticle({ article }: { article: ArticleRow }) {
  return (
    <article className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-12 lg:items-center lg:gap-10">
      <Link
        href={`/resources/${article.slug}`}
        className="group relative block aspect-4/3 overflow-hidden rounded-image-l lg:col-span-7 lg:aspect-16/10"
      >
        {article.coverImage ? (
          <Image
            src={article.coverImage.url}
            alt={article.coverImage.alt}
            fill
            sizes="(min-width: 1024px) 58vw, 100vw"
            priority
            className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.02]"
          />
        ) : (
          <div className="size-full bg-accent-tint" />
        )}
        <StandInLabel
          show={Boolean(article.coverImage?.isStandIn)}
          attribution={article.coverImage?.attribution}
        />
      </Link>

      <div className="lg:col-span-5">
        <p className="text-eyebrow text-ink-muted">
          Latest · {categoryLabels[article.category]}
        </p>
        <h2 className="mt-4 text-display-m text-ink">
          <Link
            href={`/resources/${article.slug}`}
            className="transition-colors hover:text-accent"
          >
            {article.title}
          </Link>
        </h2>
        <p className="mt-5 max-w-[52ch] text-body-l text-ink-secondary">
          {article.excerpt}
        </p>
        {article.publishedAt ? (
          <p className="mt-5 text-caption text-ink-muted">
            {formatMonthYear(article.publishedAt)}
          </p>
        ) : null}
        <Link
          href={`/resources/${article.slug}`}
          className="mt-6 inline-block text-body text-accent underline underline-offset-4 transition-colors hover:text-accent-hover"
        >
          Read the guide
        </Link>
      </div>
    </article>
  );
}

function ArticleCard({ article }: { article: ArticleRow }) {
  return (
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
            compact
          />
        </div>

        <p className="mt-5 text-caption text-ink-muted">
          {categoryLabels[article.category]}
        </p>
        <h3 className="mt-2 text-heading text-ink transition-colors group-hover:text-accent">
          {article.title}
        </h3>
        <p className="mt-3 text-body text-ink-secondary">{article.excerpt}</p>
        {article.publishedAt ? (
          <p className="mt-3 text-caption text-ink-muted">
            {formatMonthYear(article.publishedAt)}
          </p>
        ) : null}
      </Link>
    </article>
  );
}

function CategoryChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex min-h-11 items-center rounded-full border px-4 text-body transition-colors",
        "focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
        active
          ? "border-accent bg-accent-tint text-accent"
          : "border-hairline bg-surface text-ink-secondary hover:border-ink-muted",
      )}
    >
      {children}
    </Link>
  );
}
