import {
  BuildStage,
  DocumentType,
  EnquirySource,
  EnquiryStatus,
  EstateStatus,
  HouseType,
  ListingModerationStatus,
  ListingStatus,
  ListerKind,
  PlotUnit,
  SalesTrack,
  TitleType,
  UserRole,
  ArticleCategory,
  ArticleStatus,
} from "@/generated/prisma/enums";

/**
 * Human labels for every enum the admin renders.
 *
 * Kept here rather than beside each form so a value is worded identically
 * wherever it appears — a filter chip, a table cell, a select option and a
 * badge all read the same string. `Record<Enum, string>` rather than a
 * lookup function, so adding a value to an enum fails the build here until
 * it is given a label.
 */
export const listingStatusLabels: Record<ListingStatus, string> = {
  DRAFT: "Draft",
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  SOLD: "Sold",
};

export const plotUnitLabels: Record<PlotUnit, string> = {
  SQM: "Square metres",
  PLOTS: "Plots",
  ACRES: "Acres",
  HECTARES: "Hectares",
};

export const titleTypeLabels: Record<TitleType, string> = {
  C_OF_O: "Certificate of Occupancy",
  GOVERNORS_CONSENT: "Governor's consent",
  GAZETTE: "Gazette",
  DEED_OF_ASSIGNMENT: "Deed of assignment",
  EXCISION: "Excision",
  SURVEY_ONLY: "Survey only",
};

export const documentTypeLabels: Record<DocumentType, string> = {
  CERTIFICATE_OF_OCCUPANCY: "Certificate of Occupancy",
  GOVERNORS_CONSENT: "Governor's consent",
  DEED_OF_ASSIGNMENT: "Deed of assignment",
  REGISTERED_SURVEY_PLAN: "Registered survey plan",
  EXCISION_CERTIFICATE: "Excision certificate",
  GAZETTE_PUBLICATION: "Gazette publication",
  ESTATE_LAYOUT_APPROVAL: "Estate layout approval",
  SERVICE_CONNECTION: "Service connection",
  PURCHASE_RECEIPT: "Purchase receipt",
  ALLOCATION_LETTER: "Allocation letter",
};

export const houseTypeLabels: Record<HouseType, string> = {
  DETACHED: "Detached",
  SEMI_DETACHED: "Semi-detached",
  TERRACE: "Terrace",
  BUNGALOW: "Bungalow",
  DUPLEX: "Duplex",
  APARTMENT: "Apartment",
};

export const buildStageLabels: Record<BuildStage, string> = {
  OFF_PLAN: "Off plan",
  UNDER_CONSTRUCTION: "Under construction",
  COMPLETED: "Completed",
};

export const estateStatusLabels: Record<EstateStatus, string> = {
  ACTIVE: "Active",
  SOLD_OUT: "Sold out",
  DELIVERED: "Delivered",
};

export const enquiryStatusLabels: Record<EnquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  CLOSED: "Closed",
};

export const enquirySourceLabels: Record<EnquirySource, string> = {
  LISTING: "Listing page",
  CONTACT: "Contact page",
  RESOURCE: "Buyer guide",
  CAMPAIGN: "Campaign",
  GENERAL: "General",
};

export const userRoleLabels: Record<UserRole, string> = {
  ADMIN: "Admin",
  SALES: "Sales",
  INVESTOR_MANAGER: "Investor manager",
  LISTER: "Property lister",
};

/** Roles assignable from the Team user form — listers register via the portal. */
export const staffUserRoleLabels: Record<
  Exclude<UserRole, "LISTER">,
  string
> = {
  ADMIN: userRoleLabels.ADMIN,
  SALES: userRoleLabels.SALES,
  INVESTOR_MANAGER: userRoleLabels.INVESTOR_MANAGER,
};

export const moderationStatusLabels: Record<ListingModerationStatus, string> = {
  NOT_REQUIRED: "Staff listing",
  DRAFT: "Draft",
  PENDING_REVIEW: "Awaiting review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const listerKindLabels: Record<ListerKind, string> = {
  AGENT: "Agent",
  DEVELOPER: "Developer",
  LANDLORD: "Landlord",
  OWNER: "Owner",
};

export const salesTrackLabels: Record<SalesTrack, string> = {
  LAND: "Land",
  HOMES: "Homes",
  BOTH: "Both tracks",
};

export const articleCategoryLabels: Record<ArticleCategory, string> = {
  TITLE_AND_DOCUMENTATION: "Title and documentation",
  BUYING_PROCESS: "Buying process",
  PAYMENT_PLANS: "Payment plans",
  ESTATE_LIVING: "Estate living",
};

export const articleStatusLabels: Record<ArticleStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
};

/** `Object.entries` on an enum label map, typed. For rendering `<option>` lists. */
export function options<T extends string>(
  labels: Record<T, string>,
): { value: T; label: string }[] {
  return (Object.entries(labels) as [T, string][]).map(([value, label]) => ({
    value,
    label,
  }));
}
