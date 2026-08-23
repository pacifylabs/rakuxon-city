import { titleTypeLabel } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import type { TitleType } from "@/generated/prisma/enums";

/**
 * The signature element — 04_DESIGN_SYSTEM.md §7.
 *
 * A full-width band directly beneath the gallery, carrying the title type, the
 * survey number and every document held. It sits before the description and
 * before the price, because in this market the first question is not what a
 * plot costs but whether the seller can actually convey it.
 *
 * Where documentation is weaker — survey only — the band renders in the neutral
 * status-sold palette rather than sage, and says plainly what is *not* held.
 * That is the whole argument of the site: a page that shows title honestly
 * beats one that shows it selectively. Do not soften this.
 */
export function TitleRibbon({
  titleType,
  surveyNumber,
  documents,
  className,
}: {
  titleType: TitleType;
  surveyNumber: string | null;
  documents: { label: string }[];
  className?: string;
}) {
  const weak = titleType === "SURVEY_ONLY";

  return (
    <section
      aria-labelledby="title-documentation"
      className={cn(
        "border-y",
        weak
          ? "border-hairline bg-status-sold-bg"
          : "border-hairline bg-accent-tint",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[1280px] px-6 py-8 lg:px-16 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-5">
            <p
              id="title-documentation"
              className={cn(
                "text-eyebrow",
                weak ? "text-status-sold" : "text-accent",
              )}
            >
              Title and documentation
            </p>
            <p
              className={cn(
                "mt-3 text-display-m",
                weak ? "text-status-sold" : "text-accent",
              )}
            >
              {titleTypeLabel(titleType)}
            </p>
            {surveyNumber ? (
              <p className="tabular mt-2 text-body text-ink-secondary">
                Survey number {surveyNumber}
              </p>
            ) : (
              <p className="mt-2 text-body text-ink-secondary">
                No survey number recorded against this plot yet.
              </p>
            )}
          </div>

          <div className="lg:col-span-7">
            <p className="text-caption text-ink-secondary">
              {documents.length > 0 ? "Documents held" : "No documents held"}
            </p>

            {documents.length > 0 ? (
              <ul className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {documents.map((document) => (
                  <li
                    key={document.label}
                    className="flex items-start gap-2 text-body text-ink"
                  >
                    <FileGlyph
                      className={weak ? "text-status-sold" : "text-accent"}
                    />
                    {document.label}
                  </li>
                ))}
              </ul>
            ) : null}

            {weak ? (
              <p className="mt-5 max-w-[62ch] text-body text-ink-secondary">
                This plot is sold on a registered survey only. The excision or
                Governor&rsquo;s consent covering it has not been granted, so
                there is no Certificate of Occupancy and no deed to register
                against it yet. The price reflects that position. We will show
                you exactly what exists before you pay anything, and we would
                encourage you to run your own search at the state land registry.
              </p>
            ) : (
              <p className="mt-5 max-w-[62ch] text-body text-ink-secondary">
                Copies of the documents above are made available for your own
                verification before any payment. You are welcome to run a search
                at the state land registry, and we will support it.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FileGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 14"
      fill="none"
      aria-hidden="true"
      className={cn("mt-1 size-3.5 shrink-0", className)}
    >
      <path
        d="M2.5 1h5L10 3.5V13H2.5z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 1v2.5H10"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}
