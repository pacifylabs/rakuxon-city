import { LegalPage, type LegalSection } from "@/components/legal/legal-page";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Terms of use",
  description:
    "The terms covering use of the Rakuxon City website — what the listings are, what they are not, and what governs an actual purchase.",
  path: "/terms",
});

/*
 * These terms cover the WEBSITE. They deliberately do not attempt to set out
 * the terms of a land sale — that is a contract drafted per transaction, and
 * writing anything here that looked like it bound a purchase would be both
 * wrong and dangerous.
 *
 * TODO — LAUNCH GATE. Not reviewed by a solicitor. The company's registered
 * name and RC number are unknown and are needed for the first section. See
 * TODO.md §2.2.
 */
const sections: LegalSection[] = [
  {
    heading: "About these terms",
    body: [
      "These terms cover your use of this website. They do not govern the purchase of a plot or a home from us — that is a separate written agreement, drafted for the specific property, which you and your own solicitor should read before you sign anything.",
      /* TODO: registered company name and RC number are not published and are
         not in the sibling project either. Both belong in this paragraph. */
      "Our full registered company details will be stated here once confirmed.",
      "By using this site you accept these terms. If you do not, please do not use it.",
    ],
  },
  {
    heading: "What the listings are",
    body: [
      "Every listing describes a property we are offering, including its title type, its documentation position and, where we publish one, its price. We take care to make each listing accurate at the time it is published.",
      "A listing is an invitation to enquire. It is not an offer capable of acceptance, and submitting an enquiry does not reserve a property or create a contract. Availability changes, and a property shown as available may be reserved or sold before we can update the page.",
      "Where a price is shown as on request, no figure has been published and none should be inferred.",
    ],
  },
  {
    heading: "Documentation and verification",
    body: [
      "We publish the title type and the documents we hold on every listing, including where that position is weak. We do this because we think you should be able to see it before you see a price.",
      "Publishing it is not a substitute for your own verification. We encourage every buyer to conduct their own search at the state land registry, to have the survey charted at the office of the Surveyor-General, and to instruct their own solicitor — not ours, and not one we recommend.",
      "Nothing on this site, including the buyer guides, is legal advice. The guides are general information about how land transactions work in Nigeria. They are not advice about your transaction, and you should not act on them without taking advice on your own facts.",
    ],
  },
  {
    heading: "Imagery",
    body: [
      "Photographs of properties on this site are currently representative images rather than photographs of the specific plot or home listed. Credits for them are published on our image credits page.",
      "Where a home is sold off plan, any visual of the finished building is an artist's impression and is labelled as such on the listing.",
      "Site plans and layout drawings show intended arrangement and are subject to change. Do not rely on them to establish a boundary; boundaries are established by a registered survey and walked on the ground.",
    ],
  },
  {
    heading: "Enquiries",
    body: [
      "When you send an enquiry you agree that the details you give us are yours and are accurate. We handle them as set out in our privacy notice.",
      "Please do not use the enquiry forms to send us anything sensitive or confidential. Email is not a secure channel, and neither is a web form.",
    ],
  },
  {
    heading: "Availability of the site",
    body: [
      "We try to keep this site available and correct, but we do not guarantee it will be uninterrupted or free of error. We may change, suspend or withdraw any part of it without notice.",
      "This site links to third-party sites, including mapping and video services. We are not responsible for their content or their handling of your data.",
    ],
  },
  {
    heading: "Our content",
    body: [
      "The text, layout, design and code of this site belong to us, except for the licensed photography credited on the image credits page.",
      "You may read, print and share pages for your own use, and quote from the buyer guides with attribution and a link. You may not republish substantial parts of this site, scrape it, or present our content as your own.",
    ],
  },
  {
    heading: "Liability",
    body: [
      "Nothing in these terms limits liability where the law does not allow it to be limited, including for fraud or for fraudulent misrepresentation.",
      "Subject to that, we are not liable for loss arising from reliance on general information published on this site, as opposed to the written agreement and documentation for an actual transaction.",
    ],
  },
  {
    heading: "Governing law",
    body: [
      "These terms are governed by the laws of the Federal Republic of Nigeria, and the Nigerian courts have jurisdiction over any dispute arising from them.",
    ],
  },
  {
    heading: "Contact",
    body: [
      `Questions about these terms: ${site.email}, or ${site.phone.display}.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      updated="August 2026"
      summary="These cover the website — what a listing is, what our documentation means, and what you should verify yourself. A purchase is governed by its own written agreement, not by this page."
      sections={sections}
    />
  );
}
