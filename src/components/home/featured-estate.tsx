import Image from "next/image";
import Link from "next/link";
import { ArrowGlyph, ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { StandInLabel } from "@/components/ui/stand-in-label";

type Estate = {
  slug: string;
  name: string;
  location: string;
  state: string;
  description: string;
  listingCount: number;
  image: {
    url: string;
    alt: string;
    width: number;
    height: number;
    isStandIn: boolean;
    attribution: string | null;
  } | null;
};

/**
 * The featured estate block from the reference: a large 16:9 frame carrying the
 * estate label, and a smaller secondary estate beside it.
 *
 * The floating callout overlapping this imagery is the first of exactly two
 * lifted elements on the page (04_DESIGN_SYSTEM.md §5). The second is the FAQ
 * panel. Everything else is flat with a hairline.
 */
export function FeaturedEstate({ estates }: { estates: Estate[] }) {
  const [lead, secondary] = estates;
  if (!lead) return null;

  return (
    <Section className="pt-0 lg:pt-0">
      <Container>
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="relative lg:col-span-8">
            <figure className="relative aspect-16/9 overflow-hidden rounded-image-l">
              {lead.image ? (
                <Image
                  src={lead.image.url}
                  alt={lead.image.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="size-full bg-accent-tint" />
              )}

              <figcaption className="absolute top-0 right-0 flex max-w-[85%] items-center gap-3 rounded-bl-image-l bg-canvas py-2 pl-4 lg:gap-4 lg:py-3 lg:pl-6">
                <span
                  className="h-px w-6 shrink-0 bg-ink-muted lg:w-10"
                  aria-hidden="true"
                />
                <span className="truncate text-body text-ink lg:text-heading">
                  {lead.name}
                </span>
              </figcaption>

              {/* Bottom-right: the lifted callout overlaps the bottom-left corner. */}
              <StandInLabel
                show={Boolean(lead.image?.isStandIn)}
                attribution={lead.image?.attribution}
                className="right-3 bottom-3 left-auto"
              />
            </figure>

            {/* Elevation 1 of 2 — the callout overlapping the hero imagery. */}
            <div className="relative z-10 mx-4 -mt-12 max-w-lg rounded-card bg-surface p-6 shadow-lift lg:mx-10 lg:-mt-16 lg:p-8">
              <p className="text-heading text-ink">
                Title checked before it is listed
              </p>
              <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {[
                  "Title type on every plot",
                  "Survey number published",
                  "Documents listed in full",
                  "Weak paperwork stated plainly",
                ].map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2 text-body text-ink-secondary"
                  >
                    <span
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                      aria-hidden="true"
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {secondary ? (
            <div className="flex flex-col lg:col-span-4">
              <figure className="relative aspect-4/3 overflow-hidden rounded-image-l">
                {secondary.image ? (
                  <Image
                    src={secondary.image.url}
                    alt={secondary.image.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="size-full bg-accent-tint" />
                )}
                <figcaption className="absolute right-0 bottom-0 flex max-w-[85%] items-center gap-3 rounded-tl-image-l bg-canvas py-2 pl-4">
                  <span
                    className="h-px w-6 shrink-0 bg-ink-muted lg:w-8"
                    aria-hidden="true"
                  />
                  <span className="truncate text-body text-ink">
                    {secondary.name}
                  </span>
                </figcaption>
              </figure>

              <p className="mt-6 text-heading text-ink">
                {secondary.location}, {secondary.state}
              </p>
              <p className="mt-3 line-clamp-4 text-body text-ink-secondary">
                {secondary.description}
              </p>

              <Link
                href={`/estates/${secondary.slug}`}
                className="mt-5 inline-flex items-center gap-2 text-body text-accent transition-colors hover:text-accent-hover"
              >
                See all estates
                <ArrowGlyph />
              </Link>
            </div>
          ) : null}
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-4 lg:mt-24">
          <ButtonLink variant="secondary" href={`/estates/${lead.slug}`}>
            Explore {lead.name}
          </ButtonLink>
          <p className="text-body text-ink-muted">
            <span className="tabular">{lead.listingCount}</span> listings in
            this estate · {lead.location}, {lead.state}
          </p>
        </div>
      </Container>
    </Section>
  );
}
