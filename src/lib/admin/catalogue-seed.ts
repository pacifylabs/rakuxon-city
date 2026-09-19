import "server-only";
import {
  disconnectSeedPrisma,
  runCatalogueSeedMain,
} from "../../../prisma/seed";

/**
 * Runs the Prisma catalogue seed in-process (same as `SEED_SKIP_USERS=1 pnpm db:seed`).
 * Used from admin settings so Vercel serverless does not depend on the tsx CLI.
 */
export async function runCatalogueSeed(): Promise<void> {
  try {
    await runCatalogueSeedMain();
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(detail || "Catalogue seed failed.");
  } finally {
    await disconnectSeedPrisma();
  }
}
