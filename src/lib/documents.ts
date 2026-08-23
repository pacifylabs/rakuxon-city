import type { DocumentType, TitleType } from "@/generated/prisma/enums";

/**
 * The vocabulary the title ribbon speaks. Both lists are controlled enums so a
 * plot holding a Certificate of Occupancy says so identically to every other
 * plot holding one — a buyer comparing two listings is comparing like with like.
 */
export const documentLabels: Record<DocumentType, string> = {
  CERTIFICATE_OF_OCCUPANCY: "Certificate of Occupancy",
  GOVERNORS_CONSENT: "Governor's consent",
  DEED_OF_ASSIGNMENT: "Deed of assignment",
  REGISTERED_SURVEY_PLAN: "Registered survey plan",
  EXCISION_CERTIFICATE: "Excision certificate",
  GAZETTE_PUBLICATION: "Gazette publication",
  ESTATE_LAYOUT_APPROVAL: "Estate layout approval",
  SERVICE_CONNECTION: "Service connection certificate",
  PURCHASE_RECEIPT: "Purchase receipt",
  ALLOCATION_LETTER: "Allocation letter",
};

/**
 * The documents a buyer most often asks after, in the order a lawyer would
 * check them. Used to show what a plot does *not* hold as plainly as what it
 * does — §7 is explicit that weak documentation is stated, never hidden.
 */
export const headlineDocuments: DocumentType[] = [
  "CERTIFICATE_OF_OCCUPANCY",
  "GOVERNORS_CONSENT",
  "EXCISION_CERTIFICATE",
  "GAZETTE_PUBLICATION",
  "DEED_OF_ASSIGNMENT",
  "REGISTERED_SURVEY_PLAN",
];

/** Ranked weakest to strongest, so a plot's lead title is a meaningful claim. */
const titleStrength: Record<TitleType, number> = {
  SURVEY_ONLY: 0,
  EXCISION: 1,
  GAZETTE: 2,
  DEED_OF_ASSIGNMENT: 3,
  GOVERNORS_CONSENT: 4,
  C_OF_O: 5,
};

export function isWeakTitle(titleType: TitleType): boolean {
  return titleStrength[titleType] === 0;
}

/** Lead first, then the rest strongest to weakest. */
export function orderTitleTypes(
  lead: TitleType,
  additional: TitleType[],
): TitleType[] {
  const rest = additional
    .filter((type) => type !== lead)
    .sort((a, b) => titleStrength[b] - titleStrength[a]);
  return [lead, ...rest];
}
