import { paymentPlanTermsSchema } from "@/lib/validation/listing";
import { formatNaira } from "@/lib/format";

/**
 * Payment plan terms are structured data per listing (architecture §9.4), not
 * prose in a description, so this reads them directly — and so Phase 2's
 * schedule generator can too.
 *
 * The stored JSON is validated rather than trusted: it predates the admin forms
 * and will later be written by a CSV import.
 */
export function PaymentPlan({
  terms,
  price,
}: {
  terms: unknown;
  price: string | number | null;
}) {
  const parsed = paymentPlanTermsSchema.safeParse(terms);
  if (!parsed.success) return null;

  const { depositPercent, durationMonths, frequency, notes } = parsed.data;
  const deposit =
    price === null ? null : (Number(price) * depositPercent) / 100;
  const balance =
    price === null || deposit === null ? null : Number(price) - deposit;

  const instalments = {
    monthly: durationMonths,
    quarterly: Math.ceil(durationMonths / 3),
    biannual: Math.ceil(durationMonths / 6),
  }[frequency];

  return (
    <div className="rounded-card border border-line bg-surface p-6 lg:p-8">
      <p className="text-heading text-foreground">Payment plan</p>

      <ul className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        <li>
          <p className="text-caption text-muted">Deposit</p>
          <p className="tabular mt-1 text-body text-foreground">
            {depositPercent}%
            {deposit === null ? "" : ` · ${formatNaira(deposit)}`}
          </p>
        </li>
        <li>
          <p className="text-caption text-muted">Balance over</p>
          <p className="tabular mt-1 text-body text-foreground">
            {durationMonths} months · {instalments} {frequency} instalments
          </p>
        </li>
        {balance === null ? null : (
          <li>
            <p className="text-caption text-muted">Balance</p>
            <p className="tabular mt-1 text-body text-foreground">
              {formatNaira(balance)}
            </p>
          </li>
        )}
        {balance === null || instalments === undefined ? null : (
          <li>
            <p className="text-caption text-muted">Each instalment</p>
            <p className="tabular mt-1 text-body text-foreground">
              about {formatNaira(balance / instalments)}
            </p>
          </li>
        )}
      </ul>

      {notes ? (
        <p className="mt-6 max-w-[62ch] text-body text-muted">
          {notes}
        </p>
      ) : null}

      <p className="mt-6 text-caption text-muted">
        Indicative only. The schedule is confirmed in writing before any
        payment.
      </p>
    </div>
  );
}
