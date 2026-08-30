import { requireAdmin } from "@/lib/admin/access";
import { saveEstate } from "@/lib/admin/actions/estates";
import { EstateForm } from "@/components/admin/estate-form";
import { PageHeader } from "@/components/admin/ui";

export default async function NewEstatePage() {
  await requireAdmin();

  return (
    <div>
      <PageHeader eyebrow="Estates" title="New estate" />
      <EstateForm
        values={{
          id: null,
          slug: "",
          name: "",
          location: "",
          state: "",
          description: "",
          status: "ACTIVE",
          amenities: [],
          latitude: "",
          longitude: "",
        }}
        action={saveEstate.bind(null, null)}
      />
    </div>
  );
}
