import Link from "next/link";
import { redirect } from "next/navigation";
import { getPlacement } from "@/lib/media";
import { getSession } from "@/lib/auth/session";
import { AuthLayout } from "@/components/admin/auth-layout";
import { UserRole } from "@/generated/prisma/enums";
import {
  registerListerErrorMessages,
  type RegisterListerErrorCode,
} from "@/lib/portal/register-lister-core";
import { RegisterFormInner } from "./register-form";

export const dynamic = "force-dynamic";

const LOGO_FALLBACK = {
  url: "/logo.png",
  alt: "Rakuxon City",
  width: 2172,
  height: 724,
};

export default async function PortalRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session?.role === UserRole.LISTER) redirect("/portal");

  const { error: errorCode } = await searchParams;
  const errorMessage =
    errorCode && errorCode in registerListerErrorMessages
      ? registerListerErrorMessages[errorCode as RegisterListerErrorCode]
      : undefined;

  const logo = (await getPlacement("site.logo")) ?? LOGO_FALLBACK;

  return (
    <AuthLayout
      logo={logo}
      title="List your property"
      description="Create an account to submit land or homes for sale. Every listing is reviewed before it appears on Rakuxon City."
      footer={
        <p className="text-caption text-muted">
          Already registered?{" "}
          <Link href="/portal/login" className="text-accent-text underline underline-offset-4">
            Sign in
          </Link>
        </p>
      }
    >
      <RegisterFormInner errorMessage={errorMessage} />
    </AuthLayout>
  );
}
