import { LegalPage, type LegalSection } from "@/components/legal/legal-page";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Privacy notice",
  description:
    "What personal data Rakuxon City collects when you enquire about a plot or a home, why it is held, how long for, and the rights you have over it under the Nigeria Data Protection Act 2023.",
  path: "/privacy",
});

/*
 * Written to describe what this site actually does, not to be generic.
 *
 * TODO — LAUNCH GATE. Not reviewed by a solicitor, and one section depends on
 * decisions that have not been made: no analytics provider has been chosen, no
 * retention period has been set by the client, and no NDPR/NDPA data
 * protection officer or compliance organisation has been appointed. Each is
 * flagged inline below and recorded in TODO.md §2.
 */
const sections: LegalSection[] = [
  {
    heading: "Who this notice is from",
    body: [
      `Rakuxon City sells land and homes across Lagos, Ogun and the Federal Capital Territory. This notice covers this website and the enquiries made through it.`,
      `If you want to reach us about anything in it, email ${site.email} or call ${site.phone.display}.`,
    ],
  },
  {
    heading: "What we collect, and when",
    body: [
      "We collect personal data at one point: when you send us an enquiry. Nothing on this site requires an account, and browsing it does not require you to tell us anything about yourself.",
      "When you submit an enquiry form we receive what you typed into it:",
    ],
    points: [
      "Your name",
      "Your phone number",
      "Your email address",
      "What you are looking for, and the listing reference if you enquired from a specific plot or home",
      "Anything you chose to write in the message field",
    ],
  },
  {
    heading: "What we do with it",
    body: [
      "We use it to answer you. That means contacting you about the property you asked about, arranging an inspection if you want one, and sending you the documentation position on that plot.",
      "We do not sell your details to anyone, and we do not pass them to other agents or developers.",
      "We will not add you to a marketing list because you made an enquiry. If we ever offer a newsletter, joining it will be a separate, deliberate choice you make.",
    ],
  },
  {
    heading: "The legal basis",
    body: [
      "Under the Nigeria Data Protection Act 2023, we rely on your consent, which you give by ticking the box on the enquiry form before sending it. That box is never pre-ticked.",
      "Where an enquiry turns into a purchase, we then also process your data because it is necessary to perform the contract between us, and because we are required to keep certain records.",
      "You can withdraw consent at any time by emailing us. Withdrawing it does not affect anything we did before you withdrew it.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "An enquiry that does not lead to a purchase is kept while we are still in contact about it, and then deleted.",
      /* TODO: the client has not set a retention period. A specific figure —
         "twelve months", "twenty-four months" — must replace this sentence
         before launch. See TODO.md §2. */
      "The exact retention period is being confirmed and will be stated here.",
      "Where you buy from us, we keep the transaction records for as long as the law requires us to.",
    ],
  },
  {
    heading: "Who else sees it",
    body: [
      "Our email provider and our hosting provider process data on our behalf in order to deliver messages and run the site. They act on our instructions and are not permitted to use your data for their own purposes.",
      "We use Cloudflare Turnstile on the enquiry form to tell people apart from automated abuse. It checks the request rather than profiling you, and does not track you across other sites.",
      "Beyond that, nobody. We disclose personal data to a public authority only where we are legally obliged to.",
    ],
  },
  {
    heading: "Cookies and measurement",
    body: [
      "This site sets no advertising cookies and runs no cross-site tracking.",
      /* TODO: PRD §9 names no analytics provider and none is installed. If one
         is added, this section must be rewritten BEFORE it ships, and a
         consent banner is likely required. See TODO.md. */
      "We do not currently run analytics. If we add it, this notice will be updated before it goes live, and we will ask for your consent where the law requires it.",
      "Video tours on this site load from YouTube only after you press play. Until you do, no request is made to YouTube and it receives nothing about you. When you do press play, YouTube receives your request and its own privacy policy then applies. We use its no-cookie embed domain to limit what it sets.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "Under the Nigeria Data Protection Act 2023 you can ask us to:",
    ],
    points: [
      "Tell you what personal data of yours we hold",
      "Give you a copy of it",
      "Correct it where it is wrong",
      "Delete it",
      "Stop processing it, or object to how we are processing it",
      "Withdraw consent you previously gave",
    ],
  },
  {
    heading: "How to complain",
    body: [
      `Write to us first at ${site.email}. We would rather fix something than have you escalate it, and we will respond within thirty days.`,
      "If you are not satisfied with our response, you can complain to the Nigeria Data Protection Commission, which regulates data protection in Nigeria.",
    ],
  },
  {
    heading: "Changes",
    body: [
      "If we change how we handle personal data, we will update this notice and change the date at the top. Where a change is significant, we will say so rather than expecting you to notice.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy notice"
      updated="August 2026"
      summary="What we collect when you enquire, why, how long we keep it, and what you can ask us to do about it. Written to describe what this site actually does rather than to cover every eventuality."
      sections={sections}
    />
  );
}
