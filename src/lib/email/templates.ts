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
 * updated alongside palette v2.0 (charcoal / ivory / champagne); if the theme
 * changes again, these must be changed with it or mail will drift out of step
 * with the site. Two light neutrals now exist where one did before — the
 * outer shell uses ivory-light (#FAF8F3, the page background), the inner
 * "Message" quote box uses ivory (#F5F1E8, the quiet-panel tone) — matching
 * the site's own distinction between the two.
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
<html><body style="margin:0;padding:0;background:#FAF8F3;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F3;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #DED8CC;border-radius:12px;">
        <tr><td style="padding:32px;">
          <p style="${FONT};margin:0 0 24px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#726E65;">Rakuxon City</p>
          <h1 style="${FONT};margin:0 0 20px;font-size:22px;font-weight:500;color:#171918;">${esc(heading)}</h1>
          ${bodyHtml}
        </td></tr>
      </table>
      <p style="${FONT};margin:20px 0 0;font-size:12px;color:#726E65;">Rakuxon City · ${esc(site.regionsServed.join(" · "))}</p>
    </td></tr>
  </table>
</body></html>`;
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

function ctaButton(href: string, label: string): string {
  return `<p style="${FONT};margin:24px 0 0;">
    <a href="${esc(href)}" style="display:inline-block;background:#171918;color:#FAF8F3;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:15px;">${esc(label)}</a>
  </p>`;
}

function bodyParagraph(html: string): string {
  return `<p style="${FONT};margin:0 0 16px;font-size:15px;line-height:1.6;color:#726E65;">${html}</p>`;
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="${FONT};padding:8px 16px 8px 0;font-size:13px;color:#726E65;vertical-align:top;white-space:nowrap;">${esc(label)}</td>
    <td style="${FONT};padding:8px 0;font-size:15px;color:#171918;">${esc(value)}</td>
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
     <div style="margin:24px 0 0;padding:16px;background:#F5F1E8;border-radius:8px;">
       <p style="${FONT};margin:0 0 6px;font-size:13px;color:#726E65;">Message</p>
       <p style="${FONT};margin:0;font-size:15px;line-height:1.6;color:#171918;white-space:pre-wrap;">${esc(enquiry.message)}</p>
     </div>
     <p style="${FONT};margin:24px 0 0;">
       <a href="${esc(deepLink)}" style="display:inline-block;background:#171918;color:#FAF8F3;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:15px;">Open the listing</a>
     </p>
     <p style="${FONT};margin:20px 0 0;font-size:13px;color:#726E65;">Reply straight to this email to reach ${esc(enquiry.name)}.</p>`,
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
    `<p style="${FONT};margin:0 0 16px;font-size:15px;line-height:1.6;color:#726E65;">
       We have your enquiry${listingTitle ? ` about <strong style="color:#171918;font-weight:500;">${esc(listingTitle)}</strong>` : ""}
       and a member of the team will be in touch.
     </p>
     <p style="${FONT};margin:0 0 16px;font-size:15px;line-height:1.6;color:#726E65;">
       Your reference is <strong style="color:#171918;font-weight:500;">${esc(reference)}</strong>. Quote it if you contact us in the meantime.
     </p>
     <p style="${FONT};margin:0 0 16px;font-size:15px;line-height:1.6;color:#726E65;">
       When we reply we will send you the documentation position on the property — the title type, the survey number and what we hold — so you can begin your own checks. We would encourage you to run a search at the state land registry, and we will support it.
     </p>
     <p style="${FONT};margin:24px 0 0;font-size:14px;color:#726E65;">
       Reach us directly on <a href="mailto:${esc(site.email)}" style="color:#81632C;">${esc(site.email)}</a> or ${esc(site.phone.display)}.
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
       <div style="margin:24px 0 0;padding:16px;background:#F5F1E8;border-radius:8px;">
         <p style="${FONT};margin:0 0 6px;font-size:13px;color:#726E65;">Message</p>
         <p style="${FONT};margin:0;font-size:15px;line-height:1.6;color:#171918;white-space:pre-wrap;">${esc(enquiry.message)}</p>
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

/** Lister portal — confirm email before first sign-in. */
export function emailVerificationEmail({
  name,
  verifyUrl,
}: {
  name: string;
  verifyUrl: string;
}) {
  const subject = "Confirm your email — Rakuxon City lister portal";
  const html = shell(
    "Confirm your email",
    `${bodyParagraph(`Hi ${esc(firstName(name))}, thanks for registering as a lister on Rakuxon City.`)}
     ${bodyParagraph("Confirm your email address to sign in and submit listings for review.")}
     ${ctaButton(verifyUrl, "Confirm email")}
     ${bodyParagraph("This link expires in 48 hours. If you did not register, ignore this email.")}`,
  );
  const text = [
    `Hi ${firstName(name)}, thanks for registering on Rakuxon City.`,
    "",
    "Confirm your email to sign in:",
    verifyUrl,
    "",
    "This link expires in 48 hours.",
  ].join("\n");
  return { subject, html, text };
}

/** Password reset — admin staff or lister portal. */
export function passwordResetEmail({
  resetUrl,
  accountLabel,
}: {
  resetUrl: string;
  accountLabel: string;
}) {
  const subject = "Reset your Rakuxon City password";
  const html = shell(
    "Reset your password",
    `${bodyParagraph(
      `Someone asked to reset the password on your <strong style="color:#171918;font-weight:500;">${esc(accountLabel)}</strong> account.`,
    )}
     ${ctaButton(resetUrl, "Set a new password")}
     ${bodyParagraph(
       "The link works once and expires in an hour. If this was not you, ignore this email — nothing has changed.",
     )}`,
  );
  const text = [
    `Someone asked to reset the password on your ${accountLabel} account.`,
    "",
    `Open this link to set a new one: ${resetUrl}`,
    "",
    "The link works once and expires in an hour.",
    "If this wasn't you, ignore this email — nothing has changed.",
  ].join("\n");
  return { subject, html, text };
}

/** After a successful password reset via email link. */
export function passwordChangedEmail({
  name,
  signInUrl,
}: {
  name: string;
  signInUrl: string;
}) {
  const subject = "Your password was updated — Rakuxon City";
  const html = shell(
    "Password updated",
    `${bodyParagraph(`Hi ${esc(firstName(name))}, your password was changed successfully.`)}
     ${bodyParagraph("If you did not make this change, contact us immediately.")}
     ${ctaButton(signInUrl, "Sign in")}`,
  );
  const text = [
    `Hi ${firstName(name)}, your password was changed successfully.`,
    "",
    "If you did not make this change, contact us immediately.",
    "",
    signInUrl,
  ].join("\n");
  return { subject, html, text };
}

/** New lister after self-service registration. */
export function portalWelcomeEmail({ name }: { name: string }) {
  const portalUrl = `${origin()}/portal`;
  const subject = "Welcome to the Rakuxon City lister portal";
  const html = shell(
    `Welcome, ${firstName(name)}`,
    `${bodyParagraph(
      "Your lister account is ready. You can add land or home listings, upload photos, and submit them for review.",
    )}
     ${bodyParagraph(
       "Nothing goes live on the public site until our team approves a listing. We will email you when a decision is made.",
     )}
     ${ctaButton(portalUrl, "Open the portal")}
     ${bodyParagraph(
       `Questions? Reach us on <a href="mailto:${esc(site.email)}" style="color:#81632C;">${esc(site.email)}</a> or ${esc(site.phone.display)}.`,
     )}`,
  );
  const text = [
    `Welcome, ${firstName(name)}`,
    "",
    "Your lister account is ready. Add listings and submit them for review — nothing goes live until we approve.",
    "",
    portalUrl,
    "",
    `Questions: ${site.email} or ${site.phone.display}.`,
  ].join("\n");
  return { subject, html, text };
}

/** Staff account created by an admin — includes one-time temporary password. */
export function staffAccountCreatedEmail({
  name,
  email,
  temporaryPassword,
  signInUrl,
}: {
  name: string;
  email: string;
  temporaryPassword: string;
  signInUrl: string;
}) {
  const subject = "Your Rakuxon City admin account";
  const html = shell(
    `Hi ${firstName(name)}`,
    `${bodyParagraph("An admin account has been created for you on Rakuxon City.")}
     ${bodyParagraph(
       `Sign in with <strong style="color:#171918;font-weight:500;">${esc(email)}</strong> and this temporary password:`,
     )}
     <div style="margin:0 0 16px;padding:16px;background:#F5F1E8;border-radius:8px;">
       <p style="${FONT};margin:0;font-size:15px;font-family:ui-monospace,Menlo,Consolas,monospace;color:#171918;letter-spacing:0.04em;">${esc(temporaryPassword)}</p>
     </div>
     ${bodyParagraph("You will be asked to choose a new password on first sign-in.")}
     ${ctaButton(signInUrl, "Sign in to admin")}
     ${bodyParagraph("Do not share this password. If you did not expect this email, contact your team lead.")}`,
  );
  const text = [
    `Hi ${firstName(name)},`,
    "",
    "An admin account has been created for you on Rakuxon City.",
    "",
    `Email: ${email}`,
    `Temporary password: ${temporaryPassword}`,
    "",
    "You will be asked to choose a new password on first sign-in.",
    "",
    signInUrl,
  ].join("\n");
  return { subject, html, text };
}

/** Admin-issued temporary password (Team → reset password). */
export function staffTemporaryPasswordEmail({
  name,
  temporaryPassword,
  signInUrl,
}: {
  name: string;
  temporaryPassword: string;
  signInUrl: string;
}) {
  const subject = "New temporary password — Rakuxon City admin";
  const html = shell(
    "New temporary password",
    `${bodyParagraph(`Hi ${esc(firstName(name))}, an administrator reset your admin password.`)}
     ${bodyParagraph("Sign in with this temporary password:")}
     <div style="margin:0 0 16px;padding:16px;background:#F5F1E8;border-radius:8px;">
       <p style="${FONT};margin:0;font-size:15px;font-family:ui-monospace,Menlo,Consolas,monospace;color:#171918;letter-spacing:0.04em;">${esc(temporaryPassword)}</p>
     </div>
     ${bodyParagraph("You will be asked to choose a new password on sign-in.")}
     ${ctaButton(signInUrl, "Sign in to admin")}`,
  );
  const text = [
    `Hi ${firstName(name)}, an administrator reset your admin password.`,
    "",
    `Temporary password: ${temporaryPassword}`,
    "",
    "You will be asked to choose a new password on sign-in.",
    "",
    signInUrl,
  ].join("\n");
  return { subject, html, text };
}

/** To the team inbox when a lister submits a listing for moderation. */
export function listingSubmittedForReviewEmail({
  listingTitle,
  listerName,
  listerEmail,
  moderationUrl,
}: {
  listingTitle: string;
  listerName: string;
  listerEmail: string;
  moderationUrl: string;
}) {
  const subject = `Listing ready for review: ${listingTitle}`;
  const lines = [
    row("Listing", listingTitle),
    row("Submitted by", listerName),
    row("Email", listerEmail),
  ].join("");
  const html = shell(
    "Listing submitted for review",
    `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">${lines}</table>
     ${ctaButton(moderationUrl, "Open moderation queue")}`,
  );
  const text = [
    "Listing submitted for review",
    "",
    `Listing: ${listingTitle}`,
    `Submitted by: ${listerName}`,
    `Email: ${listerEmail}`,
    "",
    moderationUrl,
  ].join("\n");
  return { subject, html, text };
}

export function listingApprovedEmail({
  name,
  listingTitle,
  publicUrl,
}: {
  name: string;
  listingTitle: string;
  publicUrl: string;
}) {
  const subject = `Your listing is live: ${listingTitle}`;
  const html = shell(
    "Listing approved",
    `${bodyParagraph(
      `Hi ${esc(firstName(name))}, <strong style="color:#171918;font-weight:500;">${esc(listingTitle)}</strong> has been approved and is now visible on Rakuxon City.`,
    )}
     ${ctaButton(publicUrl, "View on the site")}
     ${bodyParagraph("Enquiries about your listing will be forwarded to your email when visitors use the enquiry form.")}`,
  );
  const text = [
    `Hi ${firstName(name)}, "${listingTitle}" has been approved and is live.`,
    "",
    publicUrl,
  ].join("\n");
  return { subject, html, text };
}

export function listingRejectedEmail({
  name,
  listingTitle,
  reason,
  editUrl,
}: {
  name: string;
  listingTitle: string;
  reason: string;
  editUrl: string;
}) {
  const subject = `Changes needed: ${listingTitle}`;
  const html = shell(
    "Listing not approved yet",
    `${bodyParagraph(
      `Hi ${esc(firstName(name))}, we reviewed <strong style="color:#171918;font-weight:500;">${esc(listingTitle)}</strong> and it is not ready to go live yet.`,
    )}
     <div style="margin:0 0 16px;padding:16px;background:#F5F1E8;border-radius:8px;">
       <p style="${FONT};margin:0 0 6px;font-size:13px;color:#726E65;">Feedback from our team</p>
       <p style="${FONT};margin:0;font-size:15px;line-height:1.6;color:#171918;white-space:pre-wrap;">${esc(reason)}</p>
     </div>
     ${bodyParagraph("Update the listing in the portal and submit it again when you are ready.")}
     ${ctaButton(editUrl, "Edit listing")}`,
  );
  const text = [
    `Hi ${firstName(name)}, "${listingTitle}" was not approved yet.`,
    "",
    "Feedback:",
    reason,
    "",
    editUrl,
  ].join("\n");
  return { subject, html, text };
}

/** Enquiry on a lister-owned listing — same facts, owner-facing copy. */
export function listerListingEnquiryEmail(enquiry: EnquiryNotification) {
  const subject = enquiry.listingTitle
    ? `Enquiry on your listing: ${enquiry.listingTitle} (${enquiry.reference})`
    : `Enquiry on your listing (${enquiry.reference})`;

  const lines = [
    row("Reference", enquiry.reference),
    row("Name", enquiry.name),
    row("Email", enquiry.email),
    row("Phone", enquiry.phone),
    enquiry.preferredInspectionDate
      ? row("Inspection", enquiry.preferredInspectionDate.toDateString())
      : "",
  ]
    .filter(Boolean)
    .join("");

  const html = shell(
    enquiry.listingTitle
      ? `New enquiry — ${enquiry.listingTitle}`
      : "New enquiry on your listing",
    `${bodyParagraph("Someone enquired about a property you listed on Rakuxon City.")}
     <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">${lines}</table>
     <div style="margin:24px 0 0;padding:16px;background:#F5F1E8;border-radius:8px;">
       <p style="${FONT};margin:0 0 6px;font-size:13px;color:#726E65;">Message</p>
       <p style="${FONT};margin:0;font-size:15px;line-height:1.6;color:#171918;white-space:pre-wrap;">${esc(enquiry.message)}</p>
     </div>
     <p style="${FONT};margin:20px 0 0;font-size:13px;color:#726E65;">Reply to this email to reach ${esc(enquiry.name)} directly.</p>`,
  );

  const text = [
    subject,
    "",
    `Name:  ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Phone: ${enquiry.phone}`,
    "",
    "Message:",
    enquiry.message,
  ].join("\n");

  return { subject, html, text };
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
      `<p style="${FONT};margin:0 0 16px;font-size:15px;line-height:1.6;color:#726E65;">
         We have your enquiry and a member of the team will make contact.
       </p>
       <p style="${FONT};margin:0;font-size:15px;line-height:1.6;color:#726E65;">
         Your reference is <strong style="color:#171918;font-weight:500;">${esc(reference)}</strong>.
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
