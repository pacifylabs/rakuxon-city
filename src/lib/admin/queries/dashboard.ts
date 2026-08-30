import "server-only";
import { db } from "@/lib/db";
import {
  ListingStatus,
  ListingType,
  EstateStatus,
  EnquiryStatus,
} from "@/generated/prisma/enums";
import type { SessionUser } from "@/lib/auth/session";

export type ActivityEntry = {
  id: string;
  kind: "status" | "enquiry" | "note";
  summary: string;
  detail: string | null;
  actor: string | null;
  at: string;
};

export type DashboardMetrics = {
  enquiries: {
    newCount: number;
    unassigned: number;
    byTrack: { land: number; homes: number };
  };
  listings: {
    total: number;
    available: number;
    reserved: number;
    sold: number;
    draft: number;
    byType: { land: number; homes: number };
  };
  estates: {
    total: number;
    active: number;
    soldOut: number;
    delivered: number;
  };
};

const CACHE_KEY_PREFIX = "dashboard-metrics";
/** Per docs/PHASE_7_ADMIN_DASHBOARD.md — "cached 1-3 min". Middle of that range. */
const CACHE_TTL_MS = 2 * 60 * 1000;

/**
 * Track-scoped, per FR-M1.4 and the access matrix: a land-track sales user's
 * dashboard counts land stock and land enquiries, never the other track's.
 * `null` means "no scoping" — admin and a both-tracks sales user.
 */
function trackScope(user: SessionUser): "LAND" | "HOMES" | null {
  if (user.role !== "SALES") return null;
  if (user.salesTrack === "LAND") return "LAND";
  if (user.salesTrack === "HOMES") return "HOMES";
  return null; // BOTH
}

/**
 * Cached via the `MetricsCache` table rather than in-memory, so the cache is
 * shared across server instances and survives a redeploy — an in-memory
 * cache would just mean every instance recomputes on its own first request.
 * Keyed by scope, since a land-track sales user and the admin must never
 * share a cached result.
 */
export async function getDashboardMetrics(
  user: SessionUser,
): Promise<DashboardMetrics> {
  const scope = trackScope(user);
  const cacheKey = `${CACHE_KEY_PREFIX}:${scope ?? "all"}`;

  const cached = await db.metricsCache.findUnique({ where: { key: cacheKey } });
  if (cached && cached.expiresAt > new Date()) {
    return cached.data as unknown as DashboardMetrics;
  }

  const metrics = await computeMetrics(scope);

  await db.metricsCache.upsert({
    where: { key: cacheKey },
    create: {
      key: cacheKey,
      data: metrics,
      expiresAt: new Date(Date.now() + CACHE_TTL_MS),
    },
    update: {
      data: metrics,
      expiresAt: new Date(Date.now() + CACHE_TTL_MS),
    },
  });

  return metrics;
}

