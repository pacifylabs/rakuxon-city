import Link from "next/link";
import { getPlacement } from "@/lib/media";
import { checkResetToken } from "@/lib/auth/reset";
import { AuthLayout } from "@/components/admin/auth-layout";
import { SetNewPasswordForm } from "@/components/admin/reset-forms";

const LOGO_FALLBACK = {
  url: "/logo.png",
  alt: "Rakuxon City",
  width: 2172,
  height: 724,
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const logo = (await getPlacement("site.logo")) ?? LOGO_FALLBACK;

  // Checked, not consumed — the token has to survive being looked at and die
  // on being used, or a preview fetch would burn the link.
  const check = token ? await checkResetToken(token) : { valid: false as const };

  if (!check.valid) {
    return (
      <AuthLayout
        logo={logo}
        title="That link has expired"
        description="Reset links work once and last an hour. Request a fresh one."
      >
        <Link
          href="/admin/forgot-password"
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-body text-ivory-light transition-colors hover:bg-primary-hover"
        >
          Request a new link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      logo={logo}
      title="Set a new password"
      description={`For ${check.email}.`}
    >
      <SetNewPasswordForm token={token ?? ""} />
    </AuthLayout>
  );
}
