import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/listings/breadcrumbs";
import { ListingCard } from "@/components/listings/listing-card";
import { Pagination } from "@/components/listings/pagination";
import { LocationBlock } from "@/components/listings/location-block";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { Gallery } from "@/components/ui/gallery";
import { cn } from "@/lib/cn";
import { getEstateDetail, getEstateSlugs } from "@/lib/content";
import { getEstateListings } from "@/lib/listings";
import { LISTINGS_PER_PAGE } from "@/lib/listing-query";
import type { EstateStatus } from "@/generated/prisma/enums";

export const revalidate = 3600;

const statusLabels: Record<EstateStatus, string> = {
  ACTIVE: "Selling now",
  SOLD_OUT: "Sold out",
  DELIVERED: "Delivered",
};

export async function generateStaticParams() {
  const slugs = await getEstateSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/estates/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const estate = await getEstateDetail(slug);
  if (!estate) return { title: "Estate not found — Rakuxon City" };

  return {
    title: `${estate.name} — Rakuxon City`,
    description: estate.description.slice(0, 155),
  };
}

export default async function EstateDetailPage({
  params,
  searchParams,
}: PageProps<"/estates/[slug]">) {
  const { slug } = await params;
  const estate = await getEstateDetail(slug);
  if (!estate) notFound();

  const { land, homes } = await getEstateListings(estate.id);

  // Tab and page both live in the URL rather than in component state, so a
  // view is shareable and neither needs JavaScript to change.
  const query = await searchParams;
  const tab = query.tab === "homes" ? "homes" : "land";
  const all = tab === "homes" ? homes : land;

  // An estate holds at most a few dozen listings (PRD scope: 20-100 site-wide),
  // so the set is fetched whole for accurate tab counts and paged in memory.
  const pageCount = Math.max(1, Math.ceil(all.length / LISTINGS_PER_PAGE));
  const page = Math.min(
    Math.max(
      1,
      Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1,
    ),
    pageCount,
  );
  const active = all.slice(
    (page - 1) * LISTINGS_PER_PAGE,
    page * LISTINGS_PER_PAGE,
  );

  const images = estate.media.map((entry) => entry.media);
  const delivered = estate.status !== "ACTIVE";

  return (
    <>
      <Section className="pb-0 lg:pb-0">
        <Container>
          <Breadcrumbs
            trail={[
              { label: "Home", href: "/" },
              { label: "Estates", href: "/estates" },
              { label: estate.name },
            ]}
          />

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Badge
              className={
                estate.status === "ACTIVE"
                  ? "bg-status-available-bg text-status-available"
                  : "bg-status-sold-bg text-status-sold"
              }
            >
              {statusLabels[estate.status]}
            </Badge>
            <p className="text-caption text-ink-muted">
              {estate.location}, {estate.state} State
            </p>
          </div>

          <h1 className="mt-4 max-w-[20ch] text-display-l text-ink">
            {estate.name}
          </h1>

          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-6">
            <p className="text-body-l text-ink-secondary lg:col-span-7">
              {estate.description}
            </p>

            {estate.amenities.length > 0 ? (
              <ul className="lg:col-span-5 lg:col-start-8">
                {estate.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="flex items-start gap-3 border-b border-hairline py-3 text-body text-ink-secondary first:pt-0"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                    />
                    {amenity}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* §8 — a dated progress sequence proves delivery in a way a render never will. */}
          <Gallery images={images} className="mt-12 lg:mt-16" />
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="text-display-m text-ink">What is available here</h2>

          {/* FR-2.2 — an estate with nothing left still renders. */}
          {land.length === 0 && homes.length === 0 ? (
            <div className="mt-8 rounded-card border border-hairline bg-surface p-8 lg:p-12">
              <p className="text-heading text-ink">
                {delivered
                  ? "This estate has been delivered in full"
                  : "Nothing is available in this estate right now"}
              </p>
              <p className="mt-4 max-w-[54ch] text-body text-ink-secondary">
                {delivered
                  ? "Every unit here has been handed over. We keep the page up because a delivered estate is the strongest evidence we can offer that the next one will be delivered too."
                  : "Stock moves quickly. Tell us what you are looking for and we will let you know the moment something comes up here."}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <ButtonLink href="/land">Browse other estates</ButtonLink>
                <ButtonLink variant="secondary" href="/contact">
                  Tell us what you are looking for
                </ButtonLink>
              </div>
            </div>
          ) : (
            <>
              <nav aria-label="Listings in this estate" className="mt-8">
                <ul className="flex gap-8 border-b border-hairline">
                  <Tab
                    href={`/estates/${estate.slug}`}
                    label="Plots"
                    count={land.length}
                    active={tab === "land"}
                  />
                  <Tab
                    href={`/estates/${estate.slug}?tab=homes`}
                    label="Homes"
                    count={homes.length}
                    active={tab === "homes"}
                  />
                </ul>
              </nav>

              {active.length === 0 ? (
                <p className="mt-8 max-w-[54ch] text-body text-ink-secondary">
                  No {tab === "homes" ? "homes" : "plots"} are listed in this
                  estate at the moment.{" "}
                  <Link
                    href="/contact"
                    className="text-accent hover:text-accent-hover"
                  >
                    Tell us what you are looking for
                  </Link>{" "}
                  and we will be in touch when that changes.
                </p>
              ) : (
                <>
                  <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {active.map((listing) => (
                      <ListingCard
                        key={listing.slug}
                        listing={listing}
                        className="h-full"
                      />
                    ))}
                  </div>

                  <Pagination
                    page={page}
                    pageCount={pageCount}
                    hrefFor={(target) => {
                      const next = new URLSearchParams();
                      if (tab === "homes") next.set("tab", "homes");
                      if (target > 1) next.set("page", String(target));
                      const search = next.toString();
                      return `/estates/${estate.slug}${search ? `?${search}` : ""}`;
                    }}
                  />
                </>
              )}
            </>
          )}
        </Container>
      </Section>

      <Section className="pt-0 lg:pt-0">
        <Container>
          <div className="max-w-2xl">
            <LocationBlock
              location={estate.location}
              state={estate.state}
              estateName={estate.name}
            />
          </div>
        </Container>
      </Section>
    </>
  );
}

function Tab({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "-mb-px flex items-center gap-2 border-b-2 pb-4 text-body transition-colors",
          active
            ? "border-accent text-accent"
            : "border-transparent text-ink-secondary hover:text-ink",
        )}
      >
        {label}
        <span className="tabular text-caption text-ink-muted">{count}</span>
      </Link>
    </li>
  );
}
