import Link from "next/link";
import { ListingStatus, ListingType } from "@/generated/prisma/enums";
import {
  listListings,
  getEstateOptions,
  type ListingFilters,
} from "@/lib/admin/queries/listings";
import { updateListingStatus } from "@/lib/admin/actions/listings";
import type { SessionUser } from "@/lib/auth/session";
import {
  DataTable,
  Td,
  ListingStatusBadge,
  AdminPagination,
  PageHeader,
  FormSuccess,
} from "@/components/admin/ui";
import { listingStatusLabels, options } from "@/lib/admin/labels";
import { FilterBar, FilterSelect } from "@/components/admin/filter-bar";
import { RowActions } from "@/components/admin/row-actions";
import { ConfirmSubmit } from "@/components/admin/confirm-action";
import { formatNaira } from "@/lib/format";

/**
 * The list surface for both tracks — they differ only in the type they pass
 * and the copy, so one component serves `/admin/listings/land` and
 * `/admin/listings/homes`.
 */
export async function ListingList({
  user,
  type,
  filters,
  saved,
}: {
  user: SessionUser;
  type: ListingType;
  filters: ListingFilters;
  saved: boolean;
}) {
  const track = type === ListingType.LAND ? "land" : "homes";
  const noun = type === ListingType.LAND ? "plot" : "home";

  const [{ rows, total, page, pageCount }, estates] = await Promise.all([
    listListings(user, type, filters),
    getEstateOptions(),
  ]);

  const isFiltered = Boolean(filters.status || filters.estateId || filters.q);

  const hrefFor = (targetPage: number) => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.estateId) params.set("estate", filters.estateId);
    if (filters.q) params.set("q", filters.q);
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return `/admin/listings/${track}${query ? `?${query}` : ""}`;
  };

  return (
    <div>
      <PageHeader
        eyebrow="Listings"
        title={type === ListingType.LAND ? "Land" : "Homes"}
        /*
         * `total` is the count AFTER filtering, so "in the catalogue" was a
         * lie the moment a filter was on — searching for something absent
         * reported "0 plots in the catalogue" on a screen holding 24 of them.
         * Say which number this is.
         */
        description={
          isFiltered
            ? `${total} ${total === 1 ? noun : `${noun}s`} match these filters.`
            : `${total} ${total === 1 ? noun : `${noun}s`} in the catalogue, drafts included.`
        }
        action={
          <Link
            href={`/admin/listings/${track}/new`}
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-body text-ivory-light transition-colors hover:bg-primary-hover"
          >
            New {noun}
          </Link>
        }
      />

      {saved ? (
        <div className="mt-6">
          <FormSuccess message="Listing saved." />
        </div>
      ) : null}

      <div className="mt-6">
        <FilterBar
          action={`/admin/listings/${track}`}
          searchValue={filters.q}
          searchPlaceholder="Reference, title or town"
          activeCount={
            [filters.q, filters.status, filters.estateId].filter(Boolean).length
          }
        >
          <FilterSelect
            name="status"
            label="Status"
            value={filters.status}
            anyLabel="Any status"
            options={options(listingStatusLabels)}
          />
          <FilterSelect
            name="estate"
            label="Estate"
            value={filters.estateId}
            anyLabel="Any estate"
            options={estates.map((e) => ({ value: e.id, label: e.name }))}
          />
        </FilterBar>
      </div>

      <div className="mt-6">
        <DataTable
          headers={[
            "Reference",
            "Title",
            "Location",
            "Price",
            "Status",
            "",
            "",
          ]}
          empty={
            rows.length === 0 ? (
              <p className="text-body text-muted">
                {filters.q || filters.status || filters.estateId
                  ? "Nothing matches those filters."
                  : `No ${noun}s yet. Create the first one.`}
              </p>
            ) : undefined
          }
        >
          {rows.map((row) => (
            <tr key={row.id}>
              <Td className="tabular whitespace-nowrap">{row.reference}</Td>
              <Td>
                <Link
                  href={`/admin/listings/${track}/${row.id}/edit`}
                  className="text-accent-text underline-offset-4 hover:underline"
                >
                  {row.title}
                </Link>
                {row.featured ? (
                  <span className="ml-2 text-caption text-muted">Featured</span>
                ) : null}
              </Td>
              <Td className="whitespace-nowrap text-muted">
                {row.estate?.name ?? row.location}
              </Td>
              <Td className="tabular whitespace-nowrap">
                {row.priceOnRequest
                  ? "On request"
                  : row.price
                    ? formatNaira(row.price)
                    : "—"}
              </Td>
              <Td>
                <ListingStatusBadge status={row.status} />
              </Td>
              <Td>
                {/* Status is changed here rather than inside the edit form:
                    it writes a StatusChange audit row, which should not ride
                    along with unrelated field edits. */}
                <ConfirmSubmit
                  action={updateListingStatus}
                  title="Change this listing's status?"
                  body={`${row.reference} is recorded in the listing's history and takes effect on the public site immediately.`}
                  valueField="status"
                  confirmLabel="Change status"
                  successMessage={`${row.reference} updated.`}
                  className="flex gap-2"
                >
                  <input type="hidden" name="listingId" value={row.id} />
                  <input type="hidden" name="track" value={track} />
                  <select
                    name="status"
                    defaultValue={row.status}
                    aria-label={`Status for ${row.reference}`}
                    className="min-h-9 rounded-control border border-line-input bg-surface px-2 text-caption text-foreground"
                  >
                    {options(listingStatusLabels).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="min-h-9 cursor-pointer rounded-control border border-line px-3 text-caption text-foreground hover:bg-surface-muted"
                  >
                    Set
                  </button>
                </ConfirmSubmit>
              </Td>
              <Td>
                <RowActions
                  editHref={`/admin/listings/${track}/${row.id}/edit`}
                  editLabel={`Edit ${row.title}`}
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

/** Shared search-param parsing for both track list pages. */
export function parseListingFilters(query: {
  status?: string | string[];
  estate?: string | string[];
  q?: string | string[];
  page?: string | string[];
}): ListingFilters {
  const one = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;

  const status = one(query.status);
  const validStatus = Object.values(ListingStatus).includes(
    status as ListingStatus,
  )
    ? (status as ListingStatus)
    : undefined;

  return {
    status: validStatus,
    estateId: one(query.estate) || undefined,
    q: one(query.q)?.trim() || undefined,
    page: Math.max(1, Number(one(query.page)) || 1),
  };
}
