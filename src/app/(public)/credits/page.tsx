import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Image credits",
  description:
    "Attribution for the stand-in photography used on this site while the client's own photographs are produced.",
  path: "/credits",
});

/**
 * Where the photography credits live now that the on-image label is gone.
 *
 * 22 of the 25 stand-in photographs are CC BY, which requires attribution "in
 * a manner reasonable to the medium". The medium is a website, and the
 * conventional answer is a credits page linked from the footer — which is what
 * this is. Removing the "Representative image" chip without putting the credit
 * somewhere would have used those images outside their licence.
 *
 * Read from the same manifest the seed reads, so a credit cannot drift from the
 * image it belongs to, and a photograph swapped out of the manifest disappears
 * from here automatically.
 *
 * This page goes when the client's own photography lands — see TODO §2.2.
 */
type Photograph = {
  name: string;
  file: string;
  alt: string;
  title: string;
  creator: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  attribution: string | null;
};

function readManifest(): Photograph[] {
  try {
    return JSON.parse(
      readFileSync(
        join(process.cwd(), "public", "images", "photography", "manifest.json"),
        "utf8",
      ),
    );
  } catch {
    // The manifest is generated, not committed-by-hand — a build without it
    // should render an honest empty page rather than fail.
    return [];
  }
}

export default function CreditsPage() {
  const photographs = readManifest();
  const licences = Array.from(new Set(photographs.map((p) => p.license)));

  return (
    <Section className="pt-10 lg:pt-16">
      <Container>
        <SectionHeading
          eyebrow="Credits"
          heading="Photography on this site"
          supporting="The photographs here are licensed images used while our own are produced. None of them show the actual plots, homes or estates we sell."
        />

        {/*
          Two columns, and the list is a grid of cards rather than a wide row.

          A full-width row put the title hard left and the licence hard right
          with a metre of nothing between them, which read as broken rather
          than as spacious — the same gap the client marked on the legal pages.
        */}
        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7 xl:col-span-8">
            <p className="text-body text-muted">
              {photographs.length > 0 ? (
                <>
                  <span className="tabular">{photographs.length}</span> images,
                  used under {licences.join(", ")}. Each is credited to its
                  photographer below, with a link to the original.
                </>
              ) : (
                "No stand-in photography is in use."
              )}
            </p>

            <p className="mt-4 text-body text-muted">
              Every image is cropped to fit this site&rsquo;s layouts, which
              makes a derivative work. Only licences permitting that are used —
              no NoDerivatives, and no ShareAlike.
            </p>

            {photographs.length > 0 ? (
              <ul className="mt-10 grid gap-4 sm:grid-cols-2">
                {photographs.map((photograph) => (
                  <li
                    key={photograph.name}
                    className="flex flex-col justify-between gap-4 rounded-card border border-line bg-surface p-5"
                  >
                    <div className="min-w-0">
                      <p className="text-body text-foreground">{photograph.title}</p>
                      <p className="mt-1 text-caption text-muted">
                        {photograph.creator}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                      <a
                        href={photograph.licenseUrl}
                        rel="noreferrer noopener license"
                        target="_blank"
                        className="text-caption text-accent-text transition-colors hover:text-foreground"
                      >
                        {photograph.license}
                      </a>
                      <a
                        href={photograph.sourceUrl}
                        rel="noreferrer noopener"
                        target="_blank"
                        className="text-caption text-muted transition-colors hover:text-foreground"
                      >
                        Original
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <aside className="lg:col-span-5 xl:col-span-4">
            <div className="rounded-card border border-line bg-surface p-6 lg:sticky lg:top-8">
              <p className="text-heading text-foreground">Why these are here</p>
              <p className="mt-3 text-body text-muted">
                None of these photographs show the actual plots, homes or
                estates we sell. They stand in while our own photography is
                produced, and they are replaced one at a time as it lands.
              </p>
              <p className="mt-4 text-body text-muted">
                Where a home is sold off plan, any visual of the finished
                building is an artist&rsquo;s impression and says so on the
                listing.
              </p>

              <dl className="mt-6 border-t border-line pt-5">
                <dt className="text-caption text-muted">Licences in use</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {licences.map((licence) => (
                    <span
                      key={licence}
                      className="rounded-full bg-accent-tint px-3 py-1 text-caption text-accent-text"
                    >
                      {licence}
                    </span>
                  ))}
                </dd>
              </dl>
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