async function computeMetrics(
  scope: "LAND" | "HOMES" | null,
): Promise<DashboardMetrics> {
  const listingTypeFilter = scope
    ? { type: scope === "LAND" ? ListingType.LAND : ListingType.HOME }
    : {};
  const enquiryTrackFilter = scope
    ? { track: scope === "LAND" ? ("LAND" as const) : ("HOMES" as const) }
    : {};

  const [
    enquiryNew,
    enquiryUnassigned,
    enquiryLand,
    enquiryHomes,
    listingTotal,
    listingAvailable,
    listingReserved,
    listingSold,
    listingDraft,
    listingLand,
    listingHomes,
    estateTotal,
    estateActive,
    estateSoldOut,
    estateDelivered,
  ] = await Promise.all([
    db.enquiry.count({
      where: { status: EnquiryStatus.NEW, ...enquiryTrackFilter },
    }),
    db.enquiry.count({
      where: { assignedToUserId: null, ...enquiryTrackFilter },
    }),
    // Track counts ignore `scope` deliberately — they're the breakdown a
    // both-tracks/admin view wants; a single-track user's UI just won't
    // render the side that's always zero for them.
    db.enquiry.count({ where: { track: "LAND" } }),
    db.enquiry.count({ where: { track: "HOMES" } }),
    db.listing.count({
      where: { status: { not: ListingStatus.DRAFT }, ...listingTypeFilter },
    }),
    db.listing.count({
      where: { status: ListingStatus.AVAILABLE, ...listingTypeFilter },
    }),
    db.listing.count({
      where: { status: ListingStatus.RESERVED, ...listingTypeFilter },
    }),
    db.listing.count({
      where: { status: ListingStatus.SOLD, ...listingTypeFilter },
    }),
    db.listing.count({
      where: { status: ListingStatus.DRAFT, ...listingTypeFilter },
    }),
    db.listing.count({ where: { type: ListingType.LAND } }),
    db.listing.count({ where: { type: ListingType.HOME } }),
    db.estate.count(),
    db.estate.count({ where: { status: EstateStatus.ACTIVE } }),
    db.estate.count({ where: { status: EstateStatus.SOLD_OUT } }),
    db.estate.count({ where: { status: EstateStatus.DELIVERED } }),
  ]);

  return {
    enquiries: {
      newCount: enquiryNew,
      unassigned: enquiryUnassigned,
      byTrack: { land: enquiryLand, homes: enquiryHomes },
    },
    listings: {
      total: listingTotal,
      available: listingAvailable,
      reserved: listingReserved,
      sold: listingSold,
      draft: listingDraft,
      byType: { land: listingLand, homes: listingHomes },
    },
    estates: {
      total: estateTotal,
      active: estateActive,
      soldOut: estateSoldOut,
      delivered: estateDelivered,
    },
  };
}

/**
 * The activity feed — docs/PHASE_7_ADMIN_DASHBOARD.md §3, "last 10 actions".
 *
 * Three real event sources merged rather than a synthetic audit table: status
 * changes, incoming enquiries, and internal notes. Each is already recorded
 * for its own reasons, so this needs no new writes and cannot drift from what
 * actually happened.
 *
 * Deliberately NOT cached with the metrics: a two-minute-stale count is fine,
 * a two-minute-stale "what just happened" is the one thing on this page that
 * should be current.
 */
export async function getRecentActivity(
  user: SessionUser,
  take = 8,
): Promise<ActivityEntry[]> {
  const scope = trackScope(user);
  const enquiryTrack = scope
    ? scope === "LAND"
      ? ("LAND" as const)
      : ("HOMES" as const)
    : undefined;

  const [statusChanges, enquiries, notes] = await Promise.all([
    db.statusChange.findMany({
      where: scope
        ? { listing: { type: scope === "LAND" ? ListingType.LAND : ListingType.HOME } }
        : {},
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        fromStatus: true,
        toStatus: true,
        createdAt: true,
        listing: { select: { reference: true, title: true } },
        changedByUser: { select: { name: true } },
      },
    }),
    db.enquiry.findMany({
      where: enquiryTrack
        ? { OR: [{ track: enquiryTrack }, { track: null }] }
        : {},
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        name: true,
        createdAt: true,
        listing: { select: { reference: true } },
      },
    }),
    db.internalNote.findMany({
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        body: true,
        createdAt: true,
        author: { select: { name: true } },
        enquiry: { select: { name: true } },
      },
    }),
  ]);

  const entries: ActivityEntry[] = [
    ...statusChanges.map((change) => ({
      id: `status-${change.id}`,
      kind: "status" as const,
      summary: `${change.listing.reference} → ${change.toStatus.toLowerCase()}`,
      detail: change.listing.title,
      actor: change.changedByUser?.name ?? null,
      at: change.createdAt.toISOString(),
    })),
    ...enquiries.map((enquiry) => ({
      id: `enquiry-${enquiry.id}`,
      kind: "enquiry" as const,
      summary: `New enquiry from ${enquiry.name}`,
      detail: enquiry.listing?.reference ?? null,
      actor: null,
      at: enquiry.createdAt.toISOString(),
    })),
    ...notes.map((note) => ({
      id: `note-${note.id}`,
      kind: "note" as const,
      summary: note.enquiry
        ? `Note on ${note.enquiry.name}`
        : "Note added",
      detail: note.body.slice(0, 80),
      actor: note.author?.name ?? null,
      at: note.createdAt.toISOString(),
    })),
  ];

  return entries
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, take);
}
