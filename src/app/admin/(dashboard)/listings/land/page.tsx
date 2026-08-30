import { ListingType } from "@/generated/prisma/enums";
import { requireTrack } from "@/lib/admin/access";
import {
  ListingList,
  parseListingFilters,
} from "@/components/admin/listing-list";

export default async function AdminLandListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireTrack(ListingType.LAND);
  const query = await searchParams;

  return (
    <ListingList
      user={user}
      type={ListingType.LAND}
      filters={parseListingFilters(query)}
      saved={query.saved === "1"}
    />
  );
}
