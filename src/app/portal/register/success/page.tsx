import Link from "next/link";
import { getPlacement } from "@/lib/media";
import { AuthLayout } from "@/components/admin/auth-layout";
import { ResendVerificationForm } from "@/components/portal/resend-verification-form";

const LOGO_FALLBACK = {
  url: "/logo.png",
  alt: "Rakuxon City",
  width: 2172,
  height: 724,
};

export default async function RegisterSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const logo = (await getPlacement("site.logo")) ?? LOGO_FALLBACK;

  return (
    <AuthLayout
      logo={logo}
      title="Registration successful"
      description={
        email
          ? `We sent a confirmation link to ${email}. Open it to activate your account, then sign in.`
          : "We sent a confirmation link to your email. Open it to activate your account, then sign in."
      }
    >
      <div className="flex flex-col gap-5">
        <p className="text-body text-muted">
          The link expires in 48 hours. Check spam if it does not arrive within a few
          minutes.
        </p>
        {email ? <ResendVerificationForm email={email} /> : null}
        <Link
          href="/portal/login"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-body text-ivory-light hover:bg-primary-hover"
        >
          Go to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
