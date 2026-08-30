import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/access";
import { listPlacements, allMediaOptions } from "@/lib/admin/queries/media";
import { updatePlacement } from "@/lib/admin/actions/media";
import { PageHeader } from "@/components/admin/ui";

/**
 * The named-slot manager.
 *
 * These are the images that are page furniture rather than content — the
 * logo, the OG share image, the homepage hero, the FAQ collage. They are
 * addressed by a stable key (`site.logo`, `homepage.hero`) rather than by
 * position or filename, which is what lets an admin swap one without any
 * code change and without a URL-prefix match breaking on first upload.
 */
export default async function MediaPlacementsPage() {
  await requireAdmin();

  const [placements, media] = await Promise.all([
    listPlacements(),
    allMediaOptions(),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Media"
        title="Placements"
        description="Named slots used as page furniture. Changing one updates the public site immediately."
        action={
          <Link
            href="/admin/media"
            className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-body text-foreground hover:bg-surface-muted"
          >
            Back to library
          </Link>
        }
      />

      {placements.length === 0 ? (
        <div className="mt-6 rounded-card border border-line bg-surface p-10 text-center">
          <p className="text-body text-muted">
            No placements are defined. They are created by the seed.
          </p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {placements.map((placement) => (
            <li
              key={placement.key}
              className="grid gap-4 rounded-card border border-line bg-surface p-4 sm:grid-cols-[10rem_1fr]"
            >
              <div className="relative aspect-4/3 overflow-hidden rounded-control bg-surface-muted">
                <Image
                  src={placement.media.url}
                  alt={placement.media.alt}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>

              <div>
                <p className="text-body text-foreground">{placement.label}</p>
                <p className="text-caption text-muted">{placement.key}</p>
                {placement.guidance ? (
                  <p className="mt-2 max-w-[60ch] text-caption text-muted">
                    {placement.guidance}
                  </p>
                ) : null}

                <form action={updatePlacement} className="mt-4 flex flex-wrap gap-3">
                  <input type="hidden" name="key" value={placement.key} />
                  <select
                    name="mediaId"
                    defaultValue={placement.mediaId}
                    aria-label={`Image for ${placement.label}`}
                    className="min-h-11 min-w-64 rounded-control border border-line-input bg-surface px-3 text-body text-foreground"
                  >
                    {media.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.alt.slice(0, 60)}
                        {option.isStandIn ? " (stand-in)" : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="min-h-11 cursor-pointer rounded-full border border-line px-5 text-body text-foreground hover:bg-surface-muted"
                  >
                    Update slot
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
