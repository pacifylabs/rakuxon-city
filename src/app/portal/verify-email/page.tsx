import Link from "next/link";
import { redirect } from "next/navigation";
import { getPlacement } from "@/lib/media";
import { db } from "@/lib/db";
import { consumeEmailVerificationToken } from "@/lib/auth/email-verification";
import { createSession } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email/send";
import { portalWelcomeEmail } from "@/lib/email/templates";
import { AuthLayout } from "@/components/admin/auth-layout";

const LOGO_FALLBACK = {
  url: "/logo.png",
  alt: "Rakuxon City",
  width: 2172,
  height: 724,
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const logo = (await getPlacement("site.logo")) ?? LOGO_FALLBACK;

  if (!token) {
    return (
      <AuthLayout
        logo={logo}
        title="Invalid link"
        description="This confirmation link is missing or incomplete."
      >
        <Link href="/portal/login" className="text-body text-accent-text underline underline-offset-4">
          Sign in
        </Link>
      </AuthLayout>
    );
  }

  const check = await consumeEmailVerificationToken(token);

  if (!check.valid) {
    return (
      <AuthLayout
        logo={logo}
        title="Link expired"
        description="Confirmation links work once and expire after 48 hours."
      >
        <Link
          href="/portal/register/success"
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-body text-ivory-light hover:bg-primary-hover"
        >
          Request a new link
        </Link>
      </AuthLayout>
    );
  }

  const user = await db.user.findUniqueOrThrow({
    where: { id: check.userId },
    select: { name: true, email: true },
  });

  const welcome = portalWelcomeEmail({ name: user.name });
  void sendEmail({
    to: user.email,
    subject: welcome.subject,
    html: welcome.html,
    text: welcome.text,
  });

  await createSession(check.userId);
  redirect("/portal?verified=1");
}
