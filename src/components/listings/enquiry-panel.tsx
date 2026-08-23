import { ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/ui/price-display";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import type { ListingStatus } from "@/generated/prisma/enums";

/**
 * FR-1.9 — sticky, and pre-filled with the listing reference so an enquiry
 * arrives with context attached rather than as "I saw a plot on your site".
 *
 * FR-1.6 — a sold listing keeps its page and its badge, but the enquiry action
 * is replaced. Inviting someone to enquire about a plot that is gone wastes
 * their time and ours.
 */
export function EnquiryPanel({
  reference,
  price,
  priceOnRequest,
  status,
  action,
}: {
  reference: string;
  price: string | number | null;
  priceOnRequest: boolean;
  status: ListingStatus;
  action: string;
}) {
  const sold = status === "SOLD";

  return (
    <div className="lg:sticky lg:top-8">
      <div className="rounded-card border border-hairline bg-surface p-6">
        <div className="flex items-start justify-between gap-4">
          <PriceDisplay
            price={price}
            priceOnRequest={priceOnRequest}
            size="detail"
          />
          <StatusBadge status={status} />
        </div>

        <p className="tabular mt-3 text-caption text-ink-muted">
          Reference {reference}
        </p>

        <div className="mt-6 border-t border-hairline pt-6">
          {sold ? (
            <>
              <p className="text-heading text-ink">This one has been sold</p>
              <p className="mt-3 text-body text-ink-secondary">
                We have kept the page up because stock that moves is the
                clearest evidence an estate is real. Tell us what you are
                looking for and we will let you know when something comparable
                comes up.
              </p>
              <div className="mt-6">
                <ButtonLink href="/contact">
                  Notify me of similar listings
                </ButtonLink>
              </div>
            </>
          ) : (
            <>
              <p className="text-heading text-ink">{action}</p>
              <div className="mt-5">
                <EnquiryForm listingReference={reference} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
