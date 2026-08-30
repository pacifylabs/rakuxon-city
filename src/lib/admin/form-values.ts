import "server-only";
import type {
  LandFormValues,
  HomeFormValues,
} from "@/components/admin/listing-form";
import type { PaymentPlanTerms } from "@/lib/validation/listing";

/**
 * Database row → form values.
 *
 * Every field arrives as a string because that is what an `<input>` holds;
 * nulls become `""` so React never sees `value={null}` and switches the
 * input to uncontrolled halfway through. Decimal is stringified here, at the
 * boundary, same rule the public query layer follows.
 */

type ListingRow = {
  id: string;
  slug: string;
  reference: string;
  title: string;
  description: string;
  estateId: string | null;
  location: string;
  state: string;
  price: { toString(): string } | null;
  priceOnRequest: boolean;
  paymentPlanAvailable: boolean;
  paymentPlanTerms: unknown;
  featured: boolean;
};

function planValues(terms: unknown) {
  const plan = (terms ?? null) as PaymentPlanTerms | null;
  return {
    depositPercent: plan ? String(plan.depositPercent) : "",
    durationMonths: plan ? String(plan.durationMonths) : "",
    frequency: plan?.frequency ?? "monthly",
    planNotes: plan?.notes ?? "",
  };
}

function sharedValues(row: ListingRow) {
  return {
    id: row.id,
    slug: row.slug,
    reference: row.reference,
    title: row.title,
    description: row.description,
    estateId: row.estateId,
    location: row.location,
    state: row.state,
    price: row.price === null ? "" : row.price.toString(),
    priceOnRequest: row.priceOnRequest,
    paymentPlanAvailable: row.paymentPlanAvailable,
    ...planValues(row.paymentPlanTerms),
    featured: row.featured,
  };
}

export function landFormValues(
  row: ListingRow & {
    landDetail: {
      plotSize: { toString(): string };
      plotUnit: string;
      titleType: string;
      additionalTitleTypes: string[];
      surveyNumber: string | null;
      topography: string | null;
      roadAccess: string | null;
      documents: { type: string; note: string | null }[];
    } | null;
  },
): LandFormValues {
  const detail = row.landDetail;
  return {
    ...sharedValues(row),
    plotSize: detail ? detail.plotSize.toString() : "",
    plotUnit: detail?.plotUnit ?? "SQM",
    titleType: detail?.titleType ?? "",
    additionalTitleTypes: detail?.additionalTitleTypes ?? [],
    surveyNumber: detail?.surveyNumber ?? "",
    topography: detail?.topography ?? "",
    roadAccess: detail?.roadAccess ?? "",
    documents:
      detail?.documents.map((doc) => ({
        type: doc.type,
        note: doc.note ?? "",
      })) ?? [],
  };
}

export function homeFormValues(
  row: ListingRow & {
    homeDetail: {
      bedrooms: number;
      bathrooms: number;
      houseType: string;
      buildStage: string;
      handoverDate: Date | null;
      builtArea: { toString(): string };
      landArea: { toString(): string };
      finishingSpec: string;
      features: string[];
    } | null;
  },
): HomeFormValues {
  const detail = row.homeDetail;
  return {
    ...sharedValues(row),
    bedrooms: detail ? String(detail.bedrooms) : "",
    bathrooms: detail ? String(detail.bathrooms) : "",
    houseType: detail?.houseType ?? "",
    buildStage: detail?.buildStage ?? "",
    // `<input type="date">` only accepts YYYY-MM-DD.
    handoverDate: detail?.handoverDate
      ? detail.handoverDate.toISOString().slice(0, 10)
      : "",
    builtArea: detail ? detail.builtArea.toString() : "",
    landArea: detail ? detail.landArea.toString() : "",
    finishingSpec: detail?.finishingSpec ?? "",
    features: detail?.features ?? [],
  };
}

/** A blank form, for the create pages. */
export function emptyLandValues(reference: string): LandFormValues {
  return {
    id: null,
    slug: "",
    reference,
    title: "",
    description: "",
    estateId: null,
    location: "",
    state: "",
    price: "",
    priceOnRequest: false,
    paymentPlanAvailable: false,
    depositPercent: "",
    durationMonths: "",
    frequency: "monthly",
    planNotes: "",
    featured: false,
    plotSize: "",
    plotUnit: "SQM",
    titleType: "",
    additionalTitleTypes: [],
    surveyNumber: "",
    topography: "",
    roadAccess: "",
    documents: [],
  };
}

export function emptyHomeValues(reference: string): HomeFormValues {
  return {
    id: null,
    slug: "",
    reference,
    title: "",
    description: "",
    estateId: null,
    location: "",
    state: "",
    price: "",
    priceOnRequest: false,
    paymentPlanAvailable: false,
    depositPercent: "",
    durationMonths: "",
    frequency: "monthly",
    planNotes: "",
    featured: false,
    bedrooms: "",
    bathrooms: "",
    houseType: "",
    buildStage: "",
    handoverDate: "",
    builtArea: "",
    landArea: "",
    finishingSpec: "",
    features: [],
  };
}
