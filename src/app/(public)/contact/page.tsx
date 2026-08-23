import type { Metadata } from "next";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { Container, Section } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Contact — Rakuxon City",
  description:
    "Talk to the land or homes team about a plot, a house, or what you are looking for.",
};

/**
 * FR-3.7 — the web form is the sole tracked enquiry channel. The phone number
 * and addresses below are published for direct contact but are not recorded as
 * enquiries, which is worth remembering when the client asks why the dashboard
 * count is lower than the number of calls they took.
 */
export default function ContactPage() {
  return (
    <Section className="pt-10 lg:pt-16">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-5">
            <p className="text-eyebrow text-ink-muted">Contact</p>
            <h1 className="mt-6 max-w-[16ch] text-display-l text-ink">
              Tell us what you are looking for
            </h1>
            <p className="mt-6 max-w-[44ch] text-body text-ink-secondary">
              The size, the area and the budget is enough to start. We will come
              back with what actually fits — including if that is nothing right
              now.
            </p>

            {/* TODO: real figures — client contact details before launch. */}
            <dl className="mt-10 space-y-5">
              {[
                ["Land enquiries", "land@rakuxoncity.com"],
                ["Home enquiries", "homes@rakuxoncity.com"],
                ["Development partnerships", "partnerships@rakuxoncity.com"],
                ["Phone", "+234 800 000 0000"],
                ["Where we are", "Lagos · Ogun · FCT Abuja"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-caption text-ink-muted">{label}</dt>
                  <dd className="mt-1 text-body text-ink">{value}</dd>
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
