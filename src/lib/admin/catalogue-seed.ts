import "server-only";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const SEED_TIMEOUT_MS = 120_000;

/**
 * Runs `prisma/seed.ts` with `SEED_SKIP_USERS=1` — same as `pnpm db:seed:catalog`.
 * Spawns tsx so the full seed script (filesystem manifest, etc.) runs unchanged.
 */
export async function runCatalogueSeed(): Promise<void> {
  const root = process.cwd();
  const seedScript = path.join(root, "prisma", "seed.ts");
  const tsxCli = path.join(root, "node_modules", "tsx", "dist", "cli.mjs");

  if (!existsSync(seedScript)) {
    throw new Error("Seed script is missing from this deployment.");
  }
  if (!existsSync(tsxCli)) {
    throw new Error(
      "Catalogue seed is unavailable here (tsx is not installed). Run pnpm db:seed:catalog on the server instead.",
    );
  }

  try {
    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      [tsxCli, seedScript],
      {
        cwd: root,
        env: { ...process.env, SEED_SKIP_USERS: "1" },
        maxBuffer: 16 * 1024 * 1024,
        timeout: SEED_TIMEOUT_MS,
      },
    );

    if (stdout.trim()) {
      console.info("[admin] catalogue seed:\n%s", stdout.trim());
    }
    if (stderr.trim()) {
      console.warn("[admin] catalogue seed stderr:\n%s", stderr.trim());
    }
  } catch (error) {
    const execError = error as NodeJS.ErrnoException & {
      stderr?: string;
      stdout?: string;
    };
    const detail =
      execError.stderr?.trim() ||
      execError.stdout?.trim() ||
      execError.message;
    throw new Error(detail || "Catalogue seed failed.");
  }
}
