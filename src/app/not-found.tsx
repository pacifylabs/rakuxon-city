import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/**
 * Brought forward from Phase 8 deliberately, and kept minimal.
 *
 * At the Phase 3 milestone the primary navigation points at `/land`, `/homes`,
 * `/estates`, `/resources` and `/about`, none of which exist until Phases 4
 * and 5. Anyone clicking through the preview would otherwise land on the
 * unstyled framework 404 and reasonably conclude the site is broken.
 */
export default function NotFound() {
  return (
    <Container as="main" className="relative z-10">
      <div className="flex min-h-[70vh] flex-col justify-center py-24">
        <p className="text-eyebrow text-muted">Not here yet</p>
        <h1 className="mt-6 max-w-[20ch] text-display-l text-foreground">
          This part of the site is still being built
        </h1>
        <p className="mt-6 max-w-[52ch] text-body text-muted">
          The homepage is a visual preview. Listings, estates and the buyer
          guides arrive in the next stage of the build, and the enquiry form
          starts working in the stage after that.
        </p>
        <div className="mt-10">
          <ButtonLink href="/">Back to the homepage</ButtonLink>
        </div>
      </div>
    </Container>
  );
}
