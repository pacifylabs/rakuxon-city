import { getPlacement } from "@/lib/media";
import { emailConfigured } from "@/lib/email/send";
import { requestPortalPasswordReset } from "@/lib/portal/actions/reset";
import { AuthLayout } from "@/components/admin/auth-layout";
import { ForgotPasswordForm } from "@/components/admin/reset-forms";

const LOGO_FALLBACK = {
  url: "/logo.png",
  alt: "Rakuxon City",
  width: 2172,
  height: 724,
};

export default async function PortalForgotPasswordPage() {
  const logo = (await getPlacement("site.logo")) ?? LOGO_FALLBACK;

  return (
    <AuthLayout
      logo={logo}
      title="Forgot your password?"
      description="We'll email you a link to set a new one. It works once and expires in an hour."
      footer={
        <p className="text-caption text-muted">
          Staff accounts use{" "}
          <a href="/admin/forgot-password" className="text-accent-text underline underline-offset-4">
            admin password reset
          </a>
          .
        </p>
      }
    >
      <ForgotPasswordForm
        emailConfigured={emailConfigured}
        requestAction={requestPortalPasswordReset}
        backHref="/portal/login"
      />
    </AuthLayout>
  );
}
