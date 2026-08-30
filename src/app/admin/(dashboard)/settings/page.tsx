import Link from "next/link";
import { verifySession } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { hasCloudinary } from "@/lib/env";
import { setUserActive } from "@/lib/admin/actions/users";
import { PageHeader } from "@/components/admin/ui";
import { ConfirmSubmit } from "@/components/admin/confirm-action";
import { userRoleLabels } from "@/lib/admin/labels";
import {
  IdentityPanel,
  PasswordPanel,
  SessionsPanel,
} from "@/components/admin/settings-panels";

/**
 * Settings — three things and nothing else, on one screen.
 *
 * Laid out as two columns rather than a single stack: identity is short and
 * belongs beside the password form, not above it pushing everything below the
 * fold. The admin list, which is the only wide thing here, spans the full
 * width underneath.
 *
 * "Manage admins" is scoped to the ADMIN role. There is no tier above admin —
 * the client chose to treat ADMIN as the super-admin rather than add a
 * SUPER_ADMIN enum and a migration, so any admin can manage the others. The
 * two guards in `setUserActive` — cannot deactivate yourself, cannot
 * deactivate the last active admin — are what stop that becoming a lockout.
 */
export default async function AdminSettingsPage() {
  const user = await verifySession();
  const isAdmin = user.role === "ADMIN";

  // Dates for the identity card. `verifySession` returns only what the session
  // needs, so these come from the record itself.
  const account = await db.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { lastLoginAt: true, createdAt: true },
  });

  const admins = isAdmin
    ? await db.user.findMany({
        where: { role: "ADMIN" },
        orderBy: [{ isActive: "desc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isActive: true,
          lastLoginAt: true,
          mustChangePassword: true,
        },
      })
    : [];

  return (
    <div>
      <PageHeader
        eyebrow="Your account"
        title="Settings"
        description="Your sign-in details, and who else has full access."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-5 xl:grid-cols-3">
        <div className="lg:col-span-2 xl:col-span-1">
          <IdentityPanel
            name={user.name}
            email={user.email}
            roleLabel={userRoleLabels[user.role]}
            image={user.image}
            storageConfigured={hasCloudinary}
            lastLoginAt={
              account.lastLoginAt
                ? account.lastLoginAt.toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : null
            }
            createdAt={account.createdAt.toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          />
        </div>

        <div className="grid gap-6 lg:col-span-3 xl:col-span-2 xl:grid-cols-2">
          <PasswordPanel />
          <SessionsPanel />
        </div>
      </div>

      {isAdmin ? (
        <section className="mt-6 rounded-card border border-line bg-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-heading text-foreground">Admins</h2>
              <p className="mt-1 text-caption text-muted">
                Full access to everything. Sales and investor accounts are
                managed under Team.
              </p>
            </div>
            <Link
              href="/admin/users/new"
              className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-line px-4 text-body text-foreground transition-colors hover:bg-surface-muted"
            >
              Add a user
            </Link>
          </div>

          {/* A list of people, not a data table — five columns of chrome for
              three rows was most of what made this screen feel empty. */}
          <ul className="mt-5 divide-y divide-line border-t border-line">
            {admins.map((admin) => (
              <li
                key={admin.id}
                className={`flex flex-wrap items-center gap-4 py-4 ${admin.isActive ? "" : "opacity-60"}`}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-tint text-caption font-medium text-accent-text">
                  {admin.name.slice(0, 1).toUpperCase()}
                </span>

                <div className="min-w-40 flex-1">
                  <Link
                    href={`/admin/users/${admin.id}/edit`}
                    className="text-body text-foreground underline-offset-4 hover:underline"
                  >
                    {admin.name}
                  </Link>
                  <span className="block truncate text-caption text-muted">
                    {admin.email}
                  </span>
                </div>

                <span className="text-caption text-muted">
                  {!admin.isActive
                    ? "Deactivated"
                    : admin.mustChangePassword
                      ? "Awaiting first sign-in"
                      : admin.lastLoginAt
                        ? `Last in ${admin.lastLoginAt.toLocaleDateString("en-NG", { day: "numeric", month: "short" })}`
                        : "Never signed in"}
                </span>

                {admin.id === user.id ? (
                  <span className="rounded-full bg-surface-muted px-2.5 py-1 text-caption text-muted">
                    You
                  </span>
                ) : (
                  <ConfirmSubmit
                    action={setUserActive}
                    title={
                      admin.isActive
                        ? "Deactivate this admin?"
                        : "Reactivate this admin?"
                    }
                    body={
                      admin.isActive
                        ? `${admin.name} will be signed out immediately and will not be able to sign in again. Their history stays intact.`
                        : `${admin.name} will be able to sign in again with their existing password.`
                    }
                    confirmLabel={admin.isActive ? "Deactivate" : "Reactivate"}
                    successMessage={
                      admin.isActive
                        ? `${admin.name} deactivated.`
                        : `${admin.name} reactivated.`
                    }
                  >
                    <input type="hidden" name="userId" value={admin.id} />
                    <input
                      type="hidden"
                      name="isActive"
                      value={admin.isActive ? "0" : "1"}
                    />
                    <button
                      type="submit"
                      className="min-h-9 cursor-pointer rounded-control px-2.5 text-caption text-accent-text transition-colors hover:bg-surface-muted"
                    >
                      {admin.isActive ? "Deactivate" : "Reactivate"}
                    </button>
                  </ConfirmSubmit>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
