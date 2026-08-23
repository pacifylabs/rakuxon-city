import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowGlyph } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getEstates } from "@/lib/content";
import { isPlaceholder } from "@/lib/media";
import type { EstateStatus } from "@/generated/prisma/enums";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Estates — Rakuxon City",
  description:
    "The estates behind every plot and house we sell, across Lagos, Ogun and the FCT — including the ones already delivered.",
};

const statusLabels: Record<EstateStatus, string> = {
  ACTIVE: "Selling now",
  SOLD_OUT: "Sold out",
  DELIVERED: "Delivered",
};

export default async function EstatesPage() {
  const estates = await getEstates();

  return (
    <Section className="pt-10 lg:pt-16">
      <Container>
        <SectionHeading
          eyebrow="Estates"
          heading="The estates behind every listing"
          supporting="Three developments across Lagos, Ogun and the FCT. We keep the delivered ones on this page — an estate that has been handed over is the strongest evidence we have that the next one will be."
        />

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-6">
          {estates.map((estate, index) => (
            <ScrollReveal key={estate.slug} delayMs={(index % 2) * 60}>
              <article className="group h-full">
                <Link
                  href={`/estates/${estate.slug}`}
                  className="flex h-full flex-col"
                >
                  <div className="relative aspect-16/9 overflow-hidden rounded-image-l">
                    {estate.image ? (
                      <Image
                        src={estate.image.url}
                        alt={estate.image.alt}
                        fill
                        // The first card is the LCP element on mobile, where the
                        // grid stacks. Lazy-loading it costs about a second.
                        priority={index === 0}
                        sizes="(min-width: 1024px) 45vw, 100vw"
                        className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="size-full bg-accent-tint" />
                    )}
                    {estate.image && isPlaceholder(estate.image.url) ? (
                      <p className="absolute bottom-3 left-3 rounded-full bg-canvas/85 px-3 py-1 text-caption text-ink-muted">
                        Photography pending
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-6 flex flex-1 flex-col">
                    <div className="flex flex-wrap items-center gap-3">
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
                        {estate.location}, {estate.state}
                      </p>
                    </div>

                    <h2 className="mt-4 text-display-m text-ink transition-colors group-hover:text-accent">
                      {estate.name}
                    </h2>
                    <p className="mt-4 line-clamp-3 max-w-[52ch] text-body text-ink-secondary">
                      {estate.description}
                    </p>

                    <p className="mt-auto pt-6 text-caption text-ink-muted">
                      {estate.availableCount > 0 ? (
                        <>
                          <span className="tabular text-body text-accent">
                            {estate.availableCount}
                          </span>{" "}
                          {estate.availableCount === 1 ? "listing" : "listings"}{" "}
                          available
                        </>
                      ) : (
                        "No stock available in this estate right now"
                      )}
                    </p>

                    <span className="mt-4 inline-flex items-center gap-2 text-body text-accent">
                      See the estate
                      <ArrowGlyph />
                    </span>
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
