import Link from "next/link";
import { requireAdmin } from "@/lib/admin/access";
import { listListers } from "@/lib/admin/queries/listers";
import { setUserActive } from "@/lib/admin/actions/users";
import {
  DataTable,
  Td,
  PageHeader,
  FormSuccess,
  FormError,
} from "@/components/admin/ui";
import { listerKindLabels } from "@/lib/admin/labels";
import { RowActions } from "@/components/admin/row-actions";
import { ConfirmSubmit } from "@/components/admin/confirm-action";

export default async function AdminListersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const listers = await listListers();

  return (
    <div>
      <PageHeader
        eyebrow="Portal"
        title="Property listers"
        description="Self-registered accounts that submit land and home listings for review. Team staff are managed under Users."
      />

      <div className="mt-6 flex flex-col gap-3">
        {query.saved === "1" ? <FormSuccess message="Lister updated." /> : null}
        {query.error === "self" ? (
          <FormError message="You cannot deactivate your own account." />
        ) : null}
      </div>

      <div className="mt-6">
        <DataTable
          headers={[
            "Lister",
            "Kind",
            "Listings",
            "Last sign-in",
            "Status",
            "",
          ]}
          empty={
            listers.length === 0 ? (
              <p className="text-body text-muted">
                No listers yet. They appear here when someone registers through
                the portal.
              </p>
            ) : undefined
          }
        >
          {listers.map((lister) => {
            const profile = lister.listerProfile;
            return (
              <tr key={lister.id} className={lister.isActive ? "" : "opacity-60"}>
                <Td>
                  <Link
                    href={`/admin/listers/${lister.id}`}
                    className="text-accent-text underline-offset-4 hover:underline"
                  >
                    {profile?.displayName ?? lister.name}
                  </Link>
                  <span className="block text-caption text-muted">
                    {lister.email}
                  </span>
                  {profile?.organisation ? (
                    <span className="block text-caption text-muted">
                      {profile.organisation}
                    </span>
                  ) : null}
                </Td>
                <Td className="text-muted">
                  {profile ? listerKindLabels[profile.listerKind] : "—"}
                </Td>
                <Td className="tabular">{lister._count.submittedListings}</Td>
                <Td className="whitespace-nowrap text-muted">
                  {lister.lastLoginAt
                    ? lister.lastLoginAt.toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Never"}
                </Td>
                <Td>
                  {lister.isActive ? (
                    <span className="text-caption text-foreground">Active</span>
                  ) : (
                    <span className="text-caption text-muted">Deactivated</span>
                  )}
                </Td>
                <Td>
                  <RowActions
                    editHref={`/admin/listers/${lister.id}`}
                    editLabel={`View ${profile?.displayName ?? lister.name}`}
                    extra={
                      <ConfirmSubmit
                        action={setUserActive}
                        title={
                          lister.isActive
                            ? "Deactivate this lister?"
                            : "Reactivate this lister?"
                        }
                        body={
                          lister.isActive
                            ? "They will be signed out and cannot sign in until reactivated. Their listings stay in the catalogue."
                            : "They can sign in and manage listings again."
                        }
                        confirmLabel={
                          lister.isActive ? "Deactivate" : "Reactivate"
                        }
                        successMessage="Lister updated."
                      >
                        <input type="hidden" name="userId" value={lister.id} />
                        <input
                          type="hidden"
                          name="isActive"
                          value={lister.isActive ? "0" : "1"}
                        />
                        <button
                          type="submit"
                          className="min-h-9 cursor-pointer rounded-control px-2.5 text-caption text-accent-text transition-colors hover:bg-surface-muted"
                        >
                          {lister.isActive ? "Deactivate" : "Reactivate"}
                        </button>
                      </ConfirmSubmit>
                    }
                  />
                </Td>
              </tr>
            );
          })}
        </DataTable>
      </div>
    </div>
  );
}
