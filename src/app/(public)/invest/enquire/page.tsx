import type { Metadata } from "next";
import { InvestorEnquiryForm } from "@/components/forms/investor-enquiry-form";
import { Container, Section } from "@/components/ui/container";
import { BackLink } from "@/components/layout/back-link";

export const metadata: Metadata = {
  title: "Start a conversation — Rakuxon City",
  description:
    "Tell us about the kind of development project you work on. A member of the team will make contact.",
  robots: { index: false, follow: true },
};

/**
 * FR-4.5 — the confirmation says only that the team will make contact. Nothing
 * about terms, nothing about what happens next beyond a conversation.
 */
export default function InvestorEnquirePage() {
  return (
    <Section className="pt-10 lg:pt-16">
      <Container>
        <BackLink href="/invest" label="Back to partnerships" />

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-5">
            <h1 className="max-w-[16ch] text-display-l text-ink">
              Start a conversation
            </h1>
            <p className="mt-6 max-w-[44ch] text-body text-ink-secondary">
              These questions help the right person pick this up. A member of
              the team will make contact to arrange a conversation — nothing is
              committed by sending it.
            </p>
            <p className="mt-8 max-w-[44ch] text-caption text-ink-muted">
              Enquiries sent here go to a restricted inbox and are handled
              separately from property enquiries.
            </p>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <div className="rounded-card border border-hairline bg-surface p-6 lg:p-8">
              <InvestorEnquiryForm />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
