import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

/**
 * 01_SITE_ARCHITECTURE.md §5.1 item 4.
 *
 * TODO: real figures — every number below is a placeholder. PRD §8 logs
 * launching with invented trust figures as a High risk, and the Phase 8 content
 * gate blocks launch until the client supplies the real ones. Search this file
 * for "TODO: real figures" before go-live.
 */
const figures = [
  // TODO: real figures
  { value: "9", unit: "years", label: "Operating in Nigerian real estate" },
  // TODO: real figures
  { value: "610", unit: "plots", label: "Sold and allocated to date" },
  // TODO: real figures
  { value: "1", unit: "estate", label: "Delivered and handed over" },
];

export function TrustBand({ deliveredEstates }: { deliveredEstates: number }) {
  const resolved = figures.map((figure, index) =>
    // The delivered-estate count is the one figure that can be true today, so it
    // is read from the database rather than invented alongside the others.
    index === 2
      ? {
          ...figure,
          value: String(deliveredEstates),
          unit: deliveredEstates === 1 ? "estate" : "estates",
        }
      : figure,
  );

  return (
    <Section>
      <Container>
        <SectionHeading
          align="right"
          heading="Why buyers choose us"
          supporting="We publish the documentation position on every listing, including the plots where it is weaker than a buyer would like. It costs us some enquiries and it keeps the ones worth having."
        />

        {/*
          A plain list rather than a definition list. The figure and its label
          read as one item here, and a <dl> only satisfies axe when <dt>/<dd>
          are direct children — which fights both the grid and the reveal
          wrapper for no accessibility gain.
        */}
        <ScrollReveal>
          <ul className="mt-12 grid gap-x-6 gap-y-10 border-t border-hairline pt-10 sm:grid-cols-3 lg:mt-16">
            {resolved.map((figure) => (
              <li key={figure.label}>
                <p className="tabular text-display-l text-accent">
                  {figure.value}
                  <span className="ml-2 text-heading text-ink-secondary">
                    {figure.unit}
                  </span>
                </p>
                <p className="mt-3 max-w-[26ch] text-body text-ink-secondary">
                  {figure.label}
                </p>
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
