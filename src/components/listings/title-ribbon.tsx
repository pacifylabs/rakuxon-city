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
 * The signature element — 04_DESIGN_SYSTEM.md §7 (v2.0).
 *
 * A full-width band directly beneath the gallery, before the description and
 * before the price, because in this market the first question is not what a
 * plot costs but whether the seller can actually convey it.
 *
 * RESTRUCTURED for the palette change, not merely recoloured — this is what
 * §7 itself asks for: "ivory band with a 2px champagne rule along its top
 * edge", replacing the v1.0/gold-era treatment of a solid accent-filled band
 * with light text. That older treatment is exactly what §12 forbids under
 * this palette — light text on a solid accent fill measures ~2.1:1 — so it
 * could not simply be recoloured in place; the band itself had to change.
 *
 * The rule is the seal, and §7 is explicit that it "appears nowhere else on
 * the site" — no other component in this codebase should render a champagne
 * top-edge rule.
 *
 * Where documentation is weaker — survey only — the rule and badge render in
 * the neutral `status-sold` family instead, and the ribbon states plainly
 * what is missing beside what is held. Do not soften this. A page that shows
 * title honestly beats one that shows it selectively, and that honesty is
 * the entire argument of the site.
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
        "border-t-2 border-b border-b-line",
        weak ? "border-t-status-sold bg-status-sold-bg" : "border-t-accent bg-ivory",
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
                weak ? "text-status-sold" : "text-accent-text",
              )}
            >
              Title and documentation
            </p>

            <p className="mt-4 text-display-l text-foreground">
              {titleTypeLabel(titleType)}
            </p>

            {titles.length > 1 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {titles.slice(1).map((type) => (
                  <li
                    key={type}
                    className={cn(
                      "rounded-full px-3 py-1 text-caption ring-1",
                      weak
                        ? "bg-status-sold-bg text-status-sold ring-status-sold/25"
                        : "bg-accent-tint text-accent-text ring-accent-text/25",
                    )}
                  >
                    also {titleTypeLabel(type).toLowerCase()}
                  </li>
                ))}
              </ul>
            ) : null}

            <p className="tabular mt-5 text-body text-muted">
              {surveyNumber
                ? `Survey number ${surveyNumber}`
                : "No survey number recorded against this plot yet."}
            </p>
          </div>

          <div className="lg:col-span-7">
            <p className="text-caption text-muted">
              {documents.length > 0
                ? `${documents.length} ${documents.length === 1 ? "document" : "documents"} held`
                : "No documents held"}
            </p>

            {documents.length > 0 ? (
              <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {documents.map((document) => (
                  <li
                    key={document.type}
                    className="flex items-start gap-2.5 text-body text-foreground"
                  >
                    <CheckGlyph
                      className={weak ? "text-status-sold" : "text-accent-text"}
                    />
                    <span>
                      {documentLabels[document.type]}
                      {document.note ? (
                        <span className="ml-2 text-caption text-muted">
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
                <p className="mt-8 text-caption text-muted">Not held on this plot</p>
                <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {missing.map((type) => (
                    <li
                      key={type}
                      className="flex items-start gap-2.5 text-body text-muted"
                    >
                      <DashGlyph />
                      {documentLabels[type]}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <p className="mt-8 max-w-[62ch] text-body text-muted">
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
      className="mt-1 size-4 shrink-0 text-muted"
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
