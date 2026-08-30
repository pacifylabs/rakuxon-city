import Link from "next/link";
import { requireAdmin } from "@/lib/admin/access";
import { db } from "@/lib/db";
import { setUserActive } from "@/lib/admin/actions/users";
import {
  DataTable,
  Td,
  PageHeader,
  FormSuccess,
  FormError,
} from "@/components/admin/ui";
import { userRoleLabels, salesTrackLabels } from "@/lib/admin/labels";
import { RowActions } from "@/components/admin/row-actions";
import { ConfirmSubmit } from "@/components/admin/confirm-action";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await requireAdmin();
  const query = await searchParams;

  const users = await db.user.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      salesTrack: true,
      isActive: true,
      lastLoginAt: true,
      mustChangePassword: true,
      _count: { select: { assignedEnquiries: true } },
    },
  });

  return (
    <div>
      <PageHeader
        eyebrow="Team"
        title="Users"
        description="Staff accounts. Deactivating keeps their history intact and signs them out immediately."
        action={
          <Link
            href="/admin/users/new"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-body text-ivory-light hover:bg-primary-hover"
          >
            New user
          </Link>
        }
      />

      <div className="mt-6 flex flex-col gap-3">
        {query.saved === "1" ? <FormSuccess message="User saved." /> : null}
        {query.error === "self" ? (
          <FormError message="You cannot deactivate your own account." />
        ) : null}
        {query.error === "last-admin" ? (
          <FormError message="That is the last active admin. Promote someone else first." />
        ) : null}
      </div>

      <div className="mt-6">
        <DataTable
          headers={["Name", "Role", "Enquiries", "Last sign-in", "Status", ""]}
        >
          {users.map((user) => (
            <tr key={user.id} className={user.isActive ? "" : "opacity-60"}>
              <Td>
                <Link
                  href={`/admin/users/${user.id}/edit`}
                  className="text-accent-text underline-offset-4 hover:underline"
                >
                  {user.name}
                </Link>
                <span className="block text-caption text-muted">{user.email}</span>
              </Td>
              <Td className="text-muted">
                {userRoleLabels[user.role]}
                {user.salesTrack
                  ? ` · ${salesTrackLabels[user.salesTrack]}`
                  : ""}
              </Td>
              <Td className="tabular">{user._count.assignedEnquiries}</Td>
              <Td className="text-muted">
                {user.lastLoginAt
                  ? user.lastLoginAt.toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Never"}
              </Td>
              <Td className="text-muted">
                {!user.isActive
                  ? "Deactivated"
                  : user.mustChangePassword
                    ? "Awaiting first sign-in"
                    : "Active"}
              </Td>
              <Td>
                <RowActions
                  editHref={`/admin/users/${user.id}/edit`}
                  editLabel={`Edit ${user.name}`}
                  extra={
                    user.id === actor.id ? (
                      <span className="px-2.5 text-caption text-muted">You</span>
                    ) : (
                      <ConfirmSubmit
                        action={setUserActive}
                        title={
                          user.isActive
                            ? "Deactivate this account?"
                            : "Reactivate this account?"
                        }
                        body={
                          user.isActive
                            ? `${user.name} will be signed out immediately and cannot sign in again. Their assigned enquiries and history stay intact.`
                            : `${user.name} will be able to sign in again with their existing password.`
                        }
                        confirmLabel={user.isActive ? "Deactivate" : "Reactivate"}
                        successMessage={
                          user.isActive
                            ? `${user.name} deactivated.`
                            : `${user.name} reactivated.`
                        }
                      >
                        <input type="hidden" name="userId" value={user.id} />
                        <input
                          type="hidden"
                          name="isActive"
                          value={user.isActive ? "0" : "1"}
                        />
                        <button
                          type="submit"
                          className="min-h-9 cursor-pointer rounded-control px-2.5 text-caption text-accent-text transition-colors hover:bg-surface-muted"
                        >
                          {user.isActive ? "Deactivate" : "Reactivate"}
                        </button>
                      </ConfirmSubmit>
                    )
                  }
                />
              </Td>
            </tr>
          ))}
        </DataTable>
      </div>
    </div>
  );
}
