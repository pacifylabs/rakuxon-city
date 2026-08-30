import "server-only";
import { landListingSchema, homeListingSchema } from "@/lib/validation/listing";
import {
  ListingStatus,
  ListingType,
  PlotUnit,
  TitleType,
  DocumentType,
  HouseType,
  BuildStage,
} from "@/generated/prisma/enums";
import type { CsvTable } from "@/lib/admin/import/parser";

export type RowError = { column: string; message: string };

export type ValidatedRow = {
  /** 1-based, matching what the spreadsheet shows, with the header as row 1. */
  lineNumber: number;
  reference: string;
  title: string;
  errors: RowError[];
  /** Present only when `errors` is empty. */
  data?: ReturnType<typeof buildLand> | ReturnType<typeof buildHome>;
};

/** Column aliases, so a client's own spreadsheet headings mostly just work. */
const COLUMNS = {
  reference: ["reference", "ref"],
  type: ["type", "listingtype"],
  title: ["title", "name"],
  slug: ["slug"],
  description: ["description", "desc"],
  location: ["location", "town", "area"],
  state: ["state"],
  price: ["price", "amount"],
  priceOnRequest: ["priceonrequest", "por"],
  estate: ["estate", "estateslug"],
  plotSize: ["plotsize", "size"],
  plotUnit: ["plotunit", "unit"],
  titleType: ["titletype", "title_type"],
  surveyNumber: ["surveynumber", "survey"],
  topography: ["topography"],
  roadAccess: ["roadaccess"],
  documents: ["documents", "docs"],
  bedrooms: ["bedrooms", "beds"],
  bathrooms: ["bathrooms", "baths"],
  houseType: ["housetype"],
  buildStage: ["buildstage", "stage"],
  builtArea: ["builtarea"],
  landArea: ["landarea"],
  finishingSpec: ["finishingspec", "finishing"],
  features: ["features"],
} as const;

function pick(row: Record<string, string>, aliases: readonly string[]): string {
  for (const alias of aliases) {
    const value = row[alias];
    if (value !== undefined && value !== "") return value;
  }
  return "";
}

function parseBool(value: string): boolean {
  return ["true", "yes", "y", "1"].includes(value.trim().toLowerCase());
}

