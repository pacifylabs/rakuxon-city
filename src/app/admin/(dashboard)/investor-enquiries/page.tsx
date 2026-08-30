import Link from "next/link";
import { requireInvestorAccess } from "@/lib/admin/access";
import { listInvestorEnquiries } from "@/lib/admin/queries/enquiries";
import {
  DataTable,
  Td,
  EnquiryStatusBadge,
  AdminPagination,
  PageHeader,
} from "@/components/admin/ui";
import { FilterBar } from "@/components/admin/filter-bar";
import { RowActions } from "@/components/admin/row-actions";

export default async function InvestorEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireInvestorAccess();
  const query = await searchParams;
  const one = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;

  const filters = {
    q: one(query.q)?.trim() || undefined,
    page: Math.max(1, Number(one(query.page)) || 1),
  };

  const { rows, total, page, pageCount } = await listInvestorEnquiries(filters);

  const hrefFor = (targetPage: number) => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (targetPage > 1) params.set("page", String(targetPage));
    const search = params.toString();
    return `/admin/investor-enquiries${search ? `?${search}` : ""}`;
  };

  return (
    <div>
      <PageHeader
        eyebrow="Restricted"
        title="Investor enquiries"
        description={`${total} ${total === 1 ? "enquiry" : "enquiries"}. Visible to admins and investor managers only.`}
      />

      <div className="mt-6">
        <FilterBar
          action="/admin/investor-enquiries"
          searchValue={filters.q}
          searchPlaceholder="Name, email or organisation"
          activeCount={filters.q ? 1 : 0}
        />
      </div>

      <div className="mt-6">
        <DataTable
          headers={["Received", "Name", "Organisation", "Capital band", "Status", ""]}
          empty={
            rows.length === 0 ? (
              <p className="text-body text-muted">No investor enquiries yet.</p>
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
                  href={`/admin/investor-enquiries/${row.id}`}
                  className="text-accent-text underline-offset-4 hover:underline"
                >
                  {row.name}
                </Link>
                <span className="block text-caption text-muted">{row.email}</span>
              </Td>
              <Td className="text-muted">{row.organisation ?? "—"}</Td>
              <Td className="text-muted">{row.capitalBand}</Td>
              <Td>
                <EnquiryStatusBadge status={row.status} />
              </Td>
              <Td>
                <RowActions
                  editHref={`/admin/investor-enquiries/${row.id}`}
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
