import {
  EnquiryTrack,
  ListingType,
  SalesTrack,
} from "@/generated/prisma/enums";

/**
 * FR-3.3 — deciding which sales user an enquiry belongs to.
 *
 * The implementation plan calls this "the piece most likely to break silently",
 * and it is right: routing failures do not throw. An enquiry lands unassigned,
 * or lands on the wrong desk, and nobody notices until a buyer complains that
 * nobody called back. So the decision is pure and separated from the database
 * work, and it is covered by tests in routing.test.ts.
 *
 * Two rules:
 *
 *   1. The track comes from the LISTING, not from the form. A visitor cannot
 *      choose which desk they reach, and a general enquiry with no listing has
 *      no track at all — it stays unassigned and is visible to every sales
 *      user, which is what FR-3.3 asks for.
 *   2. Assignment is round-robin among eligible users, where eligible means
 *      active AND on a matching track (or on BOTH).
 */

/** FR-3.3 — derived, never taken from the request body. */
export function trackForListingType(
  type: ListingType | null | undefined,
): EnquiryTrack | null {
  if (type === ListingType.LAND) return EnquiryTrack.LAND;
  if (type === ListingType.HOME) return EnquiryTrack.HOMES;
  return null;
}

export type RoutableUser = {
  id: string;
  salesTrack: SalesTrack | null;
  isActive: boolean;
};

/** Active, and on this track or on both. */
export function eligibleUsers<T extends RoutableUser>(
  users: T[],
  track: EnquiryTrack | null,
): T[] {
  if (track === null) return [];

  const wanted =
    track === EnquiryTrack.LAND ? SalesTrack.LAND : SalesTrack.HOMES;

  return users.filter(
    (user) =>
      user.isActive &&
      (user.salesTrack === wanted || user.salesTrack === SalesTrack.BOTH),
  );
}

/**
 * Round-robin, driven by how many enquiries each eligible user already holds.
 *
 * A counter column or a stored cursor would drift the moment a user is
 * deactivated or added, so the position is derived from state that is already
 * true: the fewest open enquiries wins. Ties break on user id, which makes the
 * result deterministic and therefore testable — without that, two enquiries
 * arriving together could both pick the same "first" user by accident of
 * iteration order.
 */
export function selectAssignee<T extends RoutableUser>(
  users: T[],
  track: EnquiryTrack | null,
  openCounts: Map<string, number>,
): T | null {
  const eligible = eligibleUsers(users, track);
  if (eligible.length === 0) return null;

  return eligible.reduce((best, candidate) => {
    const bestCount = openCounts.get(best.id) ?? 0;
    const candidateCount = openCounts.get(candidate.id) ?? 0;
    if (candidateCount !== bestCount) {
      return candidateCount < bestCount ? candidate : best;
    }
    return candidate.id < best.id ? candidate : best;
  });
}
