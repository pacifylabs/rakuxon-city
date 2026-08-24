import "server-only";
import { z } from "zod";

/**
 * The single place `process.env` is read. Everything else imports from here,
 * so a missing or malformed variable fails at startup with a named cause
 * rather than as a null dereference three layers down.
 *
 * Variables land phase by phase (03_IMPLEMENTATION_PLAN.md). Those not yet
 * consumed are optional and marked with the phase that makes them required.
 */
/** Treat empty strings the same as missing — Vercel sets unset vars to "". */
const emptyToUndefined = z.preprocess(
  (val) => (val === "" ? undefined : val),
  z.string().optional(),
);

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  /**
   * Public origin, e.g. https://rakuxoncity.com. Absolute URLs in metadata
   * (og:image, canonicals) are built from it; without it Next falls back to
   * localhost and every shared link points nowhere.
   */
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),

  /**
   * Prisma datasource, a Postgres connection string. OPTIONAL BY DESIGN.
   *
   * The public site is read-only until the admin dashboard lands in Phase 7, so
   * with no database configured it serves a bundled snapshot of the seeded
   * catalogue instead. `pnpm build && pnpm start` therefore works on a clean
   * checkout with no .env, no Docker and no Postgres, which is what makes the
   * preview deployable anywhere.
   *
   * Set it and the app uses Postgres instead, with nothing else to change. It
   * becomes genuinely required in Phase 7, when staff start writing data.
   */
  DATABASE_URL: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z
      .string()
      .regex(/^postgres(ql)?:\/\//, "Must be a PostgreSQL connection string")
      .optional(),
  ),

  /** Phase 5 — Auth.js credentials provider. Generate with `openssl rand -base64 32`. */
  AUTH_SECRET: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().min(32).optional(),
  ),

  /** Phase 4 — Resend transactional email. */
  RESEND_API_KEY: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().startsWith("re_").optional(),
  ),
  ENQUIRY_FROM_EMAIL: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.email().optional(),
  ),
  /** Investor notifications go to their own target. Never the general inbox. */
  INVESTOR_NOTIFICATION_EMAIL: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.email().optional(),
  ),

  /**
   * Phase 6 — the Resend audience newsletter sign-ups mirror into.
   *
   * Optional. Without it the local `Subscriber` table still records every
   * sign-up; only the push to Resend is skipped, and `syncedToResendAt` stays
   * null so a later backfill can find those rows.
   */
  RESEND_AUDIENCE_ID: emptyToUndefined,

  /** Phase 4 — Cloudflare Turnstile. */
  TURNSTILE_SITE_KEY: emptyToUndefined,
  TURNSTILE_SECRET_KEY: emptyToUndefined,

  /** Phase 5 — media library uploads. */
  BLOB_READ_WRITE_TOKEN: emptyToUndefined,
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment configuration:\n${detail}\n\nSee .env.example.`,
    );
  }

  return parsed.data;
}

export const env = loadEnv();

/**
 * True when a real database is configured. Everything downstream branches on
 * this rather than reading `process.env` again, so one place decides.
 */
export const hasDatabase = Boolean(env.DATABASE_URL);
