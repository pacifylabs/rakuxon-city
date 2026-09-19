import { UserRole } from "@/generated/prisma/enums";

/** Roles that sign in via /admin — not listers. */
export const STAFF_ROLES = [
  UserRole.ADMIN,
  UserRole.SALES,
  UserRole.INVESTOR_MANAGER,
] as const;
