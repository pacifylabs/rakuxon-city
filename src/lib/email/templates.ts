import "server-only";
import { origin } from "@/lib/seo";
import { site } from "@/lib/site";

/**
 * Email templates, as plain strings.
 *
 * Deliberately not React Email or any renderer: these are two short messages,
 * and inlined table-based HTML that renders identically in Gmail, Outlook and
 * the Nigerian webmail clients this audience actually uses beats a component
 * tree that needs a build step.
 *
 * The hex values below duplicate the theme tokens on purpose — email clients
 * do not support CSS variables, so they cannot be referenced. They were
 * updated alongside the palette's move from sage to neutral grey; if the
 * theme changes again, these must be changed with it or mail will drift out
 * of step with the site.
 *
 * Every message ships a text part as well. Some corporate mail gateways strip
 * HTML entirely, and an enquiry acknowledgement that arrives blank reads as a
 * failed submission.
 */

/** Anything interpolated into HTML is escaped. Enquiry bodies are user input. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const FONT =
  "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function shell(heading: string, bodyHtml: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f3f3f3;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f3f3;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e5e5;border-radius:12px;">
        <tr><td style="padding:32px;">
          <p style="${FONT};margin:0 0 24px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#6f6f6f;">Rakuxon City</p>
          <h1 style="${FONT};margin:0 0 20px;font-size:22px;font-weight:500;color:#191919;">${esc(heading)}</h1>
          ${bodyHtml}
        </td></tr>
      </table>
      <p style="${FONT};margin:20px 0 0;font-size:12px;color:#6f6f6f;">Rakuxon City · ${esc(site.regionsServed.join(" · "))}</p>
    </td></tr>
  </table>
</body></html>`;
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="${FONT};padding:8px 16px 8px 0;font-size:13px;color:#6f6f6f;vertical-align:top;white-space:nowrap;">${esc(label)}</td>
    <td style="${FONT};padding:8px 0;font-size:15px;color:#191919;">${esc(value)}</td>
  </tr>`;
}

export type EnquiryNotification = {
  reference: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  track: string | null;
  listingTitle: string | null;
  listingPath: string | null;
  pagePath: string;
  preferredInspectionDate: Date | null;
  assignedToName: string | null;
};

/** To the assigned sales user, or to the general inbox when unassigned. */
export function enquiryNotification(enquiry: EnquiryNotification) {
  const lines = [
    row("Reference", enquiry.reference),
    row("Name", enquiry.name),
    row("Email", enquiry.email),
    row("Phone", enquiry.phone),
    enquiry.track ? row("Track", enquiry.track) : "",
    enquiry.listingTitle ? row("Listing", enquiry.listingTitle) : "",
    enquiry.preferredInspectionDate
      ? row("Inspection", enquiry.preferredInspectionDate.toDateString())
      : "",
    row(
      "Assigned to",
      enquiry.assignedToName ?? "Unassigned — visible to all sales users",
    ),
    row("From page", enquiry.pagePath),
  ]
    .filter(Boolean)
    .join("");

  // Phase 7 gives this a real destination; until then it points at the listing.
  const deepLink = enquiry.listingPath
    ? `${origin()}${enquiry.listingPath}`
    : `${origin()}${enquiry.pagePath}`;

  const html = shell(
    enquiry.listingTitle
      ? `New enquiry — ${enquiry.listingTitle}`
      : "New enquiry",
    `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">${lines}</table>
     <div style="margin:24px 0 0;padding:16px;background:#f3f3f3;border-radius:8px;">
       <p style="${FONT};margin:0 0 6px;font-size:13px;color:#6f6f6f;">Message</p>
       <p style="${FONT};margin:0;font-size:15px;line-height:1.6;color:#191919;white-space:pre-wrap;">${esc(enquiry.message)}</p>
     </div>
     <p style="${FONT};margin:24px 0 0;">
       <a href="${esc(deepLink)}" style="display:inline-block;background:#0e254e;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:15px;">Open the listing</a>
     </p>
     <p style="${FONT};margin:20px 0 0;font-size:13px;color:#6f6f6f;">Reply straight to this email to reach ${esc(enquiry.name)}.</p>`,
  );

  const text = [
    `New enquiry — ${enquiry.reference}`,
    "",
    `Name:     ${enquiry.name}`,
    `Email:    ${enquiry.email}`,
    `Phone:    ${enquiry.phone}`,
    enquiry.track ? `Track:    ${enquiry.track}` : "",
    enquiry.listingTitle ? `Listing:  ${enquiry.listingTitle}` : "",
    enquiry.preferredInspectionDate
      ? `Inspection: ${enquiry.preferredInspectionDate.toDateString()}`
      : "",
    `Assigned: ${enquiry.assignedToName ?? "Unassigned"}`,
    `Page:     ${enquiry.pagePath}`,
    "",
    "Message:",
    enquiry.message,
    "",
    deepLink,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: enquiry.listingTitle
      ? `New enquiry: ${enquiry.listingTitle} (${enquiry.reference})`
      : `New enquiry (${enquiry.reference})`,
    html,
    text,
  };
}

