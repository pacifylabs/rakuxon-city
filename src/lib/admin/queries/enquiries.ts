import "server-only";
import { db } from "@/lib/db";
import { EnquiryStatus, ListingType } from "@/generated/prisma/enums";
import type { SessionUser } from "@/lib/auth/session";
import { trackFor } from "@/lib/admin/access";
import { ADMIN_PAGE_SIZE } from "@/lib/admin/queries/listings";

export type EnquiryFilters = {
  status?: EnquiryStatus;
  assignedToUserId?: string;
  unassigned?: boolean;
  q?: string;
  page: number;
};

/**
 * Track scoping for enquiries.
 *
 * This is the specific thing 03_IMPLEMENTATION_PLAN.md Phase 7 asks to be
 * verified: "a land-track sales user cannot reach homes enquiries by URL
 * manipulation." The filter is applied in the `where` clause, so a scoped
 * user's query cannot return another track's row even if the id is guessed —
 * there is no post-filter to forget.
 *
 * Enquiries with a null track (a general contact-form enquiry that names no
 * listing) are visible to a scoped user too: they belong to nobody in
 * particular, and hiding them from every sales user would mean nobody sees
 * them at all.
 */
function trackWhere(user: SessionUser) {
  const scope = trackFor(user);
  if (scope === null) return {};
  return {
    OR: [
      {
        track:
          scope === ListingType.LAND ? ("LAND" as const) : ("HOMES" as const),
      },
      { track: null },
    ],
  };
}

export async function listEnquiries(
  user: SessionUser,
  filters: EnquiryFilters,
) {
  const where = {
    ...trackWhere(user),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.unassigned ? { assignedToUserId: null } : {}),
    ...(filters.assignedToUserId
      ? { assignedToUserId: filters.assignedToUserId }
      : {}),
    ...(filters.q
      ? {
          AND: [
            {
              OR: [
                { name: { contains: filters.q, mode: "insensitive" as const } },
                {
                  email: { contains: filters.q, mode: "insensitive" as const },
                },
                {
                  phone: { contains: filters.q, mode: "insensitive" as const },
                },
              ],
            },
          ],
        }
      : {}),
  };

  // Concurrent, not sequential — see the note in queries/listings.ts.
  const requestedPage = Math.max(1, filters.page);
  const [total, rows] = await Promise.all([
    db.enquiry.count({ where }),
    db.enquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (requestedPage - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        source: true,
        track: true,
        status: true,
        createdAt: true,
        listing: { select: { reference: true, title: true } },
        assignedTo: { select: { name: true } },
      },
    }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const page = Math.min(requestedPage, pageCount);

  return { rows, total, page, pageCount };
}

/** Detail view. Returns null for another track's enquiry — same as missing. */
export async function getEnquiry(user: SessionUser, id: string) {
  const enquiry = await db.enquiry.findUnique({
    where: { id },
    include: {
      listing: {
        select: { id: true, reference: true, title: true, type: true },
      },
      assignedTo: { select: { id: true, name: true } },
      internalNotes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true } } },
      },
    },
  });

  if (!enquiry) return null;

  const scope = trackFor(user);
  if (scope !== null && enquiry.track !== null) {
    const enquiryTrack =
      enquiry.track === "LAND" ? ListingType.LAND : ListingType.HOME;
    if (enquiryTrack !== scope) return null;
  }

  return enquiry;
}

/** Sales staff an enquiry can be assigned to. */
export async function getAssignableUsers() {
  return db.user.findMany({
    where: { isActive: true, role: { in: ["ADMIN", "SALES"] } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, role: true, salesTrack: true },
  });
}

/** Investor enquiries — a separate table, a separate permission, no track. */
export async function listInvestorEnquiries(filters: {
  q?: string;
  page: number;
}) {
  const where = filters.q
    ? {
        OR: [
          { name: { contains: filters.q, mode: "insensitive" as const } },
          { email: { contains: filters.q, mode: "insensitive" as const } },
          {
            organisation: { contains: filters.q, mode: "insensitive" as const },
          },
        ],
      }
    : {};

  const requestedPage = Math.max(1, filters.page);
  const [total, rows] = await Promise.all([
    db.investorEnquiry.count({ where }),
    db.investorEnquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (requestedPage - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const page = Math.min(requestedPage, pageCount);

  return { rows, total, page, pageCount };
}

export async function getInvestorEnquiry(id: string) {
  return db.investorEnquiry.findUnique({
    where: { id },
    include: {
      internalNotes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true } } },
      },
    },
  });
}
