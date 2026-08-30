/**
 * Creates the super admin described by SUPER_ADMIN_EMAIL and
 * SUPER_ADMIN_PASSWORD, if it does not already exist.
 *
 *   pnpm admin:bootstrap
 *   pnpm admin:bootstrap --reset-password
 *
 * Safe to run on every deploy: without the flag it never touches an account
 * that already exists, so a password the admin has since changed is left
 * alone. `--reset-password` is the deliberate recovery path for losing the
 * bootstrap credential before anyone has signed in — it re-applies the
 * environment value, revokes every session for that account, and requires a
 * change at next sign-in.
 *
 * The password is never printed, and never logged.
 */
import "dotenv/config";
import { describeOutcome, ensureSuperAdmin } from "@/lib/auth/bootstrap";
import { superAdminConfigError } from "@/lib/env";

async function main() {
  const resetPassword = process.argv.includes("--reset-password");

  // A half-set pair is a mistake worth naming rather than treating as "off".
  const configError = superAdminConfigError();
  if (configError) {
    console.error(`✗ ${configError}`);
    process.exitCode = 1;
    return;
  }

  const outcome = await ensureSuperAdmin({ resetPassword });
  const failed =
    outcome.status === "email-taken-by-non-admin" ||
    outcome.status === "no-database";

  console.log(`${failed ? "✗" : "✓"} ${describeOutcome(outcome)}`);
  if (failed) process.exitCode = 1;
}

main()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch((error: unknown) => {
    // Message only, never the thrown object. `loadEnv` formats its issues as
    // path plus rule and never echoes a value, but printing a whole error
    // from an auth path is a habit worth not having.
    console.error(
      `✗ Bootstrap failed: ${error instanceof Error ? error.message : "unknown error"}`,
    );
    process.exit(1);
  });
