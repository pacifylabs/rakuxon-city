import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/access";
import { getListerDetail } from "@/lib/admin/queries/listers";
import { PageHeader, DataTable, Td, ListingStatusBadge } from "@/components/admin/ui";
import {
  listerKindLabels,
  moderationStatusLabels,
} from "@/lib/admin/labels";
import { ListingType } from "@/generated/prisma/enums";

export default async function AdminListerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const lister = await getListerDetail(id);
  if (!lister || !lister.listerProfile) notFound();

  const profile = lister.listerProfile;

  return (
    <div>
      <PageHeader
        eyebrow="Listers"
        title={profile.displayName}
        description={`Registered ${lister.createdAt.toLocaleDateString("en-NG", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`}
        action={
          <Link
            href="/admin/listers"
            className="text-body text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            Back to listers
          </Link>
        }
      />

      <dl className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-caption text-muted">Email</dt>
          <dd className="text-body text-foreground">{lister.email}</dd>
        </div>
        <div>
          <dt className="text-caption text-muted">Phone</dt>
          <dd className="text-body text-foreground">{profile.phone}</dd>
        </div>
        <div>
          <dt className="text-caption text-muted">Kind</dt>
          <dd className="text-body text-foreground">
            {listerKindLabels[profile.listerKind]}
          </dd>
        </div>
        <div>
          <dt className="text-caption text-muted">Organisation</dt>
          <dd className="text-body text-foreground">
            {profile.organisation ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-caption text-muted">Account status</dt>
          <dd className="text-body text-foreground">
            {lister.isActive ? "Active" : "Deactivated"}
          </dd>
        </div>
        <div>
          <dt className="text-caption text-muted">Last sign-in</dt>
          <dd className="text-body text-foreground">
            {lister.lastLoginAt
              ? lister.lastLoginAt.toLocaleString("en-NG")
              : "Never"}
          </dd>
        </div>
      </dl>

      <h2 className="mt-12 text-heading text-foreground">Listings submitted</h2>
      <p className="mt-2 text-body text-muted">
        Everything this lister has posted through the portal.
      </p>

      <div className="mt-6">
        <DataTable
          headers={["Reference", "Title", "Track", "Moderation", "Listing status", ""]}
          empty={
            lister.submittedListings.length === 0 ? (
              <p className="text-body text-muted">No listings yet.</p>
            ) : undefined
          }
        >
          {lister.submittedListings.map((listing) => {
            const track =
              listing.type === ListingType.LAND ? "land" : "homes";
            return (
              <tr key={listing.id}>
                <Td className="tabular whitespace-nowrap">{listing.reference}</Td>
                <Td>{listing.title}</Td>
                <Td className="text-muted capitalize">{track}</Td>
                <Td className="text-muted">
                  {moderationStatusLabels[listing.moderationStatus]}
                </Td>
                <Td>
                  <ListingStatusBadge status={listing.status} />
                </Td>
                <Td>
                  <Link
                    href={`/admin/listings/${track}/${listing.id}/edit`}
                    className="text-caption text-accent-text underline-offset-4 hover:underline"
                  >
                    Open in admin
                  </Link>
                </Td>
              </tr>
            );
          })}
        </DataTable>
      </div>
    </div>
  );
}
