import Link from "next/link";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ArrowGlyph } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

/**
 * 01_SITE_ARCHITECTURE.md §5.1 — a soft split, not a hard fork. Two cards of
 * equal weight so a visitor who will not choose a lane is never forced to.
 *
 * The counts are read from the database, never hardcoded: a lane that says
 * "15 plots available" and then shows four is worse than saying nothing.
 */
export function TwoLane({
  counts,
}: {
  counts: { land: number; homes: number };
}) {
  const lanes = [
    {
      href: "/land",
      title: "Buy land",
      promise:
        "Serviced plots with the title type, survey number and documentation listed before the price.",
      count: counts.land,
      unit: counts.land === 1 ? "plot available" : "plots available",
    },
    {
      href: "/homes",
      title: "Buy a home",
      promise:
        "Completed and in-build houses, with the finishing specification and handover date stated up front.",
      count: counts.homes,
      unit: counts.homes === 1 ? "home available" : "homes available",
    },
  ];

  return (
    <Section>
      <Container>
        <SectionHeading
          heading="Two ways to buy into a Rakuxon City estate"
          supporting="Plots to build on, or a house that is already standing. Both sit inside the same estates, under the same documentation standard."
        />

        <div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-2">
          {lanes.map((lane, index) => (
            <ScrollReveal key={lane.href} delayMs={index * 60}>
              <Link
                href={lane.href}
                className="group flex h-full flex-col justify-between gap-10 rounded-card border border-hairline bg-surface p-8 transition-colors hover:border-ink-muted lg:p-10"
              >
                <div>
                  <p className="text-display-m text-ink">{lane.title}</p>
                  <p className="mt-4 max-w-[38ch] text-body text-ink-secondary">
                    {lane.promise}
                  </p>
                </div>

                <div className="flex items-end justify-between gap-6">
                  <p className="text-caption text-ink-muted">
                    <span className="tabular text-body text-accent">
                      {lane.count}
                    </span>{" "}
                    {lane.unit}
                  </p>
                  <span className="inline-flex items-center gap-2 text-body text-accent">
                    Browse
                    <ArrowGlyph />
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
