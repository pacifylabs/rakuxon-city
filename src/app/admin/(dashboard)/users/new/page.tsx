import { requireAdmin } from "@/lib/admin/access";
import { createUser } from "@/lib/admin/actions/users";
import { UserForm } from "@/components/admin/user-form";
import { PageHeader } from "@/components/admin/ui";

export default async function NewUserPage() {
  await requireAdmin();

  return (
    <div>
      <PageHeader
        eyebrow="Team"
        title="New user"
        description="A temporary password is generated on save. Pass it on; they must change it on first sign-in."
      />
      <UserForm
        values={{ id: null, name: "", email: "", role: "", salesTrack: "" }}
        action={createUser}
      />
    </div>
  );
}
