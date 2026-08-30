import { notFound } from "next/navigation";
import { requireInvestorAccess } from "@/lib/admin/access";
import { getInvestorEnquiry } from "@/lib/admin/queries/enquiries";
import {
  updateInvestorEnquiryStatus,
  addInvestorEnquiryNote,
} from "@/lib/admin/actions/enquiries";
import { PageHeader, EnquiryStatusBadge } from "@/components/admin/ui";
import { ConfirmSubmit } from "@/components/admin/confirm-action";
import { enquiryStatusLabels, options } from "@/lib/admin/labels";

export default async function InvestorEnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireInvestorAccess();
  const { id } = await params;

  const enquiry = await getInvestorEnquiry(id);
  if (!enquiry) notFound();

  return (
    <div>
      <PageHeader
        eyebrow="Investor enquiry"
        title={enquiry.name}
        description={`Received ${enquiry.createdAt.toLocaleDateString("en-NG", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`}
        action={<EnquiryStatusBadge status={enquiry.status} />}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section className="rounded-card border border-line bg-surface p-6">
            <h2 className="text-heading text-foreground">What they sent</h2>
            <p className="mt-4 text-body whitespace-pre-wrap text-muted">
              {enquiry.message}
            </p>

            <dl className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
              <div>
                <dt className="text-caption text-muted">Email</dt>
                <dd className="text-body">
                  <a
                    href={`mailto:${enquiry.email}`}
                    className="text-accent-text underline-offset-4 hover:underline"
                  >
                    {enquiry.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-caption text-muted">Phone</dt>
                <dd className="text-body">
                  <a
                    href={`tel:${enquiry.phone}`}
                    className="text-accent-text underline-offset-4 hover:underline"
                  >
                    {enquiry.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-caption text-muted">Organisation</dt>
                <dd className="text-body text-foreground">
                  {enquiry.organisation ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-caption text-muted">Capital band</dt>
                <dd className="text-body text-foreground">
                  {enquiry.capitalBand}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-caption text-muted">Project interest</dt>
                <dd className="text-body text-foreground">
                  {enquiry.projectInterest}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-caption text-muted">Consent recorded</dt>
                <dd className="text-body text-foreground">
                  {enquiry.consentGivenAt.toLocaleString("en-NG")}
                </dd>
              </div>
            </dl>
          </section>

          <section className="mt-8 rounded-card border border-line bg-surface p-6">
            <h2 className="text-heading text-foreground">Internal notes</h2>
            <p className="mt-1 text-caption text-muted">
              Private to staff. Never sent to the enquirer.
            </p>

            <form
              action={addInvestorEnquiryNote}
              className="mt-4 flex flex-col gap-3"
            >
              <input type="hidden" name="enquiryId" value={enquiry.id} />
              <textarea
                name="body"
                rows={3}
                required
                aria-label="Note"
                className="w-full rounded-control border border-line-input bg-surface px-4 py-3 text-body text-foreground"
              />
              <button
                type="submit"
                className="cursor-pointer self-start rounded-full bg-primary px-5 py-2.5 text-body text-ivory-light hover:bg-primary-hover"
              >
                Add note
              </button>
            </form>

            {enquiry.internalNotes.length > 0 ? (
              <ul className="mt-6 divide-y divide-line border-t border-line">
                {enquiry.internalNotes.map((note) => (
                  <li key={note.id} className="py-4">
                    <p className="text-body text-foreground">{note.body}</p>
                    <p className="mt-1 text-caption text-muted">
                      {note.author?.name ?? "Removed user"} ·{" "}
                      {note.createdAt.toLocaleString("en-NG")}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </div>

        <aside>
          <section className="rounded-card border border-line bg-surface p-5">
            <h2 className="text-body text-foreground">Status</h2>
            <ConfirmSubmit
              action={updateInvestorEnquiryStatus}
              title="Change this enquiry's status?"
              body={`${enquiry.name}'s enquiry is updated.`}
              valueField="status"
              confirmLabel="Update status"
              successMessage="Status updated."
              className="mt-3 flex flex-col gap-3"
            >
              <input type="hidden" name="enquiryId" value={enquiry.id} />
              <select
                name="status"
                defaultValue={enquiry.status}
                aria-label="Enquiry status"
                className="min-h-11 rounded-control border border-line-input bg-surface px-3 text-body text-foreground"
              >
                {options(enquiryStatusLabels).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="cursor-pointer rounded-full border border-line px-4 py-2 text-body text-foreground hover:bg-surface-muted"
              >
                Update status
              </button>
            </ConfirmSubmit>
          </section>
        </aside>
      </div>
    </div>
  );
}
