import Link from "next/link";
import { requireAdmin } from "@/lib/admin/access";
import { db } from "@/lib/db";
import { PageHeader, DataTable, Td } from "@/components/admin/ui";

/**
 * The import hub.
 *
 * Previously a single screen that read a `type` column and gave no indication
 * of where a file would actually land — the client's point exactly. Now each
 * destination is its own route with its own columns, its own validation and
 * its own idempotency key, so choosing the target is a navigation step rather
 * than a column buried in a spreadsheet.
 */
const DESTINATIONS = [
  {
    href: "/admin/import/land",
    title: "Land listings",
    description:
      "Plots, with plot size, title type and the documents held. Matched on reference.",
  },
  {
    href: "/admin/import/homes",
    title: "Home listings",
    description:
      "Houses, with bedrooms, build stage and finishing specification. Matched on reference.",
  },
  {
    href: "/admin/import/estates",
    title: "Estates",
    description:
      "Estates and their amenities. Matched on slug — listings reference these by name.",
  },
];

export default async function ImportHubPage() {
  await requireAdmin();

  const batches = await db.importBatch.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { importedBy: { select: { name: true } } },
  });

  return (
    <div>
      <PageHeader
        eyebrow="Bulk"
        title="Import"
        description="Choose what you are importing. Everything arrives as a draft, and re-importing updates rather than duplicating."
      />

      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {DESTINATIONS.map((destination) => (
          <li key={destination.href}>
            <Link
              href={destination.href}
              className="flex h-full flex-col rounded-card border border-line bg-surface p-5 transition-colors hover:border-muted"
            >
              <p className="text-heading text-foreground">
                {destination.title}
              </p>
              <p className="mt-2 text-caption text-muted">
                {destination.description}
              </p>
              <span className="mt-4 text-caption text-accent-text">
                Start an import →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {batches.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-heading text-foreground">Recent imports</h2>
          <div className="mt-4">
            <DataTable
              headers={["File", "Rows", "Succeeded", "Skipped", "By", "When"]}
            >
              {batches.map((batch) => (
                <tr key={batch.id}>
                  <Td>{batch.filename}</Td>
                  <Td className="tabular">{batch.rowCount}</Td>
                  <Td className="tabular">{batch.successCount}</Td>
                  <Td className="tabular">{batch.errorCount}</Td>
                  <Td className="text-muted">
                    {batch.importedBy?.name ?? "Removed user"}
                  </Td>
                  <Td className="text-muted">
                    {batch.createdAt.toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Td>
                </tr>
              ))}
            </DataTable>
          </div>
        </section>
      ) : null}
    </div>
  );
}
