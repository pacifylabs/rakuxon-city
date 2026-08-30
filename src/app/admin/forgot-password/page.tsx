import { getPlacement } from "@/lib/media";
import { emailConfigured } from "@/lib/email/send";
import { AuthLayout } from "@/components/admin/auth-layout";
import { ForgotPasswordForm } from "@/components/admin/reset-forms";

const LOGO_FALLBACK = {
  url: "/logo.png",
  alt: "Rakuxon City",
  width: 2172,
  height: 724,
};

export default async function ForgotPasswordPage() {
  const logo = (await getPlacement("site.logo")) ?? LOGO_FALLBACK;

  return (
    <AuthLayout
      logo={logo}
      title="Forgot your password?"
      description="We'll email you a link to set a new one. It works once and expires in an hour."
    >
      <ForgotPasswordForm emailConfigured={emailConfigured} />
    </AuthLayout>
  );
}
