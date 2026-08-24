import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getEstates } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Partner with us",
  description:
    "How Rakuxon City works with private partners on estate development. Descriptive only; terms are agreed per project and discussed directly.",
  path: "/invest",
});

/**
 * 01_SITE_ARCHITECTURE.md §5.7, FR-4.1 to FR-4.5, and PRD §8.
 *
 * COPY GATE — read before editing a word of this page.
 *
 * This page must not publish returns, yields, ROI figures, minimum ticket sizes
 * or profit projections. Any of them turns it into a financial promotion and
 * pulls the client into SEC territory. PRD §8 logs that as a High risk, and
 * architecture §10 asks that the advice be given to the client in writing.
 *
 * The page is reachable from the footer and the homepage strip only — never
 * primary navigation (FR-4.1). It is public and indexed; it is simply quiet.
 *
 * Facts about what has been *delivered* are fine. Anything about what a partner
 * might *earn* is not. If a sentence answers "how much will I make", it does not
 * belong here.
 */
const process = [
  {
    step: "01",
    title: "A conversation",
    body: "You tell us what kind of project interests you and what your involvement would look like. We tell you what we have in progress and what stage it is at. Nothing is committed on either side.",
  },
  {
    step: "02",
    title: "The project and the paperwork",
    body: "If there is a fit, we take you through a specific project: the land, its title position, the development plan, the timeline and the risks. You see the documentation before anything else happens.",
  },
  {
    step: "03",
    title: "Terms, agreed in writing",
    body: "Terms are specific to the project and are settled between your advisers and ours. We do not publish them, and we do not offer a standard arrangement.",
  },
  {
    step: "04",
    title: "Delivery, with reporting",
    body: "Construction proceeds against the agreed plan, with progress reported to you directly and on a schedule set out in the agreement.",
  },
];

export default async function InvestPage() {
  const estates = await getEstates();
  const delivered = estates.filter((estate) => estate.status !== "ACTIVE");

  return (
    <>
      <Section className="pt-10 lg:pt-16">
        <Container>
          <p className="text-eyebrow text-ink-muted">Partner with us</p>
          <h1 className="mt-6 max-w-[18ch] text-display-xl text-ink">
            Development partnerships on land we already own
          </h1>
          <p className="mt-8 max-w-[58ch] text-body-l text-ink-secondary">
            Rakuxon City works with a small number of private partners to fund
            construction on estates we have already acquired and titled. This
            page explains how that works and who we are. It is not an offer, and
            there is nothing to sign up for here.
          </p>
        </Container>
      </Section>

      <Section className="pt-0 lg:pt-0">
        <Container>
          <SectionHeading
            heading="How the model works"
            supporting="Land first, construction second, and no partner capital committed before the title position on a specific site has been shown and understood."
          />

          <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-3 lg:gap-6">
            {[
              {
                title: "We buy and title the land ourselves",
                body: "Every estate we develop is land the company has already acquired and perfected. Partners are not asked to fund land speculation, and they are not asked to take a position on whether an acquisition will complete.",
              },
              {
                title: "Partners fund construction on a named project",
                body: "An arrangement is tied to one identified development, not to a fund or a pool. You know which estate, which phase and which units before anything is agreed.",
              },
              {
                title: "Terms are per project, agreed privately",
                body: "There is no standard package and no published arrangement. What is appropriate depends on the project, its stage and what you want your involvement to be.",
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
            heading="What we have delivered"
            supporting="The only claim worth making on a page like this is what has actually been handed over."
          />

          <div className="mt-12 lg:mt-16">
            {delivered.length > 0 ? (
              <ul className="divide-y divide-hairline border-y border-hairline">
                {delivered.map((estate) => (
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
                      {estate.status === "DELIVERED" ? "Delivered" : "Sold out"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="max-w-[54ch] text-body text-ink-secondary">
                {/* TODO: real figures — delivered project record, before launch. */}
                Our delivery record is provided on request.
              </p>
            )}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading
            heading="What a partnership looks like"
            supporting="Four steps, in order. Most conversations stop at the first one, and that is a reasonable outcome."
          />

          <ol className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-12">
            {process.map((item) => (
              <li key={item.step} className="flex gap-6">
                <span className="tabular shrink-0 text-display-m text-accent">
                  {item.step}
                </span>
                <div>
                  <p className="text-heading text-ink">{item.title}</p>
                  <p className="mt-3 max-w-[46ch] text-body text-ink-secondary">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="rounded-card border border-hairline bg-accent-tint p-8 lg:p-12">
            <p className="max-w-[26ch] text-display-m text-ink">
              If this is the kind of project you work on, tell us
            </p>
            <p className="mt-5 max-w-[58ch] text-body text-ink-secondary">
              The form asks a few questions so the right person picks it up. A
              member of the team will make contact to arrange a conversation.
            </p>
            <div className="mt-8">
              <ButtonLink href="/invest/enquire">
                Start a conversation
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
