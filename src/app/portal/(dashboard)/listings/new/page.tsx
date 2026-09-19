import Link from "next/link";
import { verifyPortalSession } from "@/lib/portal/access";

export default async function PortalNewListingPage() {
  await verifyPortalSession();

  return (
    <div>
      <h1 className="text-display-m text-foreground">What are you listing?</h1>
      <p className="mt-2 text-body text-muted">
        Choose land or a home. You can save a draft and submit when the details
        are ready.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/portal/listings/new/land"
          className="rounded-card border border-line bg-surface p-8 transition-colors hover:border-foreground/20"
        >
          <h2 className="text-body font-medium text-foreground">Land</h2>
          <p className="mt-2 text-caption text-muted">
            Plots with title type, survey number and documentation.
          </p>
        </Link>
        <Link
          href="/portal/listings/new/home"
          className="rounded-card border border-line bg-surface p-8 transition-colors hover:border-foreground/20"
        >
          <h2 className="text-body font-medium text-foreground">Home</h2>
          <p className="mt-2 text-caption text-muted">
            Completed or in-build houses with bedrooms, stage and finishing spec.
          </p>
        </Link>
      </div>
    </div>
  );
}
