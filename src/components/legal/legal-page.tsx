import Link from "next/link";
import { Container, Section } from "@/components/ui/container";
import { site } from "@/lib/site";

/** A paragraph, or a paragraph with one inline link in the middle of it. */
export type LegalParagraph =
  | string
  | {
      text: string;
      link: { href: string; label: string; rel?: string };
      after: string;
    };

export type LegalSection = {
  heading: string;
  body: LegalParagraph[];
  /** Rendered as a bulleted list beneath the body paragraphs. */
  points?: string[];
};

/**
 * Shared shell for the privacy notice and the terms.
 *
 * These documents bind the company, and unlike the buyer guides they are not
 * merely informative — a privacy notice states what the operator does with
 * personal data, and under the Nigeria Data Protection Act 2023 an inaccurate
 * one is a compliance problem rather than an editorial one. So the content
 * describes what this site actually does, and the review banner is prominent
 * rather than buried.
 *
 * LAYOUT: two columns, not one.
 *
 * The body was previously a 70ch measure inside a full-width container, which
 * left roughly 40% of every legal page empty down its right-hand side — the
 * space the client marked. Long legal text also genuinely needs a way in.
 *
 * So the freed column carries a sticky contents list built from the section
 * headings themselves, which cannot drift out of sync with the document, plus
 * the contact route. Reading measure is unchanged; the page simply stops
 * wasting the half it was not using.
 */
function slug(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function Paragraph({ paragraph }: { paragraph: LegalParagraph }) {
  if (typeof paragraph === "string") {
    return <p className="mt-4 text-body text-muted">{paragraph}</p>;
  }

  return (
    <p className="mt-4 text-body text-muted">
      {paragraph.text}
      <Link
        href={paragraph.link.href}
        rel={paragraph.link.rel}
        className="text-accent-text underline underline-offset-4 transition-colors hover:text-foreground"
      >
        {paragraph.link.label}
      </Link>
      {paragraph.after}
    </p>
  );
}

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
        <div className="max-w-[62ch]">
          <p className="text-eyebrow text-muted">Legal</p>
          <h1 className="mt-4 text-display-l text-foreground">{title}</h1>
          <p className="mt-6 text-body-l text-muted">{summary}</p>
          <p className="mt-4 text-caption text-muted">
            Last updated {updated}
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7 xl:col-span-8">
            <p
              role="note"
              className="rounded-card border border-line bg-accent-tint px-5 py-4 text-body text-muted"
            >
              <span className="font-medium text-accent-text">
                Awaiting sign-off.
              </span>{" "}
              This notice describes how the site works today and has not yet
              been approved by the company&rsquo;s solicitor. If anything here
              matters to a decision you are making, email{" "}
              <a
                href={`mailto:${site.email}`}
                className="break-words text-accent-text underline underline-offset-4 transition-colors hover:text-foreground"
              >
                {site.email}
              </a>{" "}
              and ask, rather than relying on it.
            </p>

            <div className="mt-12 flex flex-col gap-12">
              {sections.map((section) => (
                <section
                  key={section.heading}
                  id={slug(section.heading)}
                  // Clears the sticky nav when jumped to from the contents.
                  className="scroll-mt-24"
                >
                  <h2 className="text-heading text-foreground">{section.heading}</h2>
                  {section.body.map((paragraph, index) => (
                    <Paragraph key={index} paragraph={paragraph} />
                  ))}
                  {section.points ? (
                    <ul className="mt-5 flex flex-col gap-3">
                      {section.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-3 text-body text-muted"
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

          {/* Built from the headings themselves, so it cannot fall out of step
              with the document as sections are added or renamed. */}
          <aside className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-8">
              <nav aria-label="On this page">
                <p className="text-eyebrow text-muted">On this page</p>
                <ol className="mt-5 divide-y divide-line border-y border-line">
                  {sections.map((section, index) => (
                    <li key={section.heading}>
                      <a
                        href={`#${slug(section.heading)}`}
                        className="flex items-baseline gap-4 py-3 text-body text-muted transition-colors hover:text-accent-text"
                      >
                        <span
                          aria-hidden="true"
                          className="tabular text-caption text-muted"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {section.heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>

              <div className="mt-10 rounded-card border border-line bg-surface p-6">
                <p className="text-heading text-foreground">Something unclear?</p>
                <p className="mt-3 text-body text-muted">
                  Ask us rather than guessing. We would rather answer a question
                  now than have you rely on a sentence that turns out not to
                  cover your situation.
                </p>
                <a
                  href={`mailto:${site.email}`}
                  className="mt-5 inline-block text-body text-accent-text underline underline-offset-4 transition-colors hover:text-foreground"
                >
                  {site.email}
                </a>
                <p className="mt-2 text-caption text-muted">
                  {site.phone.display} · {site.phone.note}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
