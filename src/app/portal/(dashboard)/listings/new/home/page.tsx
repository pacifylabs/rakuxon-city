import { verifyPortalSession } from "@/lib/portal/access";
import { savePortalHomeListing } from "@/lib/portal/actions/listings";
import { HomeListingForm } from "@/components/admin/listing-form";
import { emptyHomeValues } from "@/lib/admin/form-values";

export default async function PortalNewHomePage() {
  await verifyPortalSession();

  return (
    <div>
      <h1 className="text-display-m text-foreground">New home listing</h1>
      <p className="mt-2 text-body text-muted">
        Saved as a draft. Submit for review when you are ready — nothing goes live
        until our team approves it.
      </p>
      <HomeListingForm
        values={emptyHomeValues("RXC-HME-0000")}
        estates={[]}
        action={savePortalHomeListing.bind(null, null)}
        variant="portal"
        cancelHref="/portal/listings"
      />
    </div>
  );
}
