import Link from "next/link";
import { verifyPortalSession } from "@/lib/portal/access";
import { countListerDashboard } from "@/lib/portal/queries/listings";

export default async function PortalDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string }>;
}) {
  const user = await verifyPortalSession();
  const counts = await countListerDashboard(user.id);
  const { verified } = await searchParams;

  return (
    <div className="space-y-8">
      {verified === "1" ? (
        <p
          role="status"
          className="rounded-card border border-line bg-surface-muted px-4 py-3 text-body text-foreground"
        >
          Your email is confirmed. You can add listings and submit them for review.
        </p>
      ) : null}

      <div>
        <h1 className="text-display-m text-foreground sm:text-display-l">
          Hello, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-2 max-w-prose text-body text-muted">
          Add a land or home listing, save it as a draft, then submit for review.
          Approved listings appear on the public site; we notify you here and by
          email when something changes.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat label="Draft / needs work" value={counts.draft} />
        <Stat label="Awaiting review" value={counts.pending} />
        <Stat label="Live on site" value={counts.approved} />
        <Stat label="Rejected" value={counts.rejected} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
        <Link
          href="/portal/listings/new"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-body text-ivory-light hover:bg-primary-hover"
        >
          Add a listing
        </Link>
        <Link
          href="/portal/listings"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-6 text-body text-foreground hover:bg-surface-muted"
        >
          View all listings
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-line bg-surface p-4 sm:p-5">
      <p className="text-display-s text-foreground tabular-nums">{value}</p>
      <p className="mt-1 text-caption leading-snug text-muted">{label}</p>
    </div>
  );
}
