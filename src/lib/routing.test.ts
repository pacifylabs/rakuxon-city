import { describe, expect, it } from "vitest";
import {
  EnquiryTrack,
  ListingType,
  SalesTrack,
} from "@/generated/prisma/enums";
import {
  eligibleUsers,
  selectAssignee,
  trackForListingType,
  type RoutableUser,
} from "@/lib/routing";

const user = (
  id: string,
  salesTrack: SalesTrack | null,
  isActive = true,
): RoutableUser => ({ id, salesTrack, isActive });

describe("trackForListingType", () => {
  it("derives the track from the listing type", () => {
    expect(trackForListingType(ListingType.LAND)).toBe(EnquiryTrack.LAND);
    expect(trackForListingType(ListingType.HOME)).toBe(EnquiryTrack.HOMES);
  });

  it("has no track when the enquiry did not come from a listing", () => {
    // FR-3.3 — a general enquiry stays unassigned and is visible to everyone.
    expect(trackForListingType(null)).toBeNull();
    expect(trackForListingType(undefined)).toBeNull();
  });
});

describe("eligibleUsers", () => {
  const users = [
    user("land", SalesTrack.LAND),
    user("homes", SalesTrack.HOMES),
    user("both", SalesTrack.BOTH),
    user("admin", null),
    user("inactive-land", SalesTrack.LAND, false),
  ];

  it("matches the track, and includes BOTH", () => {
    expect(eligibleUsers(users, EnquiryTrack.LAND).map((u) => u.id)).toEqual([
      "land",
      "both",
    ]);
    expect(eligibleUsers(users, EnquiryTrack.HOMES).map((u) => u.id)).toEqual([
      "homes",
      "both",
    ]);
  });

  it("never routes a land enquiry to a homes-only user", () => {
    const ids = eligibleUsers(users, EnquiryTrack.LAND).map((u) => u.id);
    expect(ids).not.toContain("homes");
  });

  it("excludes inactive users", () => {
    expect(
      eligibleUsers(users, EnquiryTrack.LAND).map((u) => u.id),
    ).not.toContain("inactive-land");
  });

  it("excludes users with no sales track, such as an admin", () => {
    expect(
      eligibleUsers(users, EnquiryTrack.LAND).map((u) => u.id),
    ).not.toContain("admin");
  });

  it("returns nobody when the enquiry has no track", () => {
    expect(eligibleUsers(users, null)).toEqual([]);
  });
});

describe("selectAssignee", () => {
  const users = [
    user("b-land", SalesTrack.LAND),
    user("a-land", SalesTrack.LAND),
    user("homes", SalesTrack.HOMES),
  ];

  it("picks the eligible user holding the fewest open enquiries", () => {
    const counts = new Map([
      ["a-land", 5],
      ["b-land", 2],
    ]);
    expect(selectAssignee(users, EnquiryTrack.LAND, counts)?.id).toBe("b-land");
  });

  it("breaks ties deterministically, so concurrent submissions cannot collide", () => {
    const counts = new Map([
      ["a-land", 3],
      ["b-land", 3],
    ]);
    expect(selectAssignee(users, EnquiryTrack.LAND, counts)?.id).toBe("a-land");
    // Same inputs, same answer, every time.
    expect(selectAssignee(users, EnquiryTrack.LAND, counts)?.id).toBe("a-land");
  });

  it("treats a user with no recorded count as holding none", () => {
    const counts = new Map([["a-land", 4]]);
    expect(selectAssignee(users, EnquiryTrack.LAND, counts)?.id).toBe("b-land");
  });

  it("spreads work across the track as counts rise", () => {
    const counts = new Map([
      ["a-land", 0],
      ["b-land", 0],
    ]);
    const first = selectAssignee(users, EnquiryTrack.LAND, counts);
    expect(first?.id).toBe("a-land");

    counts.set(first!.id, 1);
    expect(selectAssignee(users, EnquiryTrack.LAND, counts)?.id).toBe("b-land");
  });

  it("returns nobody when no user matches the track", () => {
    const homesOnly = [user("homes", SalesTrack.HOMES)];
    expect(selectAssignee(homesOnly, EnquiryTrack.LAND, new Map())).toBeNull();
  });

  it("returns nobody for an untracked enquiry rather than guessing", () => {
    expect(selectAssignee(users, null, new Map())).toBeNull();
  });

  it("returns nobody when every eligible user is inactive", () => {
    const inactive = [user("land", SalesTrack.LAND, false)];
    expect(selectAssignee(inactive, EnquiryTrack.LAND, new Map())).toBeNull();
  });
});
