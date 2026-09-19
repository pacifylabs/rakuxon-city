import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";

/**
 * Routes agents, developers, landlords and owners to the self-serve lister
 * portal. Mirrors the investor strip pattern — one paragraph, clear actions,
 * no clutter in primary navigation.
 */
export function ListerPortalStrip() {
  return (
    <Section>
      <Container>
        <div className="grid gap-8 rounded-card border border-line bg-surface p-8 lg:grid-cols-12 lg:items-center lg:p-12">
          <div className="lg:col-span-7">
            <p className="text-eyebrow text-accent-text">List with us</p>
            <p className="mt-4 max-w-[22ch] text-display-m text-foreground">
              Have land or a home to sell?
            </p>
            <p className="mt-5 max-w-[60ch] text-body text-muted">
              Agents, developers, landlords and owners can create a free account,
              upload listing details and photos, and submit for review. Nothing
              goes on the public site until our team approves it.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:col-span-5 lg:justify-end">
            <ButtonLink variant="primary" href="/portal/register">
              Create lister account
            </ButtonLink>
            <ButtonLink variant="secondary" href="/portal/login">
              Sign in
            </ButtonLink>
          </div>

          <p className="text-caption text-muted lg:col-span-12 lg:-mt-2">
            Already registered?{" "}
            <Link
              href="/portal/login"
              className="text-accent-text underline-offset-4 hover:underline"
            >
              Go to your dashboard
            </Link>
            .
          </p>
        </div>
      </Container>
    </Section>
  );
}
