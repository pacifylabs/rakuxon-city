import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";

/**
 * 01_SITE_ARCHITECTURE.md §5.1 item 7 — low-key, one paragraph, one action.
 *
 * This strip and the footer are the only two routes to `/invest` (FR-4.1), and
 * the copy here carries no figures for the same reason the page itself does
 * not: returns, yields or a minimum ticket would turn it into a financial
 * promotion. PRD §8 logs that as a High risk with SEC exposure.
 */
export function InvestorStrip() {
  return (
    <Section>
      <Container>
        <div className="grid gap-8 rounded-card border border-hairline bg-accent-tint p-8 lg:grid-cols-12 lg:items-center lg:p-12">
          <div className="lg:col-span-8">
            <p className="text-eyebrow text-accent">Partner with us</p>
            <p className="mt-4 max-w-[24ch] text-display-m text-ink">
              Funding development on land we already own
            </p>
            <p className="mt-5 max-w-[60ch] text-body text-ink-secondary">
              We work with a small number of private partners on estate
              development. The arrangement is set per project and discussed
              directly — there is nothing to sign up for on this page.
            </p>
          </div>

          <div className="lg:col-span-4 lg:justify-self-end">
            <ButtonLink variant="secondary" href="/invest">
              Read how it works
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
