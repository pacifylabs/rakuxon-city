import type { ReactNode } from "react";
import Link from "next/link";
import { verifySession } from "@/lib/auth/dal";
import {
  getDashboardMetrics,
  getRecentActivity,
  type ActivityEntry,
} from "@/lib/admin/queries/dashboard";
import { cn } from "@/lib/cn";
import { db } from "@/lib/db";
import { ListingModerationStatus, UserRole } from "@/generated/prisma/enums";

export default async function AdminDashboardPage() {
  const user = await verifySession();
  const [metrics, activity, portalCounts] = await Promise.all([
    getDashboardMetrics(user),
    getRecentActivity(user),
    user.role === "ADMIN"
      ? Promise.all([
          db.listing.count({
            where: {
              moderationStatus: ListingModerationStatus.PENDING_REVIEW,
            },
          }),
          db.user.count({
            where: { role: UserRole.LISTER, isActive: true },
          }),
        ]).then(([pendingModeration, activeListers]) => ({
          pendingModeration,
          activeListers,
        }))
      : Promise.resolve(null),
  ]);

  const trackLabel =
    user.role === "SALES" && user.salesTrack && user.salesTrack !== "BOTH"
      ? user.salesTrack === "LAND"
        ? "Land"
        : "Homes"
      : null;

  const listingBase =
    trackLabel === "Homes" ? "/admin/listings/homes" : "/admin/listings/land";

  const firstName = user.name.split(" ")[0];
  const enquiryAttention =
    metrics.enquiries.newCount + metrics.enquiries.unassigned;
  const pendingModeration = portalCounts?.pendingModeration ?? 0;

  const priorities = [
    {
      label: "New enquiries",
      value: metrics.enquiries.newCount,
      href: "/admin/enquiries?status=NEW",
      show: user.role !== "INVESTOR_MANAGER",
    },
    {
      label: "Unassigned",
      value: metrics.enquiries.unassigned,
      href: "/admin/enquiries?unassigned=1",
      show: user.role !== "INVESTOR_MANAGER",
    },
    {
      label: "Awaiting review",
      value: pendingModeration,
      href: "/admin/moderation",
      show: user.role === "ADMIN",
    },
    {
      label: "Draft listings",
      value: metrics.listings.draft,
      href: `${listingBase}?status=DRAFT`,
      show: user.role !== "INVESTOR_MANAGER",
    },
  ].filter((item) => item.show);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-1">
        <p className="text-eyebrow text-muted">
          {trackLabel ? `${trackLabel} track` : "Overview"}
        </p>
        <h1 className="text-balance text-display-m text-foreground sm:text-display-l">
          Hello, {firstName}
        </h1>
        <p className="max-w-prose text-body text-muted">
          {enquiryAttention > 0
            ? `${enquiryAttention} ${enquiryAttention === 1 ? "enquiry needs" : "enquiries need"} a response.`
            : pendingModeration > 0
              ? `${pendingModeration} ${pendingModeration === 1 ? "listing awaits" : "listings await"} moderation.`
              : "Your queue is clear."}
        </p>
      </header>

      <section aria-label="Priority counts">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {priorities.map((item) => (
            <PriorityTile
              key={item.href}
              label={item.label}
              value={item.value}
              href={item.href}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-3">
          {user.role !== "INVESTOR_MANAGER" ? (
            <Panel title="Listings" action={{ href: listingBase, label: "Open" }}>
              <StatRows
                rows={[
                  {
                    label: "Available",
                    value: metrics.listings.available,
                    href: `${listingBase}?status=AVAILABLE`,
                  },
                  {
                    label: "Reserved",
                    value: metrics.listings.reserved,
                    href: `${listingBase}?status=RESERVED`,
                  },
                  {
                    label: "Sold",
                    value: metrics.listings.sold,
                    href: `${listingBase}?status=SOLD`,
                  },
                  {
                    label: "Draft",
                    value: metrics.listings.draft,
                    href: `${listingBase}?status=DRAFT`,
                    emphasize: metrics.listings.draft > 0,
                  },
                ]}
              />
            </Panel>
          ) : null}

          {user.role !== "INVESTOR_MANAGER" ? (
            <Panel
              title="Enquiries"
              action={{ href: "/admin/enquiries", label: "Inbox" }}
            >
              <StatRows
                rows={[
                  {
                    label: "New",
                    value: metrics.enquiries.newCount,
                    href: "/admin/enquiries?status=NEW",
                    emphasize: metrics.enquiries.newCount > 0,
                  },
                  {
                    label: "Unassigned",
                    value: metrics.enquiries.unassigned,
                    href: "/admin/enquiries?unassigned=1",
                    emphasize: metrics.enquiries.unassigned > 0,
                  },
                  ...(!trackLabel
                    ? [
                        {
                          label: "Land track",
                          value: metrics.enquiries.byTrack.land,
                        },
                        {
                          label: "Homes track",
                          value: metrics.enquiries.byTrack.homes,
                        },
                      ]
                    : []),
                ]}
              />
            </Panel>
          ) : null}

          {user.role === "ADMIN" && portalCounts ? (
            <Panel
              title="Lister portal"
              action={{ href: "/admin/moderation", label: "Moderation" }}
            >
              <StatRows
                rows={[
                  {
                    label: "Pending review",
                    value: portalCounts.pendingModeration,
                    href: "/admin/moderation",
                    emphasize: portalCounts.pendingModeration > 0,
                  },
                  {
                    label: "Active listers",
                    value: portalCounts.activeListers,
                    href: "/admin/listers",
                  },
                ]}
              />
            </Panel>
          ) : null}

          {user.role === "ADMIN" ? (
            <Panel title="Estates" action={{ href: "/admin/estates", label: "Manage" }}>
              <StatRows
                rows={[
                  { label: "Active", value: metrics.estates.active },
                  { label: "Sold out", value: metrics.estates.soldOut },
                  { label: "Delivered", value: metrics.estates.delivered },
                  { label: "Total", value: metrics.estates.total },
                ]}
              />
            </Panel>
          ) : null}
        </div>

        <aside className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <QuickActions user={user} trackLabel={trackLabel} />
          <ActivityFeed entries={activity} />
        </aside>
      </div>
    </div>
  );
}

function PriorityTile({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  const hot = value > 0;
  return (
    <Link
      href={href}
      className={cn(
        "rounded-card border px-4 py-4 transition-colors sm:px-5 sm:py-5",
        hot
          ? "border-accent-hover/40 bg-accent-tint/50 hover:border-accent-text/30"
          : "border-line bg-surface hover:border-muted",
      )}
    >
      <p className="text-caption text-muted">{label}</p>
      <p
        className={cn(
          "tabular mt-1 text-display-m sm:text-display-l",
          hot ? "text-accent-text" : "text-foreground",
        )}
      >
        {value}
      </p>
    </Link>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <section className="rounded-card border border-line bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <h2 className="text-body font-medium text-foreground">{title}</h2>
        {action ? (
          <Link
            href={action.href}
            className="shrink-0 text-caption text-accent-text underline-offset-4 hover:underline"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
      <div className="px-4 py-1 sm:px-5">{children}</div>
    </section>
  );
}

function StatRows({
  rows,
}: {
  rows: {
    label: string;
    value: number;
    href?: string;
    emphasize?: boolean;
  }[];
}) {
  return (
    <ul className="divide-y divide-line">
      {rows.map((row) => {
        const inner = (
          <>
            <span className="text-body text-muted">{row.label}</span>
            <span
              className={cn(
                "tabular text-body font-medium",
                row.emphasize ? "text-accent-text" : "text-foreground",
              )}
            >
              {row.value}
            </span>
          </>
        );

        return (
          <li key={row.label}>
            {row.href ? (
              <Link
                href={row.href}
                className="flex items-center justify-between gap-4 py-3 transition-colors hover:text-accent-text"
              >
                {inner}
              </Link>
            ) : (
              <div className="flex items-center justify-between gap-4 py-3">
                {inner}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function QuickActions({
  user,
  trackLabel,
}: {
  user: { role: string };
  trackLabel: string | null;
}) {
  const primary: { href: string; label: string; description: string }[] = [];

  if (user.role !== "INVESTOR_MANAGER") {
    if (trackLabel !== "Homes") {
      primary.push({
        href: "/admin/enquiries",
        label: "Enquiries inbox",
        description: "Reply and assign leads",
      });
    }
    if (user.role === "ADMIN") {
      primary.push({
        href: "/admin/moderation",
        label: "Moderation queue",
        description: "Approve lister submissions",
      });
    }
    if (trackLabel !== "Homes") {
      primary.push({
        href: "/admin/listings/land/new",
        label: "Add land listing",
        description: "New plot on the site",
      });
    }
    if (trackLabel !== "Land") {
      primary.push({
        href: "/admin/listings/homes/new",
        label: "Add home listing",
        description: "New home on the site",
      });
    }
  }

  const secondary: { href: string; label: string }[] = [];
  if (user.role === "ADMIN") {
    secondary.push(
      { href: "/admin/listers", label: "Listers" },
      { href: "/admin/estates/new", label: "New estate" },
      { href: "/admin/articles/new", label: "New guide" },
      { href: "/admin/import", label: "Import CSV" },
    );
  }

  if (primary.length === 0 && secondary.length === 0) return null;

  return (
    <section className="rounded-card border border-line bg-surface p-4 sm:p-5">
      <h2 className="text-body font-medium text-foreground">Shortcuts</h2>
      {primary.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2">
          {primary.map((action) => (
            <li key={action.href}>
              <Link
                href={action.href}
                className="block rounded-control border border-line px-3 py-2.5 transition-colors hover:border-muted hover:bg-surface-muted"
              >
                <span className="block text-body text-foreground">{action.label}</span>
                <span className="block text-caption text-muted">
                  {action.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {secondary.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-1 border-t border-line pt-4">
          {secondary.map((action) => (
            <li key={action.href}>
              <Link
                href={action.href}
                className="flex min-h-9 items-center text-caption text-accent-text underline-offset-4 hover:underline"
              >
                {action.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  return (
    <section className="rounded-card border border-line bg-surface p-4 sm:p-5">
      <h2 className="text-body font-medium text-foreground">Recent activity</h2>

      {entries.length === 0 ? (
        <p className="mt-3 text-caption text-muted">
          Status changes, enquiries and notes will show up here.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-0">
          {entries.map((entry, index) => (
            <li
              key={entry.id}
              className={cn(
                "relative border-l border-line py-3 pl-4",
                index === 0 && "pt-0",
              )}
            >
              <p className="truncate text-body text-foreground">{entry.summary}</p>
              {entry.detail ? (
                <p className="truncate text-caption text-muted">{entry.detail}</p>
              ) : null}
              <p className="mt-1 text-[11px] text-muted">
                {entry.kind === "enquiry"
                  ? "Enquiry"
                  : entry.kind === "status"
                    ? "Status"
                    : "Note"}
                {entry.actor ? ` · ${entry.actor}` : ""}
                {" · "}
                {new Date(entry.at).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
