import { Container, Section } from "@/components/ui/container";
import { site } from "@/lib/site";

export type LegalSection = {
  heading: string;
  body: string[];
  /** Rendered as a bulleted list beneath the body paragraphs. */
  points?: string[];
};

/**
 * Shared shell for the privacy notice and the terms.
 *
 * These documents bind the company, and unlike the buyer guides they are not
 * merely informative — a privacy notice is a statement of what the operator
 * does with personal data, and under the Nigeria Data Protection Act 2023 an
 * inaccurate one is a compliance problem rather than an editorial one.
 *
 * So the content below describes what this site actually does today, and the
 * review banner is prominent rather than buried. It follows the same principle
 * as the sibling rakuxon-care project: state plainly that the notice is
 * pending approval and give a real contact route, rather than presenting
 * unapproved text as settled.
 */
export function LegalPage({
  title,
  updated,
  summary,
  sections,
}: {
  title: string;
  updated: string;
  summary: string;
  sections: LegalSection[];
}) {
  return (
    <Section className="pt-10 lg:pt-16">
      <Container>
        <div className="max-w-[70ch]">
          <p className="text-eyebrow text-ink-muted">Legal</p>
          <h1 className="mt-4 text-display-l text-ink">{title}</h1>
          <p className="mt-6 text-body-l text-ink-secondary">{summary}</p>
          <p className="mt-4 text-caption text-ink-muted">
            Last updated {updated}
          </p>

          <p
            role="note"
            className="mt-10 rounded-card border border-accent/40 bg-accent-tint px-5 py-4 text-body text-ink-secondary"
          >
            <span className="font-medium text-accent">Awaiting sign-off.</span>{" "}
            This notice describes how the site works today and has not yet been
            approved by the company&rsquo;s solicitor. If anything here matters
            to a decision you are making, email{" "}
            <a
              href={`mailto:${site.email}`}
              className="break-words text-accent underline underline-offset-4 transition-colors hover:text-accent-hover"
            >
              {site.email}
            </a>{" "}
            and ask, rather than relying on it.
          </p>

          <div className="mt-14 flex flex-col gap-12">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-heading text-ink">{section.heading}</h2>
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-4 text-body text-ink-secondary"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.points ? (
                  <ul className="mt-5 flex flex-col gap-3">
                    {section.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-3 text-body text-ink-secondary"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
