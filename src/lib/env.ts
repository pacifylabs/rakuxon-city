import "server-only";
import { z } from "zod";
import { validatePasswordStrength } from "@/lib/auth/password";

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
  /*
   * Vercel sets an unset public env var to "", not undefined, per the note
   * above — z.url() rejects an empty string, which threw
   * "Invalid environment configuration" at startup with no NEXT_PUBLIC_SITE_URL
   * set. Routed through emptyToUndefined first so the default actually applies.
   */
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.url().default("http://localhost:3000"),
  ),

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

  /**
   * Phase 7 — Cloudinary, for media-library and profile-picture uploads.
   *
   * Replaces the Vercel Blob token this slot used to hold. All three are
   * required together: the SDK cannot sign an upload without the secret, and
   * a half-configured account fails at request time rather than at boot. The
   * upload surfaces check `hasCloudinary` and say so plainly when it is unset,
   * the same contract every other optional integration here follows.
   */
  CLOUDINARY_CLOUD_NAME: emptyToUndefined,
  CLOUDINARY_API_KEY: emptyToUndefined,
  CLOUDINARY_API_SECRET: emptyToUndefined,

  /**
   * Phase 7 — the first admin account, so a fresh deployment has a way in.
   *
   * These seed the account and nothing more. Sign-in always verifies against
   * the hash in the database, never against this value, so once the admin
   * changes their password — through Settings, or the forgot-password flow —
   * this variable is inert. Rotating it afterwards does not change anyone's
   * password, and clearing it does not lock anyone out.
   *
   * Email and password are required together: an email with no password
   * cannot create an account, and a password with no email has nothing to
   * attach to. Both empty is the normal state after launch.
   */
  SUPER_ADMIN_EMAIL: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.email().optional(),
  ),
  /*
   * Held to the same rules the change-password form enforces, and checked at
   * boot rather than at first use — a deployment with a weak bootstrap
   * password should fail loudly while someone is still watching the deploy,
   * not create the account and reject the operator's own login later.
   */
  SUPER_ADMIN_PASSWORD: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z
      .string()
      .superRefine((value, ctx) => {
        for (const message of validatePasswordStrength(value).errors) {
          ctx.addIssue({ code: "custom", message });
        }
      })
      .optional(),
  ),
  /** Shown in the admin UI. Falls back to a neutral label when unset. */
  SUPER_ADMIN_NAME: emptyToUndefined,
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

/**
 * Both halves of the bootstrap admin, or neither.
 *
 * A half-set pair is a configuration mistake worth surfacing rather than
 * quietly ignoring, so `assertSuperAdminConfig` below names which half is
 * missing; this boolean is the cheap check for "should we try at all".
 */
export const hasSuperAdminConfig = Boolean(
  env.SUPER_ADMIN_EMAIL && env.SUPER_ADMIN_PASSWORD,
);

/** The half-configured case, reported rather than guessed at. */
export function superAdminConfigError(): string | null {
  if (env.SUPER_ADMIN_EMAIL && !env.SUPER_ADMIN_PASSWORD) {
    return "SUPER_ADMIN_EMAIL is set but SUPER_ADMIN_PASSWORD is not.";
  }
  if (!env.SUPER_ADMIN_EMAIL && env.SUPER_ADMIN_PASSWORD) {
    return "SUPER_ADMIN_PASSWORD is set but SUPER_ADMIN_EMAIL is not.";
  }
  return null;
}

/** All three Cloudinary values, or none — a partial config cannot sign uploads. */
export const hasCloudinary = Boolean(
  env.CLOUDINARY_CLOUD_NAME &&
  env.CLOUDINARY_API_KEY &&
  env.CLOUDINARY_API_SECRET,
);
