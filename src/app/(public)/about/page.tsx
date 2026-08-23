import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getDeliveredEstateCount, getEstates } from "@/lib/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About — Rakuxon City",
  description:
    "Who Rakuxon City is, how we work, and why the documentation position is published on every listing.",
};

export default async function AboutPage() {
  const [estates, delivered] = await Promise.all([
    getEstates(),
    getDeliveredEstateCount(),
  ]);

  return (
    <>
      <Section className="pt-10 lg:pt-16">
        <Container>
          <p className="text-eyebrow text-ink-muted">About</p>
          <h1 className="mt-6 max-w-[18ch] text-display-xl text-ink">
            We sell land the way we would want it sold to us
          </h1>
          <p className="mt-8 max-w-[58ch] text-body-l text-ink-secondary">
            {/* TODO: real figures — company story and history need client copy. */}
            Rakuxon City develops and sells residential land and housing across
            Lagos, Ogun and the Federal Capital Territory. We acquire and title
            land ourselves, develop it into serviced estates, and sell plots and
            completed homes directly to buyers.
          </p>
        </Container>
      </Section>

      <Section className="pt-0 lg:pt-0">
        <Container>
          <SectionHeading
            heading="Why we publish the documentation"
            supporting="Land fraud is the defining risk of this market, and most of it works by omission rather than by forgery."
          />

          <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-3 lg:gap-6">
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
            ].map((item) => (
              <div key={item.title} className="border-t border-hairline pt-6">
                <p className="text-heading text-ink">{item.title}</p>
                <p className="mt-4 text-body text-ink-secondary">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading
            align="right"
            heading="Where we build"
            supporting="Three estates today, across two states and the FCT."
          />

          <ul className="mt-12 divide-y divide-hairline border-y border-hairline lg:mt-16">
            {estates.map((estate) => (
              <li
                key={estate.slug}
                className="flex flex-wrap items-baseline justify-between gap-4 py-6"
              >
                <div>
                  <p className="text-display-m text-ink">{estate.name}</p>
                  <p className="mt-2 text-body text-ink-secondary">
                    {estate.location}, {estate.state} State
                  </p>
                </div>
                <p className="text-body text-ink-muted">
                  {estate.status === "ACTIVE" ? "Selling now" : "Delivered"}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-body text-ink-secondary">
            <span className="tabular text-accent">{delivered}</span> of them has
            been handed over in full.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          {/* TODO: real figures — leadership team, names and photographs, before launch. */}
          <div className="rounded-card border border-hairline bg-surface p-8 lg:p-12">
            <p className="text-heading text-ink">Leadership</p>
            <p className="mt-4 max-w-[54ch] text-body text-ink-secondary">
              Profiles of the team are published here once the client has
              approved names, roles and photographs.
            </p>
            <div className="mt-8">
              <ButtonLink variant="secondary" href="/contact">
                Talk to the team
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
