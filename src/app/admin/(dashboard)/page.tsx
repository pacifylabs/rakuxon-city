import Link from "next/link";
import { verifySession } from "@/lib/auth/dal";
import {
  getDashboardMetrics,
  getRecentActivity,
  type ActivityEntry,
} from "@/lib/admin/queries/dashboard";
import { cn } from "@/lib/cn";

/**
 * `/admin` — the dashboard.
 *
 * Rebuilt from the flat grid of identical cards it was, which gave a sold
 * listing the same visual weight as an unanswered enquiry and left most of
 * the screen empty. Three changes:
 *
 *   - Enquiries lead, because they are the only thing here that decays. A
 *     listing that sits unedited is fine; an enquiry that sits unanswered is
 *     a lost sale, so "New" and "Unassigned" get the largest treatment and a
 *     link straight into the filtered inbox.
 *   - Every figure is now a link to the view that shows those exact rows.
 *     A dashboard number you cannot click is a number you have to go and
 *     find again.
 *   - Recent activity and quick actions fill the right column —
 *     docs/PHASE_7_ADMIN_DASHBOARD.md §3 asked for both and neither existed.
 */
export default async function AdminDashboardPage() {
  const user = await verifySession();
  const [metrics, activity] = await Promise.all([
    getDashboardMetrics(user),
    getRecentActivity(user),
  ]);

  const trackLabel =
    user.role === "SALES" && user.salesTrack && user.salesTrack !== "BOTH"
      ? user.salesTrack === "LAND"
        ? "Land"
        : "Homes"
      : null;

  const firstName = user.name.split(" ")[0];
  const needsAttention =
    metrics.enquiries.newCount + metrics.enquiries.unassigned;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow text-muted">
            {trackLabel ? `${trackLabel} track` : "All stock"}
          </p>
          <h1 className="mt-1 text-balance text-display-m text-foreground">
            Good to see you, {firstName}
          </h1>
          <p className="mt-2 text-body text-muted">
            {needsAttention > 0
              ? `${needsAttention} ${needsAttention === 1 ? "enquiry needs" : "enquiries need"} attention.`
              : "Nothing is waiting on you right now."}
          </p>
        </div>
      </div>

      {/*
        `min-w-0` on both columns is load-bearing, not decoration.

        A grid item defaults to `min-width: auto`, which means it refuses to
        shrink below its content's intrinsic minimum — so a long activity
        entry or an unbreakable label pushed this column to 432px inside a
        375px viewport and the whole dashboard scrolled sideways on a phone.
        `min-w-0` lets the track actually honour the viewport, and the
        truncation already on the activity rows handles the overflow.
      */}
      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-2">
          {/* Enquiries lead — the only figures here that decay. */}
          <section className="min-w-0">
            <SectionHead
              title="Enquiries"
              href="/admin/enquiries"
              linkLabel="Open inbox"
            />
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
              <BigStat
                label="New"
                value={metrics.enquiries.newCount}
                href="/admin/enquiries?status=NEW"
                tone={metrics.enquiries.newCount > 0 ? "attention" : "quiet"}
              />
              <BigStat
                label="Unassigned"
                value={metrics.enquiries.unassigned}
                href="/admin/enquiries?unassigned=1"
                tone={metrics.enquiries.unassigned > 0 ? "attention" : "quiet"}
              />
            </div>
            {!trackLabel ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
                <SmallStat
                  label="Land enquiries"
                  value={metrics.enquiries.byTrack.land}
                />
                <SmallStat
                  label="Home enquiries"
                  value={metrics.enquiries.byTrack.homes}
                />
              </div>
            ) : null}
          </section>

          <section className="min-w-0">
            <SectionHead
              title="Listings"
              href={
                trackLabel === "Homes"
                  ? "/admin/listings/homes"
                  : "/admin/listings/land"
              }
              linkLabel="Manage"
            />
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <SmallStat
                label="Available"
                value={metrics.listings.available}
                href={`/admin/listings/${trackLabel === "Homes" ? "homes" : "land"}?status=AVAILABLE`}
              />
              <SmallStat
                label="Reserved"
                value={metrics.listings.reserved}
                href={`/admin/listings/${trackLabel === "Homes" ? "homes" : "land"}?status=RESERVED`}
              />
              <SmallStat
                label="Sold"
                value={metrics.listings.sold}
                href={`/admin/listings/${trackLabel === "Homes" ? "homes" : "land"}?status=SOLD`}
              />
              <SmallStat
                label="Draft"
                value={metrics.listings.draft}
                href={`/admin/listings/${trackLabel === "Homes" ? "homes" : "land"}?status=DRAFT`}
                tone={metrics.listings.draft > 0 ? "attention" : "quiet"}
              />
            </div>
          </section>

          {user.role !== "INVESTOR_MANAGER" ? (
            <section className="min-w-0">
              <SectionHead
                title="Estates"
                href="/admin/estates"
                linkLabel="Manage"
              />
              <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <SmallStat label="Active" value={metrics.estates.active} />
                <SmallStat label="Sold out" value={metrics.estates.soldOut} />
                <SmallStat label="Delivered" value={metrics.estates.delivered} />
                <SmallStat label="Total" value={metrics.estates.total} />
              </div>
            </section>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <QuickActions user={user} trackLabel={trackLabel} />
          <ActivityFeed entries={activity} />
        </div>
      </div>
    </div>
  );
}

