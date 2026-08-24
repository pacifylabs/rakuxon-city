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

        <div className="mt-12 max-w-[68ch] lg:mt-16">
          <p className="text-body text-ink-secondary">
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

          <p className="mt-4 text-body text-ink-secondary">
            Every image is cropped to fit this site&rsquo;s layouts, which makes
            a derivative work. Only licences permitting that are used — no
            NoDerivatives, and no ShareAlike.
          </p>
        </div>

        {photographs.length > 0 ? (
          <ul className="mt-12 divide-y divide-hairline border-y border-hairline lg:mt-16">
            {photographs.map((photograph) => (
              <li
                key={photograph.name}
                className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 py-5"
              >
                <div className="min-w-0">
                  <p className="text-body text-ink">{photograph.title}</p>
                  <p className="mt-1 text-caption text-ink-muted">
                    {photograph.creator}
                  </p>
                </div>

                <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                  <a
                    href={photograph.licenseUrl}
                    rel="noreferrer noopener license"
                    target="_blank"
                    className="text-caption text-accent transition-colors hover:text-accent-hover"
                  >
                    {photograph.license}
                  </a>
                  <a
                    href={photograph.sourceUrl}
                    rel="noreferrer noopener"
                    target="_blank"
                    className="text-caption text-ink-muted transition-colors hover:text-ink"
                  >
                    Original
                  </a>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    </Section>
  );
}
