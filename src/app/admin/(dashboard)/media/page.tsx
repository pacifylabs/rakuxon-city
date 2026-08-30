import Image from "next/image";
import Link from "next/link";
import { requireStaff } from "@/lib/admin/access";
import { hasCloudinary } from "@/lib/env";
import {
  listMedia,
  totalUsage,
  type MediaFilters,
} from "@/lib/admin/queries/media";
import { updateMediaAlt, deleteMedia } from "@/lib/admin/actions/media";
import {
  PageHeader,
  AdminPagination,
  FormSuccess,
  FormError,
} from "@/components/admin/ui";
import { FilterBar, FilterCheckbox } from "@/components/admin/filter-bar";
import { ConfirmAction } from "@/components/admin/confirm-action";

function parseFilters(
  query: Record<string, string | string[] | undefined>,
): MediaFilters {
  const one = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;
  return {
    q: one(query.q)?.trim() || undefined,
    standInOnly: one(query.standIn) === "1",
    unusedOnly: one(query.unused) === "1",
    page: Math.max(1, Number(one(query.page)) || 1),
  };
}

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireStaff();
  const query = await searchParams;
  const filters = parseFilters(query);
  const { rows, total, page, pageCount } = await listMedia(filters);
  const isAdmin = user.role === "ADMIN";

  const hrefFor = (targetPage: number) => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.standInOnly) params.set("standIn", "1");
    if (filters.unusedOnly) params.set("unused", "1");
    if (targetPage > 1) params.set("page", String(targetPage));
    const search = params.toString();
    return `/admin/media${search ? `?${search}` : ""}`;
  };

  return (
    <div>
      <PageHeader
        eyebrow="Media"
        title="Image library"
        description={`${total} ${total === 1 ? "image" : "images"}. Alt text is required on every one.`}
        action={
          <div className="flex gap-3">
            <Link
              href="/admin/media/placements"
              className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-body text-foreground hover:bg-surface-muted"
            >
              Placements
            </Link>
            <Link
              href="/admin/media/upload"
              className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-body text-ivory-light hover:bg-primary-hover"
            >
              Upload
            </Link>
          </div>
        }
      />

      <div className="mt-6 flex flex-col gap-3">
        {query.uploaded === "1" ? <FormSuccess message="Image uploaded." /> : null}
        {query.deleted === "1" ? <FormSuccess message="Image deleted." /> : null}
        {query.error === "in-use" ? (
          <FormError message="That image is still used somewhere. Replace it there first." />
        ) : null}
        {!hasCloudinary ? (
          <p className="rounded-control border border-line bg-surface px-4 py-3 text-caption text-muted">
            Image uploads are not switched on yet. Editing and placements work
            as normal.
          </p>
        ) : null}
      </div>

      <div className="mt-6">
        <FilterBar
          action="/admin/media"
          searchValue={filters.q}
          searchPlaceholder="Alt text or filename"
          activeCount={
            [
              filters.q,
              filters.standInOnly ? "1" : "",
              filters.unusedOnly ? "1" : "",
            ].filter(Boolean).length
          }
        >
          <FilterCheckbox
            name="standIn"
            label="Stand-ins only"
            checked={filters.standInOnly ?? false}
          />
          <FilterCheckbox
            name="unused"
            label="Unused only"
            checked={filters.unusedOnly ?? false}
          />
        </FilterBar>
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-card border border-line bg-surface p-10 text-center">
          <p className="text-body text-muted">No images match this view.</p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((media) => {
            const uses = totalUsage(media._count);
            return (
              <li
                key={media.id}
                className="flex flex-col rounded-card border border-line bg-surface p-3"
              >
                <div className="relative aspect-4/3 overflow-hidden rounded-control bg-surface-muted">
                  <Image
                    src={media.url}
                    alt={media.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, 50vw"
                    className="object-cover"
                  />
                </div>

                <form action={updateMediaAlt} className="mt-3 flex flex-col gap-2">
                  <input type="hidden" name="mediaId" value={media.id} />
                  <label className="text-caption text-muted" htmlFor={`alt-${media.id}`}>
                    Alt text
                  </label>
                  <textarea
                    id={`alt-${media.id}`}
                    name="alt"
                    rows={2}
                    defaultValue={media.alt}
                    className="w-full rounded-control border border-line-input bg-surface px-3 py-2 text-caption text-foreground"
                  />
                  <button
                    type="submit"
                    className="cursor-pointer self-start rounded-control border border-line px-3 py-1.5 text-caption text-foreground hover:bg-surface-muted"
                  >
                    Save alt text
                  </button>
                </form>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                  <span className="text-caption text-muted">
                    <span className="tabular">
                      {media.width}×{media.height}
                    </span>{" "}
                    ·{" "}
                    {uses === 0 ? "Unused" : `${uses} use${uses === 1 ? "" : "s"}`}
                  </span>

                  {isAdmin && uses === 0 ? (
                    <ConfirmAction
                      action={deleteMedia.bind(null, media.id)}
                      title="Delete this image?"
                      body="It will be removed from the library and from storage permanently. This cannot be undone."
                      confirmLabel="Delete image"
                      successMessage="Image deleted."
                      tone="danger"
                    >
                      Delete
                    </ConfirmAction>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AdminPagination page={page} pageCount={pageCount} hrefFor={hrefFor} />
    </div>
  );
}
