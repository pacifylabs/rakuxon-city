import { cn } from "@/lib/cn";

/**
 * What happens after an enquiry, on the listing page rather than buried in a
 * guide.
 *
 * It fills the detail page's left column, which ran short against the tall
 * enquiry panel beside it — the gap the client marked. But it earns the space
 * on its own: this site's whole position is that the process is stated up
 * front, and "what happens after I press send" is the question every enquiry
 * form raises and most sites leave unanswered.
 *
 * Deliberately not a payment schedule. FR-1.7's plan terms are already rendered
 * by `PaymentPlan` where they apply, and repeating them here would let the two
 * drift apart.
 */
const steps = [
  {
    title: "You enquire",
    body: "Tell us which plot and when you would like to see it. No payment is involved at this stage, and none is asked for.",
  },
  {
    title: "We send the documents",
    body: "Copies of everything we hold on the plot — the title, the survey, the layout approval — before you visit, not after.",
  },
  {
    title: "You inspect",
    body: "A member of the team walks the boundaries with you on site. Bring your own surveyor or lawyer if you would rather.",
  },
  {
    title: "You verify, then decide",
    body: "Run your own search at the state land registry. We would encourage it. Nothing is reserved until you say so in writing.",
  },
];

export function BuyingSteps({
  noun,
  className,
}: {
  /** "plot" or "home", so the copy reads naturally on either track. */
  noun: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-card border border-hairline p-6 lg:p-8",
        className,
      )}
    >
      <h2 className="text-heading text-ink">How buying this {noun} works</h2>
      <p className="mt-3 max-w-[54ch] text-body text-ink-secondary">
        Four steps, in this order. We do not take money before the third one.
      </p>

      <ol className="mt-8 grid gap-6 sm:grid-cols-2">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span
              aria-hidden="true"
              className="tabular shrink-0 text-caption text-accent"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="text-body text-ink">{step.title}</p>
              <p className="mt-2 text-caption text-ink-secondary">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
