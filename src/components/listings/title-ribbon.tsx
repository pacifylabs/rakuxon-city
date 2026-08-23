import { titleTypeLabel } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import {
  documentLabels,
  headlineDocuments,
  isWeakTitle,
  orderTitleTypes,
} from "@/lib/documents";
import type { DocumentType, TitleType } from "@/generated/prisma/enums";

/**
 * The signature element — 04_DESIGN_SYSTEM.md §7.
 *
 * A full-width band directly beneath the gallery, before the description and
 * before the price, because in this market the first question is not what a
 * plot costs but whether the seller can actually convey it.
 *
 * §7 says this is "the one place this design spends boldness", so a strong
 * title fills the band in solid `accent` rather than the quiet tint used
 * elsewhere. It is the loudest thing on the page by design, and it is still one
 * colour from the palette at one font weight.
 *
 * Where documentation is weaker — survey only — the band drops to the neutral
 * palette and shows what is *missing* beside what is held. Do not soften this.
 * A page that shows title honestly beats one that shows it selectively, and
 * that honesty is the entire argument of the site.
 */
export function TitleRibbon({
  titleType,
  additionalTitleTypes = [],
  surveyNumber,
  documents,
  className,
}: {
  titleType: TitleType;
  additionalTitleTypes?: TitleType[];
  surveyNumber: string | null;
  documents: { type: DocumentType; note?: string | null }[];
  className?: string;
}) {
  const weak = isWeakTitle(titleType);
  const titles = orderTitleTypes(titleType, additionalTitleTypes);
  const held = new Set(documents.map((document) => document.type));
  const missing = headlineDocuments.filter((type) => !held.has(type));

  return (
    <section
      aria-labelledby="title-documentation"
      className={cn(
        weak ? "border-y border-hairline bg-status-sold-bg" : "bg-accent",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[1280px] px-6 py-10 lg:px-16 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-5">
            <p
              id="title-documentation"
              className={cn(
                "text-eyebrow",
                weak ? "text-status-sold" : "text-canvas",
              )}
            >
              Title and documentation
            </p>

            <p
              className={cn(
                "mt-4 text-display-l",
                weak ? "text-status-sold" : "text-canvas",
              )}
            >
              {titleTypeLabel(titleType)}
            </p>

            {titles.length > 1 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {titles.slice(1).map((type) => (
                  <li
                    key={type}
                    className={cn(
                      "rounded-full px-3 py-1 text-caption",
                      weak
                        ? "bg-canvas text-status-sold"
                        : "bg-canvas text-accent",
                    )}
                  >
                    also {titleTypeLabel(type).toLowerCase()}
                  </li>
                ))}
              </ul>
            ) : null}

            <p
              className={cn(
                "tabular mt-5 text-body",
                weak ? "text-ink-secondary" : "text-canvas",
              )}
            >
              {surveyNumber
                ? `Survey number ${surveyNumber}`
                : "No survey number recorded against this plot yet."}
            </p>
          </div>

          <div className="lg:col-span-7">
            <p
              className={cn(
                "text-caption",
                weak ? "text-ink-secondary" : "text-canvas",
              )}
            >
              {documents.length > 0
                ? `${documents.length} ${documents.length === 1 ? "document" : "documents"} held`
                : "No documents held"}
            </p>

            {documents.length > 0 ? (
              <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {documents.map((document) => (
                  <li
                    key={document.type}
                    className={cn(
                      "flex items-start gap-2.5 text-body",
                      weak ? "text-ink" : "text-canvas",
                    )}
                  >
                    <CheckGlyph
                      className={weak ? "text-status-sold" : "text-canvas"}
                    />
                    <span>
                      {documentLabels[document.type]}
                      {document.note ? (
                        <span
                          className={cn(
                            "ml-2 text-caption",
                            weak ? "text-ink-secondary" : "text-canvas",
                          )}
                        >
                          {document.note}
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            {/*
              What is *not* held, stated as plainly as what is. Only shown on a
              weakly documented plot — listing absent paperwork against a plot
              that holds a Certificate of Occupancy would be noise, not honesty.
            */}
            {weak && missing.length > 0 ? (
              <>
                <p className="mt-8 text-caption text-ink-secondary">
                  Not held on this plot
                </p>
                <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {missing.map((type) => (
                    <li
                      key={type}
                      className="flex items-start gap-2.5 text-body text-ink-secondary"
                    >
                      <DashGlyph />
                      {documentLabels[type]}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <p
              className={cn(
                "mt-8 max-w-[62ch] text-body",
                weak ? "text-ink-secondary" : "text-canvas",
              )}
            >
              {weak
                ? "This plot is sold on a registered survey only. The excision or Governor’s consent covering it has not been granted, so there is no Certificate of Occupancy and no deed to register against it yet. The price reflects that position. We will show you exactly what exists before you pay anything, and we would encourage you to run your own search at the state land registry."
                : "Copies of every document above are made available for your own verification before any payment. You are welcome to run a search at the state land registry, and we will support it."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn("mt-1 size-4 shrink-0", className)}
    >
      <circle
        cx="8"
        cy="8"
        r="7"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.45"
      />
      <path
        d="M5 8.2l2 2 4-4.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DashGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="mt-1 size-4 shrink-0 text-ink-secondary"
    >
      <circle
        cx="8"
        cy="8"
        r="7"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.45"
      />
      <path
        d="M5.2 8h5.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
