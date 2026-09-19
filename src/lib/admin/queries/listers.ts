import "server-only";
import { db } from "@/lib/db";
import { UserRole } from "@/generated/prisma/enums";

export async function listListers() {
  return db.user.findMany({
    where: { role: UserRole.LISTER },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      listerProfile: {
        select: {
          displayName: true,
          phone: true,
          organisation: true,
          listerKind: true,
        },
      },
      _count: {
        select: {
          submittedListings: true,
        },
      },
    },
  });
}

export async function getListerDetail(userId: string) {
  return db.user.findFirst({
    where: { id: userId, role: UserRole.LISTER },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      listerProfile: true,
      submittedListings: {
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          reference: true,
          title: true,
          type: true,
          status: true,
          moderationStatus: true,
          submittedAt: true,
          updatedAt: true,
        },
      },
    },
  });
}
