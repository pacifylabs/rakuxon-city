import { Container, Section } from "@/components/ui/container";
import { EnquiryForm } from "@/components/forms/enquiry-form";

/**
 * 01_SITE_ARCHITECTURE.md §5.1 item 8 — the page ends where every page on this
 * site ends: at an enquiry.
 */
export function EnquiryBand() {
  return (
    <Section>
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-5">
            <h2 className="max-w-[16ch] text-display-l text-ink">
              Tell us what you are looking for
            </h2>
            <p className="mt-6 max-w-[42ch] text-body text-ink-secondary">
              Land or a house, in any of our three estates. Tell us the budget
              and the timeline and we will come back with what actually fits —
              including whether we have nothing suitable.
            </p>
            <dl className="mt-10 space-y-4">
              {[
                ["Land enquiries", "land@rakuxoncity.com"],
                ["Home enquiries", "homes@rakuxoncity.com"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-caption text-ink-muted">{label}</dt>
                  <dd className="text-body text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <div className="rounded-card border border-hairline bg-surface p-6 lg:p-8">
              <EnquiryForm />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