function SectionHead({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h2 className="text-heading text-foreground">{title}</h2>
      <Link
        href={href}
        className="shrink-0 text-caption text-accent-text underline-offset-4 hover:underline"
      >
        {linkLabel}
      </Link>
    </div>
  );
}

function BigStat({
  label,
  value,
  href,
  tone,
}: {
  label: string;
  value: number;
  href: string;
  tone: "attention" | "quiet";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-card border p-5 transition-colors",
        tone === "attention"
          ? "border-accent-hover bg-accent-tint hover:border-accent-text"
          : "border-line bg-surface hover:border-muted",
      )}
    >
      <p
        className={cn(
          "text-caption",
          tone === "attention" ? "text-accent-text" : "text-muted",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "tabular mt-2 text-display-m sm:text-display-l",
          tone === "attention" ? "text-accent-text" : "text-foreground",
        )}
      >
        {value}
      </p>
    </Link>
  );
}

function SmallStat({
  label,
  value,
  href,
  tone = "quiet",
}: {
  label: string;
  value: number;
  href?: string;
  tone?: "attention" | "quiet";
}) {
  const body = (
    <>
      <p className="text-caption text-muted">{label}</p>
      <p
        className={cn(
          "tabular mt-1 text-display-m",
          tone === "attention" ? "text-accent-text" : "text-foreground",
        )}
      >
        {value}
      </p>
    </>
  );

  const className = cn(
    "block rounded-card border border-line bg-surface p-4 transition-colors",
    href && "hover:border-muted",
  );

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

function QuickActions({
  user,
  trackLabel,
}: {
  user: { role: string };
  trackLabel: string | null;
}) {
  const actions: { href: string; label: string }[] = [];

  if (trackLabel !== "Homes") {
    actions.push({ href: "/admin/listings/land/new", label: "New plot" });
  }
  if (trackLabel !== "Land") {
    actions.push({ href: "/admin/listings/homes/new", label: "New home" });
  }
  if (user.role === "ADMIN") {
    actions.push({ href: "/admin/estates/new", label: "New estate" });
    actions.push({ href: "/admin/articles/new", label: "New guide" });
    actions.push({ href: "/admin/import", label: "Import a CSV" });
  }

  if (actions.length === 0) return null;

  return (
    <section className="rounded-card border border-line bg-surface p-5">
      <h2 className="text-heading text-foreground">Quick actions</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="inline-flex min-h-10 items-center rounded-full border border-line px-4 text-caption text-foreground transition-colors hover:border-muted hover:bg-surface-muted"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

const ACTIVITY_TONE: Record<ActivityEntry["kind"], string> = {
  status: "bg-status-reserved-bg text-status-reserved",
  enquiry: "bg-accent-tint text-accent-text",
  note: "bg-surface-muted text-muted",
};

const ACTIVITY_LABEL: Record<ActivityEntry["kind"], string> = {
  status: "Status",
  enquiry: "Enquiry",
  note: "Note",
};

function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  return (
    <section className="rounded-card border border-line bg-surface p-5">
      <h2 className="text-heading text-foreground">Recent activity</h2>

      {entries.length === 0 ? (
        <p className="mt-3 text-caption text-muted">
          Nothing has happened yet. Status changes, enquiries and notes appear
          here.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-4">
          {entries.map((entry) => (
            <li key={entry.id} className="flex gap-3">
              <span
                className={cn(
                  "mt-0.5 h-fit shrink-0 rounded-full px-2 py-0.5 text-caption",
                  ACTIVITY_TONE[entry.kind],
                )}
              >
                {ACTIVITY_LABEL[entry.kind]}
              </span>
              <div className="min-w-0">
                <p className="truncate text-body text-foreground">
                  {entry.summary}
                </p>
                {entry.detail ? (
                  <p className="truncate text-caption text-muted">
                    {entry.detail}
                  </p>
                ) : null}
                <p className="text-caption text-muted">
                  {entry.actor ? `${entry.actor} · ` : ""}
                  {new Date(entry.at).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
