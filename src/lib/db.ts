import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env, hasDatabase } from "./env";

/**
 * Prisma 7 talks to Postgres through a driver adapter rather than a bundled
 * Rust engine, so the connection string is handed to `PrismaPg` here.
 *
 * The client is created lazily. Without a DATABASE_URL the site serves the
 * bundled snapshot instead (see lib/data/fixture.ts), and constructing a client
 * eagerly would turn "no database configured" — a supported way to run this —
 * into a crash at import time.
 *
 * The client is cached on `globalThis` in development: without it, every hot
 * reload opens a fresh pool and Postgres runs out of connections.
 */
function createPrismaClient() {
  if (!env.DATABASE_URL) {
    throw new Error(
      "No DATABASE_URL is configured, so the database cannot be reached. " +
        "Reads fall back to the bundled snapshot; anything that needs Postgres " +
        "must check `hasDatabase` before calling `db`.",
    );
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * The Postgres client. Only reachable when `hasDatabase` is true — call it
 * behind that check, never unconditionally.
 */
export function getDb(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

/**
 * Proxy so existing `db.listing.findMany(...)` call sites keep working while
 * construction stays lazy. Touching any property builds the client on demand.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, property) {
    return Reflect.get(getDb(), property);
  },
});

export { hasDatabase };