/** FR-3.4 — the acknowledgement to the enquirer. */
export function enquiryAcknowledgement({
  name,
  reference,
  listingTitle,
}: {
  name: string;
  reference: string;
  listingTitle: string | null;
}) {
  const subject = "We have your enquiry — Rakuxon City";

  const html = shell(
    `Thank you, ${name.split(" ")[0]}`,
    `<p style="${FONT};margin:0 0 16px;font-size:15px;line-height:1.6;color:#616161;">
       We have your enquiry${listingTitle ? ` about <strong style="color:#191919;font-weight:500;">${esc(listingTitle)}</strong>` : ""}
       and a member of the team will be in touch.
     </p>
     <p style="${FONT};margin:0 0 16px;font-size:15px;line-height:1.6;color:#616161;">
       Your reference is <strong style="color:#191919;font-weight:500;">${esc(reference)}</strong>. Quote it if you contact us in the meantime.
     </p>
     <p style="${FONT};margin:0 0 16px;font-size:15px;line-height:1.6;color:#616161;">
       When we reply we will send you the documentation position on the property — the title type, the survey number and what we hold — so you can begin your own checks. We would encourage you to run a search at the state land registry, and we will support it.
     </p>
     <p style="${FONT};margin:24px 0 0;font-size:14px;color:#6f6f6f;">
       Reach us directly on <a href="mailto:${esc(site.email)}" style="color:#806028;">${esc(site.email)}</a> or ${esc(site.phone.display)}.
     </p>`,
  );

  const text = [
    `Thank you, ${name.split(" ")[0]}`,
    "",
    `We have your enquiry${listingTitle ? ` about ${listingTitle}` : ""} and a member of the team will be in touch.`,
    "",
    `Your reference is ${reference}. Quote it if you contact us in the meantime.`,
    "",
    "When we reply we will send you the documentation position on the property — the title type, the survey number and what we hold — so you can begin your own checks. We would encourage you to run a search at the state land registry, and we will support it.",
    "",
    `Reach us directly on ${site.email} or ${site.phone.display}.`,
  ].join("\n");

  return { subject, html, text };
}

/** FR-4.4 — investor notifications go to their own inbox, never the sales one. */
export function investorNotification(enquiry: {
  reference: string;
  name: string;
  organisation: string | null;
  email: string;
  phone: string;
  capitalBand: string;
  projectInterest: string;
  message: string;
}) {
  const lines = [
    row("Reference", enquiry.reference),
    row("Name", enquiry.name),
    enquiry.organisation ? row("Organisation", enquiry.organisation) : "",
    row("Email", enquiry.email),
    row("Phone", enquiry.phone),
    row("Capital band", enquiry.capitalBand),
    row("Interest", enquiry.projectInterest),
  ]
    .filter(Boolean)
    .join("");

  return {
    subject: `Partnership enquiry: ${enquiry.name} (${enquiry.reference})`,
    html: shell(
      "New partnership enquiry",
      `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">${lines}</table>
       <div style="margin:24px 0 0;padding:16px;background:#f3f3f3;border-radius:8px;">
         <p style="${FONT};margin:0 0 6px;font-size:13px;color:#6f6f6f;">Message</p>
         <p style="${FONT};margin:0;font-size:15px;line-height:1.6;color:#191919;white-space:pre-wrap;">${esc(enquiry.message)}</p>
       </div>`,
    ),
    text: [
      `New partnership enquiry — ${enquiry.reference}`,
      "",
      `Name:         ${enquiry.name}`,
      enquiry.organisation ? `Organisation: ${enquiry.organisation}` : "",
      `Email:        ${enquiry.email}`,
      `Phone:        ${enquiry.phone}`,
      `Capital band: ${enquiry.capitalBand}`,
      `Interest:     ${enquiry.projectInterest}`,
      "",
      "Message:",
      enquiry.message,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

/** FR-4.5 — says only that the team will make contact. Nothing about terms. */
export function investorAcknowledgement({
  name,
  reference,
}: {
  name: string;
  reference: string;
}) {
  return {
    subject: "We have your enquiry — Rakuxon City",
    html: shell(
      `Thank you, ${name.split(" ")[0]}`,
      `<p style="${FONT};margin:0 0 16px;font-size:15px;line-height:1.6;color:#616161;">
         We have your enquiry and a member of the team will make contact.
       </p>
       <p style="${FONT};margin:0;font-size:15px;line-height:1.6;color:#616161;">
         Your reference is <strong style="color:#191919;font-weight:500;">${esc(reference)}</strong>.
       </p>`,
    ),
    text: [
      `Thank you, ${name.split(" ")[0]}`,
      "",
      "We have your enquiry and a member of the team will make contact.",
      "",
      `Your reference is ${reference}.`,
    ].join("\n"),
  };
}
