import Link from "next/link";
import { verifyPortalSession } from "@/lib/portal/access";
import { countListerDashboard } from "@/lib/portal/queries/listings";

export default async function PortalDashboardPage() {
  const user = await verifyPortalSession();
  const counts = await countListerDashboard(user.id);

  return (
    <div>
      <h1 className="text-display-m text-foreground">Hello, {user.name}</h1>
      <p className="mt-2 max-w-prose text-body text-muted">
        Add a land or home listing, save it as a draft, then submit for review.
        Approved listings appear on the public site and enquiries are copied to
        your email.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Draft / needs work" value={counts.draft} />
        <Stat label="Awaiting review" value={counts.pending} />
        <Stat label="Live on site" value={counts.approved} />
        <Stat label="Rejected" value={counts.rejected} />
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/portal/listings/new"
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-body text-ivory-light hover:bg-primary-hover"
        >
          Add a listing
        </Link>
        <Link
          href="/portal/listings"
          className="inline-flex min-h-11 items-center rounded-full border border-line px-6 text-body text-foreground hover:bg-surface-muted"
        >
          View all listings
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-line bg-surface p-5">
      <p className="text-display-s text-foreground">{value}</p>
      <p className="mt-1 text-caption text-muted">{label}</p>
    </div>
  );
}
