import { env, hasDatabase } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Deployment check — confirms Vercel is injecting server env vars.
 * Does not expose secret values.
 */
export async function GET() {
  const rawDb = process.env.DATABASE_URL?.trim() ?? "";
  const rawAuth = process.env.AUTH_SECRET?.trim() ?? "";

  return Response.json({
    ok: hasDatabase && Boolean(env.AUTH_SECRET),
    parsed: {
      hasDatabase,
      hasAuthSecret: Boolean(env.AUTH_SECRET),
      authSecretLength: env.AUTH_SECRET?.length ?? 0,
    },
    processEnv: {
      hasDatabaseUrl: rawDb.length > 0,
      databaseUrlLooksValid: /^postgres(ql)?:\/\//.test(rawDb),
      hasAuthSecret: rawAuth.length > 0,
      authSecretLength: rawAuth.length,
    },
    hint:
      !rawDb || !rawAuth
        ? "Add DATABASE_URL and AUTH_SECRET in Vercel → Production, then Redeploy (not only Save)."
        : undefined,
  });
}
