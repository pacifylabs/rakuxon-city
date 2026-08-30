import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/access";
import { getEstateForEdit } from "@/lib/admin/queries/estates";
import { saveEstate } from "@/lib/admin/actions/estates";
import { EstateForm } from "@/components/admin/estate-form";
import { PageHeader } from "@/components/admin/ui";

export default async function EditEstatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const estate = await getEstateForEdit(id);
  if (!estate) notFound();

  return (
    <div>
      <PageHeader eyebrow="Estates" title={estate.name} />
      <EstateForm
        values={{
          id: estate.id,
          slug: estate.slug,
          name: estate.name,
          location: estate.location,
          state: estate.state,
          description: estate.description,
          status: estate.status,
          amenities: estate.amenities,
          latitude: estate.latitude?.toString() ?? "",
          longitude: estate.longitude?.toString() ?? "",
        }}
        action={saveEstate.bind(null, id)}
      />
    </div>
  );
}
