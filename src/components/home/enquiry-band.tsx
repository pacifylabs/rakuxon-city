import { Container, Section } from "@/components/ui/container";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { site, telHref } from "@/lib/site";

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
            {/*
              The per-lane addresses that used to sit here (land@, homes@) were
              designed rather than confirmed, and were removed from the contact
              page for that reason — leaving them here would have published
              addresses the site elsewhere admits it cannot vouch for.
              See lib/site.ts and TODO §2.1.
            */}
            <dl className="mt-10 space-y-4">
              <div>
                <dt className="text-caption text-ink-muted">Email</dt>
                <dd className="text-body">
                  <a
                    href={`mailto:${site.email}`}
                    className="text-ink underline-offset-4 transition-colors hover:text-accent hover:underline"
                  >
                    {site.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-caption text-ink-muted">Phone</dt>
                <dd className="text-body">
                  <a
                    href={telHref}
                    className="text-ink underline-offset-4 transition-colors hover:text-accent hover:underline"
                  >
                    {site.phone.display}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <div className="rounded-card border border-hairline bg-surface p-6 lg:p-8">
              <EnquiryForm source="GENERAL" />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
