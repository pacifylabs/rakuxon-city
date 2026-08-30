import "server-only";
import { db } from "@/lib/db";
import { env, hasDatabase, hasSuperAdminConfig } from "@/lib/env";
import { hashPassword } from "@/lib/auth/password";
import { UserRole } from "@/generated/prisma/enums";

/**
 * Creating the first admin from the environment, once.
 *
 * The rule that makes this safe is that `SUPER_ADMIN_PASSWORD` is only ever
 * read at the moment the account is created. Sign-in verifies against the
 * hash in the database and has no knowledge of this module — see
 * `authenticate()` in `src/app/admin/login/page.tsx`. So:
 *
 *   - Once the admin changes their password, through Settings or the
 *     forgot-password flow, the environment value stops matching anything and
 *     is simply never consulted again.
 *   - Rotating or deleting the variable later changes nobody's password and
 *     locks nobody out.
 *   - There is no code path where the environment value is accepted as a
 *     login credential in place of the stored hash. That would be a standing
 *     backdoor that survives every password change, which is precisely what
 *     this design avoids.
 *
 * The account is created with `mustChangePassword`, so the first sign-in is
 * forced through `/admin/change-password` before anything else is reachable
 * (`src/app/admin/(dashboard)/layout.tsx`). The bootstrap credential is
 * therefore expected to be short-lived by construction.
 */
export type BootstrapOutcome =
  | { status: "no-database" }
  | { status: "not-configured" }
  | { status: "created"; email: string }
  | { status: "unchanged"; email: string }
  | { status: "password-reset"; email: string; sessionsRevoked: number }
  | { status: "email-taken-by-non-admin"; email: string; role: UserRole };

/**
 * Ensures the configured super admin exists.
 *
 * Idempotent: safe to run on every deploy. It writes only when the account is
 * absent, unless `resetPassword` is passed — which is the deliberate recovery
 * path for "we lost the password before anyone ever signed in", and is
 * reachable only from the CLI, never from a request.
 */
export async function ensureSuperAdmin(
  options: { resetPassword?: boolean } = {},
): Promise<BootstrapOutcome> {
  if (!hasDatabase) return { status: "no-database" };
  if (!hasSuperAdminConfig) return { status: "not-configured" };

  // Non-null after `hasSuperAdminConfig`, which checks both.
  const email = env.SUPER_ADMIN_EMAIL!.trim().toLowerCase();
  const password = env.SUPER_ADMIN_PASSWORD!;
  const name = env.SUPER_ADMIN_NAME?.trim() || "Super Admin";

  const existing = await db.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });

  if (!existing) {
    await db.user.create({
      data: {
        email,
        name,
        role: UserRole.ADMIN,
        passwordHash: hashPassword(password),
        // Forces the bootstrap credential to be replaced at first sign-in.
        mustChangePassword: true,
      },
    });
    return { status: "created", email };
  }

  /*
   * The address is already in use by a sales or investor account. Silently
   * promoting it would be a privilege escalation driven by an environment
   * variable, so this reports instead and changes nothing.
   */
  if (existing.role !== UserRole.ADMIN) {
    return {
      status: "email-taken-by-non-admin",
      email,
      role: existing.role,
    };
  }

  if (!options.resetPassword) {
    return { status: "unchanged", email };
  }

  /*
   * Deliberate recovery. Existing sessions are revoked because anyone holding
   * one was authenticated under the old password, and `mustChangePassword` is
   * set again so the re-applied environment value is replaced at next sign-in
   * exactly as it would have been at creation.
   */
  const [, revoked] = await db.$transaction([
    db.user.update({
      where: { id: existing.id },
      data: {
        passwordHash: hashPassword(password),
        mustChangePassword: true,
      },
    }),
    db.session.deleteMany({ where: { userId: existing.id } }),
  ]);

  return {
    status: "password-reset",
    email,
    sessionsRevoked: revoked.count,
  };
}

/**
 * True when the database holds no admin at all — the only state in which the
 * login screen self-heals by running the bootstrap.
 *
 * Deliberately counts admins rather than users: a deployment with sales
 * accounts but no admin is still locked out of everything an admin owns.
 */
export async function hasNoAdmin(): Promise<boolean> {
  if (!hasDatabase) return false;
  const count = await db.user.count({ where: { role: UserRole.ADMIN } });
  return count === 0;
}

/** Human-readable, for the CLI. Never includes the password. */
export function describeOutcome(outcome: BootstrapOutcome): string {
  switch (outcome.status) {
    case "no-database":
      return "No DATABASE_URL is set, so there is nothing to write to.";
    case "not-configured":
      return "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are not both set — nothing to do.";
    case "created":
      return `Created ${outcome.email} as an admin. It must change its password at first sign-in.`;
    case "unchanged":
      return `${outcome.email} already exists. Nothing changed — the stored password is authoritative.`;
    case "password-reset":
      return `Reset the password for ${outcome.email} from the environment, revoked ${outcome.sessionsRevoked} session(s), and required a change at next sign-in.`;
    case "email-taken-by-non-admin":
      return `${outcome.email} already exists with the ${outcome.role} role. Refusing to promote it from an environment variable — change the role in the admin, or use a different address.`;
  }
}
