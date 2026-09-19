import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db, hasDatabase } from "@/lib/db";
import { env } from "@/lib/env";
import { getPlacement } from "@/lib/media";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, getSession } from "@/lib/auth/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { Field, Input } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthLayout } from "@/components/admin/auth-layout";
import { FormError } from "@/components/admin/ui";
import { UserRole } from "@/generated/prisma/enums";

const LOGIN_RATE_LIMIT = { limit: 5, windowMs: 60 * 1000 };

const LOGO_FALLBACK = {
  url: "/logo.png",
  alt: "Rakuxon City",
  width: 2172,
  height: 724,
};

export default async function PortalLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session?.role === UserRole.LISTER) redirect("/portal");

  const { error } = await searchParams;
  const logo = (await getPlacement("site.logo")) ?? LOGO_FALLBACK;

  if (!hasDatabase || !env.AUTH_SECRET) {
    return (
      <AuthLayout
        logo={logo}
        title="Portal unavailable"
        description="Property listing is not configured on this deployment yet."
      >
        <Link href="/" className="text-body text-accent-text underline underline-offset-4">
          Back to the site
        </Link>
      </AuthLayout>
    );
  }

  async function authenticate(formData: FormData) {
    "use server";

    const ip = clientIp(await headers());
    const limited = rateLimit(`portal-login:${ip ?? "unknown"}`, LOGIN_RATE_LIMIT);
    if (!limited.allowed) redirect("/portal/login?error=rate_limited");

    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");

    const user = await db.user.findUnique({ where: { email } });
    const valid =
      user &&
      user.isActive &&
      user.role === UserRole.LISTER &&
      verifyPassword(password, user.passwordHash);

    if (!valid) redirect("/portal/login?error=invalid");

    await createSession(user.id);
    redirect("/portal");
  }

  return (
    <AuthLayout
      logo={logo}
      title="Lister sign in"
      description="Manage your land and home listings. Nothing goes live until our team approves it."
      footer={
        <p className="text-caption text-muted">
          No account?{" "}
          <Link
            href="/portal/register"
            className="text-accent-text underline underline-offset-4"
          >
            Register to list a property
          </Link>
          . Staff should use{" "}
          <Link href="/admin/login" className="text-accent-text underline underline-offset-4">
            admin sign in
          </Link>
          .
        </p>
      }
    >
      <div className="flex flex-col gap-5">
        {error === "rate_limited" ? (
          <FormError message="Too many attempts. Wait a minute and try again." />
        ) : error ? (
          <FormError message="Incorrect email or password." />
        ) : null}

        <form action={authenticate} className="flex flex-col gap-5">
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              autoFocus
            />
          </Field>
          <Field label="Password" htmlFor="password">
            <PasswordInput
              id="password"
              name="password"
              placeholder="Your password"
              required
              autoComplete="current-password"
            />
          </Field>
          <button
            type="submit"
            className="min-h-11 cursor-pointer rounded-full bg-primary px-6 text-body text-ivory-light transition-colors hover:bg-primary-hover"
          >
            Sign in
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
