import Link from "next/link";
import { redirect } from "next/navigation";
import { db, hasDatabase } from "@/lib/db";
import { env } from "@/lib/env";
import { getPlacement } from "@/lib/media";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { Field, Input } from "@/components/ui/field";
import { AuthLayout } from "@/components/admin/auth-layout";
import { FormError, FormSuccess } from "@/components/admin/ui";

const LOGO_FALLBACK = {
  url: "/logo.png",
  alt: "Rakuxon City",
  width: 2172,
  height: 724,
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>;
}) {
  const { error, reset } = await searchParams;
  const logo = (await getPlacement("site.logo")) ?? LOGO_FALLBACK;

  // Same "unavailable without config" contract as the rest of the site: no
  // crash, no form that can never succeed, just a plain statement of what is
  // missing.
  if (!hasDatabase || !env.AUTH_SECRET) {
    return (
      <AuthLayout
        logo={logo}
        title="Admin is unavailable"
        description="The admin console is not set up on this deployment yet. Ask your developer to finish configuring it."
      >
        <Link
          href="/"
          className="text-body text-accent-text underline underline-offset-4"
        >
          Back to the site
        </Link>
      </AuthLayout>
    );
  }

  async function authenticate(formData: FormData) {
    "use server";

    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");

    const user = await db.user.findUnique({ where: { email } });
    // The same outcome whether the account doesn't exist, is deactivated, or
    // the password is wrong — anything else is a user-existence oracle.
    const valid =
      user && user.isActive && verifyPassword(password, user.passwordHash);

    if (!valid) redirect("/admin/login?error=invalid");

    await createSession(user.id);
    redirect("/admin");
  }

  return (
    <AuthLayout
      logo={logo}
      title="Sign in"
      description="Staff access to listings, enquiries and content."
      footer={
        <p className="text-caption text-muted">
          Trouble signing in? Ask an admin to reset your password from the Team
          screen.
        </p>
      }
    >
      <div className="flex flex-col gap-5">
        {reset === "1" ? (
          <FormSuccess message="Password updated. Sign in with your new one." />
        ) : null}
        {error ? <FormError message="Incorrect email or password." /> : null}

        <form action={authenticate} className="flex flex-col gap-5">
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              placeholder="you@rakuxoncity.com"
            />
          </Field>

          <div>
            <Field label="Password" htmlFor="password">
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </Field>
            <Link
              href="/admin/forgot-password"
              className="mt-2 inline-block text-caption text-accent-text underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            className="min-h-11 cursor-pointer rounded-full bg-primary px-6 text-body text-ivory-light transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Sign in
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
