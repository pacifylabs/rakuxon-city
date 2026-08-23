import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getDeliveredEstateCount, getEstates } from "@/lib/content";
import { getLaneCounts } from "@/lib/listings";
import { getPlacement } from "@/lib/media";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About — Rakuxon City",
  description:
    "Who Rakuxon City is, how we work, and why the documentation position is published on every listing.",
};

/**
 * The About page.
 *
 * It was previously an unbroken column of prose — the client's words were "so
 * wording… just plain content organized and it flys around". The copy was not
 * the problem; nothing anchored it. So this version gives the page the same
 * furniture every other page has: an image to open on, figures read from the
 * database rather than asserted, the principles numbered so the eye has a
 * rhythm to follow, and the estates shown rather than listed.
 */
export default async function AboutPage() {
  const [estates, delivered, counts, hero] = await Promise.all([
    getEstates(),
    getDeliveredEstateCount(),
    getLaneCounts(),
    getPlacement("homepage.hero"),
  ]);

  const states = Array.from(new Set(estates.map((estate) => estate.state)));

  return (
    <>
      <Section className="pt-10 pb-0 lg:pt-16 lg:pb-0">
        <Container>
          <p className="text-eyebrow text-ink-muted">About</p>
          <h1 className="mt-6 max-w-[18ch] text-display-xl text-ink">
            We sell land the way we would want it sold to us
          </h1>

          {/*
            `items-stretch`, and the text column carries enough copy to reach
            the image's height. Centring a three-line paragraph against a tall
            photograph left a void above and below it — the client's note was
            that the two "do not align".
          */}
          <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-stretch lg:gap-6">
            <div className="flex flex-col justify-between gap-8 lg:col-span-5">
              <div>
                {/* TODO: real figures — company story and history need client copy. */}
                <p className="max-w-[52ch] text-body-l text-ink-secondary">
                  Rakuxon City develops and sells residential land and housing
                  across Lagos, Ogun and the Federal Capital Territory. We
                  acquire and title land ourselves, develop it into serviced
                  estates, and sell plots and completed homes directly to
                  buyers.
                </p>
                <p className="mt-6 max-w-[52ch] text-body text-ink-secondary">
                  That order matters. Because we hold the title before we
                  subdivide, we can tell you exactly what covers your plot and
                  what does not — and we publish it on the listing rather than
                  waiting to be asked.
                </p>
              </div>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-hairline pt-8">
                <div>
                  <dt className="text-caption text-ink-muted">We sell</dt>
                  <dd className="mt-1 text-body text-ink">
                    Plots and completed homes
                  </dd>
                </div>
                <div>
                  <dt className="text-caption text-ink-muted">Directly</dt>
                  <dd className="mt-1 text-body text-ink">
                    No agents in between
                  </dd>
                </div>
                <div>
                  <dt className="text-caption text-ink-muted">Where</dt>
                  <dd className="mt-1 text-body text-ink">
                    Lagos, Ogun and the FCT
                  </dd>
                </div>
                <div>
                  <dt className="text-caption text-ink-muted">Payment</dt>
                  <dd className="mt-1 text-body text-ink">
                    Outright or on a plan
                  </dd>
                </div>
              </dl>
            </div>

            {hero ? (
              <div className="relative aspect-16/10 overflow-hidden rounded-image-l lg:col-span-7 lg:aspect-auto lg:min-h-[26rem]">
                <Image
                  src={hero.url}
                  alt={hero.alt}
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  priority
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>
        </Container>
      </Section>

      {/*
        Figures read from the catalogue, not typed into the page. A number a
        visitor can check against the listing hubs is worth having; one that
        drifts the first time stock changes is worse than none.
      */}
      <Section className="pb-0 lg:pb-0">
        <Container>
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-hairline bg-hairline lg:grid-cols-4">
            <Figure value={counts.land} label="plots available" />
            <Figure value={counts.homes} label="homes available" />
            <Figure value={estates.length} label="estates" />
            <Figure
              value={states.length}
              label={states.length === 1 ? "state covered" : "states covered"}
            />
          </ul>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading
            heading="Why we publish the documentation"
            supporting="Land fraud is the defining risk of this market, and most of it works by omission rather than by forgery."
          />

          <ol className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-3 lg:gap-6">
            {[
              {
                title: "Title leads every listing",
                body: "The title type, the survey number and the documents we hold appear before the price on every plot, on the card and on the page. It is the first thing you read because it is the first thing that matters.",
              },
              {
                title: "Including where it is weak",
                body: "Some of our plots are sold on a registered survey only, without excision granted. Those say so, in a neutral panel, in plain words. Pricing reflects the position.",
              },
              {
                title: "Verification is encouraged",
                body: "We provide copies of what we hold so you can run your own search at the state land registry. A buyer who checks is a buyer who stays.",
              },
            ].map((item, index) => (
              <li key={item.title} className="border-t border-hairline pt-6">
                <p className="tabular text-caption text-accent">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-4 text-heading text-ink">{item.title}</p>
                <p className="mt-4 text-body text-ink-secondary">{item.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section className="pt-0 lg:pt-0">
        <Container>
          <SectionHeading
            align="right"
            heading="Where we build"
            supporting={`${estates.length} estates today, across Lagos, Ogun and the Federal Capital Territory. ${delivered === 1 ? "One has" : `${delivered} have`} been handed over in full.`}
          />

          {/* Shown rather than listed: the previous version was a bare row of
              names, which is exactly the flatness the client was reacting to. */}
          <ul className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-3 lg:gap-6">
            {estates.map((estate) => (
              <li key={estate.slug}>
                <Link href={`/estates/${estate.slug}`} className="group block">
                  <div className="relative aspect-4/3 overflow-hidden rounded-card">
                    {estate.image ? (
                      <Image
                        src={estate.image.url}
                        alt={estate.image.alt}
                        fill
                        sizes="(min-width: 1024px) 30vw, 100vw"
                        className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="size-full bg-accent-tint" />
                    )}
                  </div>

                  <p className="mt-5 text-heading text-ink transition-colors group-hover:text-accent">
                    {estate.name}
                  </p>
                  <p className="mt-2 text-body text-ink-secondary">
                    {estate.location}, {estate.state} State
                  </p>
                  <p className="mt-3 text-caption text-ink-muted">
                    {estate.status === "ACTIVE"
                      ? `Selling now · ${estate.availableCount} available`
                      : "Delivered"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section className="pt-0 lg:pt-0">
        <Container>
          {/* TODO: real figures — leadership team, names and photographs, before launch. */}
          <div className="rounded-card border border-hairline bg-surface p-8 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-6">
              <div className="lg:col-span-7">
                <p className="text-heading text-ink">Leadership</p>
                <p className="mt-4 max-w-[54ch] text-body text-ink-secondary">
                  Profiles of the team are published here once the client has
                  approved names, roles and photographs. Until then, the people
                  who would answer your enquiry are the same people who priced
                  the plot.
                </p>
              </div>
              <div className="lg:col-span-5 lg:justify-self-end">
                <ButtonLink variant="secondary" href="/contact">
                  Talk to the team
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

function Figure({ value, label }: { value: number; label: string }) {
  return (
    <li className="bg-surface px-6 py-8">
      <p className="tabular text-display-m text-ink">{value}</p>
      <p className="mt-2 text-caption text-ink-muted">{label}</p>
    </li>
  );
}
