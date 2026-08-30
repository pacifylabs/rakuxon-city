import Link from "next/link";
import { requireStaff } from "@/lib/admin/access";
import { listEstatesForAdmin } from "@/lib/admin/queries/estates";
import { deleteEstate } from "@/lib/admin/actions/estates";
import {
  DataTable,
  Td,
  PageHeader,
  FormSuccess,
  FormError,
} from "@/components/admin/ui";
import { estateStatusLabels } from "@/lib/admin/labels";
import { RowActions } from "@/components/admin/row-actions";
import { ConfirmAction } from "@/components/admin/confirm-action";

export default async function AdminEstatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireStaff();
  const query = await searchParams;
  const estates = await listEstatesForAdmin();
  const isAdmin = user.role === "ADMIN";

  return (
    <div>
      <PageHeader
        eyebrow="Estates"
        title="Estates"
        description={
          isAdmin
            ? "Create and edit estates, and the amenities shown on their public page."
            : "Read-only. Ask an admin to change estate details."
        }
        action={
          isAdmin ? (
            <Link
              href="/admin/estates/new"
              className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-body text-ivory-light transition-colors hover:bg-primary-hover"
            >
              New estate
            </Link>
          ) : undefined
        }
      />

      <div className="mt-6 flex flex-col gap-3">
        {query.saved === "1" ? <FormSuccess message="Estate saved." /> : null}
        {query.deleted === "1" ? <FormSuccess message="Estate deleted." /> : null}
        {query.error === "has-listings" ? (
          <FormError message="That estate still has listings. Move or delete them first." />
        ) : null}
      </div>

      <div className="mt-6">
        <DataTable
          headers={["Name", "Location", "Listings", "Amenities", "Status", ""]}
          empty={
            estates.length === 0 ? (
              <p className="text-body text-muted">No estates yet.</p>
            ) : undefined
          }
        >
          {estates.map((estate) => (
            <tr key={estate.id}>
              <Td>
                {isAdmin ? (
                  <Link
                    href={`/admin/estates/${estate.id}/edit`}
                    className="text-accent-text underline-offset-4 hover:underline"
                  >
                    {estate.name}
                  </Link>
                ) : (
                  estate.name
                )}
              </Td>
              <Td className="text-muted">
                {estate.location}, {estate.state}
              </Td>
              <Td className="tabular">{estate._count.listings}</Td>
              <Td className="tabular text-muted">{estate.amenities.length}</Td>
              <Td className="text-muted">{estateStatusLabels[estate.status]}</Td>
              <Td>
                {isAdmin ? (
                  <RowActions
                    editHref={`/admin/estates/${estate.id}/edit`}
                    editLabel={`Edit ${estate.name}`}
                    extra={
                      /* Only offered when it is actually possible — an estate
                         with listings cannot be deleted, so the control is
                         absent rather than shown and then refused. */
                      estate._count.listings === 0 ? (
                        <ConfirmAction
                          action={deleteEstate.bind(null, estate.id)}
                          title="Delete this estate?"
                          body={`${estate.name} will be removed permanently. This cannot be undone.`}
                          confirmLabel="Delete estate"
                          successMessage={`${estate.name} deleted.`}
                          tone="danger"
                        >
                          Delete
                        </ConfirmAction>
                      ) : null
                    }
                  />
                ) : null}
              </Td>
            </tr>
          ))}
        </DataTable>
      </div>
    </div>
  );
}
