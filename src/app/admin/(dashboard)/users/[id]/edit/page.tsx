import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/access";
import { db } from "@/lib/db";
import { updateUser } from "@/lib/admin/actions/users";
import { UserForm } from "@/components/admin/user-form";
import { PageHeader } from "@/components/admin/ui";
import { PasswordResetPanel } from "@/components/admin/password-reset";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      salesTrack: true,
      isActive: true,
      mustChangePassword: true,
    },
  });
  if (!user) notFound();

  return (
    <div>
      <PageHeader
        eyebrow="Team"
        title={user.name}
        description={
          user.isActive
            ? undefined
            : "This account is deactivated and cannot sign in."
        }
      />
      <UserForm
        values={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          salesTrack: user.salesTrack ?? "",
        }}
        action={updateUser.bind(null, id)}
      />
      <PasswordResetPanel userId={user.id} userName={user.name} />
    </div>
  );
}
