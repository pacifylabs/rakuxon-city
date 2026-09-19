import { verifyPortalSession } from "@/lib/portal/access";
import { savePortalLandListing } from "@/lib/portal/actions/listings";
import { LandListingForm } from "@/components/admin/listing-form";
import { emptyLandValues } from "@/lib/admin/form-values";

export default async function PortalNewLandPage() {
  await verifyPortalSession();

  return (
    <div>
      <h1 className="text-display-m text-foreground">New land listing</h1>
      <p className="mt-2 text-body text-muted">
        Saved as a draft. Submit for review when you are ready — nothing goes live
        until our team approves it.
      </p>
      <LandListingForm
        values={emptyLandValues("RXC-LND-0000")}
        estates={[]}
        action={savePortalLandListing.bind(null, null)}
        variant="portal"
        cancelHref="/portal/listings"
      />
    </div>
  );
}