function parseNum(value: string): number | null {
  if (value.trim() === "") return null;
  // Spreadsheets export thousands separators and currency symbols freely.
  const cleaned = value.replace(/[₦,\s]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

/** `C_OF_O` / `c of o` / `C of O` all resolve to the same enum member. */
function matchEnum<T extends Record<string, string>>(
  value: string,
  enumObject: T,
): T[keyof T] | null {
  const normalised = value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  const values = Object.values(enumObject) as string[];
  return (values.find((v) => v === normalised) as T[keyof T]) ?? null;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function buildLand(row: Record<string, string>, estateId: string | null) {
  const priceOnRequest = parseBool(pick(row, COLUMNS.priceOnRequest));
  const title = pick(row, COLUMNS.title);

  return {
    slug: pick(row, COLUMNS.slug) || slugify(title),
    reference: pick(row, COLUMNS.reference),
    type: ListingType.LAND,
    title,
    description: pick(row, COLUMNS.description),
    estateId,
    location: pick(row, COLUMNS.location),
    state: pick(row, COLUMNS.state),
    price: priceOnRequest ? null : parseNum(pick(row, COLUMNS.price)),
    priceOnRequest,
    // Imports always land as drafts — the spec is explicit ("commit valid
    // rows as drafts"), so a bad spreadsheet can never publish itself.
    status: ListingStatus.DRAFT,
    paymentPlanAvailable: false,
    paymentPlanTerms: null,
    featured: false,
    landDetail: {
      plotSize: parseNum(pick(row, COLUMNS.plotSize)) ?? 0,
      plotUnit:
        matchEnum(pick(row, COLUMNS.plotUnit), PlotUnit) ?? PlotUnit.SQM,
      titleType: matchEnum(
        pick(row, COLUMNS.titleType),
        TitleType,
      ) as TitleType,
      additionalTitleTypes: [],
      surveyNumber: pick(row, COLUMNS.surveyNumber) || null,
      topography: pick(row, COLUMNS.topography) || null,
      roadAccess: pick(row, COLUMNS.roadAccess) || null,
      // Pipe-separated, because a comma would need quoting in every row.
      documents: pick(row, COLUMNS.documents)
        .split("|")
        .map((entry) => matchEnum(entry, DocumentType))
        .filter((type): type is DocumentType => type !== null)
        .map((type) => ({ type, note: null, mediaId: null })),
    },
  };
}

function buildHome(row: Record<string, string>, estateId: string | null) {
  const priceOnRequest = parseBool(pick(row, COLUMNS.priceOnRequest));
  const title = pick(row, COLUMNS.title);

  return {
    slug: pick(row, COLUMNS.slug) || slugify(title),
    reference: pick(row, COLUMNS.reference),
    type: ListingType.HOME,
    title,
    description: pick(row, COLUMNS.description),
    estateId,
    location: pick(row, COLUMNS.location),
    state: pick(row, COLUMNS.state),
    price: priceOnRequest ? null : parseNum(pick(row, COLUMNS.price)),
    priceOnRequest,
    status: ListingStatus.DRAFT,
    paymentPlanAvailable: false,
    paymentPlanTerms: null,
    featured: false,
    homeDetail: {
      bedrooms: parseNum(pick(row, COLUMNS.bedrooms)) ?? 0,
      bathrooms: parseNum(pick(row, COLUMNS.bathrooms)) ?? 0,
      houseType: matchEnum(
        pick(row, COLUMNS.houseType),
        HouseType,
      ) as HouseType,
      buildStage: matchEnum(
        pick(row, COLUMNS.buildStage),
        BuildStage,
      ) as BuildStage,
      handoverDate: null,
      builtArea: parseNum(pick(row, COLUMNS.builtArea)) ?? 0,
      landArea: parseNum(pick(row, COLUMNS.landArea)) ?? 0,
      floorPlanId: null,
      finishingSpec: pick(row, COLUMNS.finishingSpec),
      features: pick(row, COLUMNS.features)
        .split("|")
        .map((f) => f.trim())
        .filter(Boolean),
    },
  };
}

/**
 * Validates every row and reports per-row errors rather than failing the
 * file. That is the whole point of the preview step: a 200-row spreadsheet
 * with three bad rows should import 197 and tell you about the three, not
 * refuse everything.
 */
/**
 * The columns each track genuinely cannot do without.
 *
 * These were being silently defaulted before — a missing `plotSize` became
 * `0` and a missing `titleType` became `undefined` behind an `as` cast — so
 * the schema rejected the row a step later with its own internal wording:
 * "landDetail.plotSize: Too small", or a raw dump of the TitleType enum. Both
 * name a field the spreadsheet does not have and neither says what to do, and
 * every one of these columns was documented on the import page as optional.
 *
 * Checking here means the message can name the actual CSV column and say what
 * a good value looks like.
 */
const REQUIRED_COLUMNS: Record<
  ListingType,
  {
    column: keyof typeof COLUMNS;
    label: string;
    hint: string;
    numeric?: true;
  }[]
> = {
  [ListingType.LAND]: [
    {
      column: "plotSize",
      label: "plotSize",
      hint: "the plot's size as a number, for example 500",
      numeric: true,
    },
    {
      column: "titleType",
      label: "titleType",
      hint: `one of ${enumWords(TitleType)}`,
    },
  ],
  [ListingType.HOME]: [
    {
      column: "bedrooms",
      label: "bedrooms",
      hint: "a whole number from 1 to 20",
      numeric: true,
    },
    {
      column: "bathrooms",
      label: "bathrooms",
      hint: "a whole number from 1 to 20",
      numeric: true,
    },
    {
      column: "houseType",
      label: "houseType",
      hint: `one of ${enumWords(HouseType)}`,
    },
    {
      column: "buildStage",
      label: "buildStage",
      hint: `one of ${enumWords(BuildStage)}`,
    },
    {
      column: "builtArea",
      label: "builtArea",
      hint: "the built area in square metres, for example 220",
      numeric: true,
    },
    {
      column: "landArea",
      label: "landArea",
      hint: "the land area in square metres, for example 450",
      numeric: true,
    },
    {
      column: "finishingSpec",
      label: "finishingSpec",
      hint: "a sentence describing the finish, at least 10 characters",
    },
  ],
};

/** The accepted spreadsheet values for whichever enum column failed. */
const ACCEPTED: Record<string, Record<string, string>> = {
  titleType: TitleType,
  plotUnit: PlotUnit,
  houseType: HouseType,
  buildStage: BuildStage,
  documents: DocumentType,
};

function acceptedFor(column: string): string {
  const source = ACCEPTED[column];
  return source
    ? enumWords(source)
    : "a value listed in the column guide above";
}

/** Enum values as a spreadsheet author would type them. */
function enumWords(source: Record<string, string>): string {
  return Object.values(source)
    .map((value) => value.toLowerCase())
    .join(", ");
}

/**
 * Turns an internal schema path into the spreadsheet column it came from.
 * `landDetail.plotSize` is a shape this codebase invented; the person fixing
 * the file only ever typed `plotSize`.
 */
function columnLabel(path: (string | number | symbol)[]): string {
  const parts = path.filter(Boolean).map(String);
  const last = parts[parts.length - 1];
  return last && last !== "landDetail" && last !== "homeDetail"
    ? last
    : (parts[0] ?? "row");
}

export function validateRows(
  table: CsvTable,
  estatesBySlug: Map<string, string>,
  defaultType: ListingType,
): ValidatedRow[] {
  return table.rows.map((row, index) => {
    const lineNumber = index + 2; // +1 for zero-index, +1 for the header row
    const reference = pick(row, COLUMNS.reference);
    const title = pick(row, COLUMNS.title);
    const errors: RowError[] = [];

    /*
     * The route decides the track now — /admin/import/land and
     * /admin/import/homes each pass their own `defaultType`, so a spreadsheet
     * no longer needs a `type` column and cannot silently import a home into
     * the land importer.
     *
     * A `type` column is still honoured when present, so CSVs written against
     * the old single-importer format keep working — but it has to agree with
     * the route, or the row is rejected rather than quietly redirected.
     */
    const typeRaw = pick(row, COLUMNS.type);
    let type = defaultType;
    if (typeRaw) {
      const declared = matchEnum(typeRaw, ListingType);
      if (!declared) {
        errors.push({
          column: "type",
          message: `Unrecognised type "${typeRaw}". Use land or home.`,
        });
        return { lineNumber, reference, title, errors };
      }
      if (declared !== defaultType) {
        errors.push({
          column: "type",
          message: `This row is "${typeRaw}", but you are using the ${defaultType === ListingType.LAND ? "land" : "homes"} importer.`,
        });
        return { lineNumber, reference, title, errors };
      }
      type = declared;
    }

    const estateSlug = pick(row, COLUMNS.estate);
    let estateId: string | null = null;
    if (estateSlug) {
      estateId = estatesBySlug.get(slugify(estateSlug)) ?? null;
      if (!estateId) {
        errors.push({
          column: "estate",
          message: `No estate matches "${estateSlug}".`,
        });
      }
    }

    /*
     * Missing required columns are reported here, in the spreadsheet's own
     * vocabulary, and the row stops. Letting it fall through to the schema
     * produced a second, more confusing error for the same cause.
     */
    for (const required of REQUIRED_COLUMNS[type]) {
      const raw = pick(row, COLUMNS[required.column]);
      if (!raw) {
        errors.push({
          column: required.label,
          message: `${required.label} is missing. Add a column for it — ${required.hint}.`,
        });
        continue;
      }
      // A value that is present but unreadable was being coerced to 0 and
      // then reported as "Too small", which points at the wrong problem.
      if (required.numeric && parseNum(raw) === null) {
        errors.push({
          column: required.label,
          message: `"${raw}" is not a number. ${required.label} should be ${required.hint}.`,
        });
      }
    }
    if (errors.length > 0) {
      return { lineNumber, reference, title, errors };
    }

    const candidate =
      type === ListingType.LAND
        ? buildLand(row, estateId)
        : buildHome(row, estateId);

    const schema =
      type === ListingType.LAND ? landListingSchema : homeListingSchema;
    const parsed = schema.safeParse(candidate);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push({
          column: columnLabel(issue.path),
          // Zod's own wording for a bad enum is a pipe-separated dump of the
          // internal constants. Replace it with the values as they would be
          // typed into a spreadsheet.
          message:
            issue.code === "invalid_value" || issue.code === "invalid_format"
              ? `That value is not one we recognise. Use one of: ${acceptedFor(columnLabel(issue.path))}.`
              : issue.message,
        });
      }
    }

    return {
      lineNumber,
      reference,
      title,
      errors,
      data: errors.length === 0 ? candidate : undefined,
    };
  });
}
