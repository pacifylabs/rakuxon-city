import Link from "next/link";
import { verifySession } from "@/lib/auth/dal";
import { EnquiryStatus } from "@/generated/prisma/enums";
import {
  listEnquiries,
  getAssignableUsers,
  type EnquiryFilters,
} from "@/lib/admin/queries/enquiries";
import {
  DataTable,
  Td,
  EnquiryStatusBadge,
  AdminPagination,
  PageHeader,
} from "@/components/admin/ui";
import {
  enquirySourceLabels,
  enquiryStatusLabels,
  options,
} from "@/lib/admin/labels";
import {
  FilterBar,
  FilterSelect,
  FilterCheckbox,
} from "@/components/admin/filter-bar";
import { RowActions } from "@/components/admin/row-actions";

function parseFilters(
  query: Record<string, string | string[] | undefined>,
): EnquiryFilters {
  const one = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;
  const status = one(query.status);

  return {
    status: Object.values(EnquiryStatus).includes(status as EnquiryStatus)
      ? (status as EnquiryStatus)
      : undefined,
    assignedToUserId: one(query.assigned) || undefined,
    unassigned: one(query.unassigned) === "1",
    q: one(query.q)?.trim() || undefined,
    page: Math.max(1, Number(one(query.page)) || 1),
  };
}

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await verifySession();
  const query = await searchParams;
  const filters = parseFilters(query);

  const [{ rows, total, page, pageCount }, staff] = await Promise.all([
    listEnquiries(user, filters),
    getAssignableUsers(),
  ]);

  const hrefFor = (targetPage: number) => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.assignedToUserId) params.set("assigned", filters.assignedToUserId);
    if (filters.unassigned) params.set("unassigned", "1");
    if (filters.q) params.set("q", filters.q);
    if (targetPage > 1) params.set("page", String(targetPage));
    const search = params.toString();
    return `/admin/enquiries${search ? `?${search}` : ""}`;
  };

  return (
    <div>
      <PageHeader
        eyebrow="Inbox"
        title="Enquiries"
        description={`${total} ${total === 1 ? "enquiry" : "enquiries"} in view.`}
      />

      <div className="mt-6">
        <FilterBar
          action="/admin/enquiries"
          searchValue={filters.q}
          searchPlaceholder="Name, email or phone"
          activeCount={
            [
              filters.q,
              filters.status,
              filters.assignedToUserId,
              filters.unassigned ? "1" : "",
            ].filter(Boolean).length
          }
        >
          <FilterSelect
            name="status"
            label="Status"
            value={filters.status}
            anyLabel="Any status"
            options={options(enquiryStatusLabels)}
          />
          <FilterSelect
            name="assigned"
            label="Assigned to"
            value={filters.assignedToUserId}
            anyLabel="Anyone"
            options={staff.map((m) => ({ value: m.id, label: m.name }))}
          />
          <FilterCheckbox
            name="unassigned"
            label="Unassigned only"
            checked={filters.unassigned ?? false}
          />
        </FilterBar>
      </div>

      <div className="mt-6">
        <DataTable
          headers={["Received", "Name", "Source", "Listing", "Assigned", "Status", ""]}
          empty={
            rows.length === 0 ? (
              <p className="text-body text-muted">
                No enquiries match this view.
              </p>
            ) : undefined
          }
        >
          {rows.map((row) => (
            <tr key={row.id}>
              <Td className="whitespace-nowrap text-muted">
                {row.createdAt.toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                })}
              </Td>
              <Td>
                <Link
                  href={`/admin/enquiries/${row.id}`}
                  className="text-accent-text underline-offset-4 hover:underline"
                >
                  {row.name}
                </Link>
                <span className="block text-caption text-muted">{row.email}</span>
              </Td>
              <Td className="text-muted">{enquirySourceLabels[row.source]}</Td>
              <Td className="text-muted">
                {row.listing ? row.listing.reference : "—"}
              </Td>
              <Td className="text-muted">{row.assignedTo?.name ?? "Unassigned"}</Td>
              <Td>
                <EnquiryStatusBadge status={row.status} />
              </Td>
              <Td>
                <RowActions
                  editHref={`/admin/enquiries/${row.id}`}
                  editLabel={`Open enquiry from ${row.name}`}
                />
              </Td>
            </tr>
          ))}
        </DataTable>

        <AdminPagination page={page} pageCount={pageCount} hrefFor={hrefFor} />
      </div>
    </div>
  );
}
