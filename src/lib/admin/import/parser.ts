import "server-only";

/**
 * A small RFC 4180 CSV parser.
 *
 * Deliberately not a dependency. The importer accepts one known shape —
 * listing rows exported from a spreadsheet — and the two things that
 * actually break naive `split(",")` parsing are quoted fields containing
 * commas and escaped double-quotes inside them. Both are handled below in
 * about forty lines, which is cheaper to audit than adding papaparse to a
 * Next 16 build for a single admin screen.
 *
 * Handles: quoted fields, `""` escapes inside quotes, CRLF and LF, and a
 * trailing newline. Does not handle: multi-character delimiters, or comment
 * lines — neither of which appear in a spreadsheet export.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  // Strip a UTF-8 BOM — Excel writes one, and it would otherwise become part
  // of the first header name and break every column match.
  const input = text.replace(/^﻿/, "");

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  // A file not ending in a newline still has one row left in the buffer.
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop fully blank lines, which spreadsheets leave at the end constantly.
  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
}

/** Header row → normalised keys, so `Plot Size` and `plot_size` both match. */
export function normaliseHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

export type CsvTable = {
  headers: string[];
  /** Each row keyed by its normalised header. */
  rows: Record<string, string>[];
};

export function toTable(text: string): CsvTable {
  const raw = parseCsv(text);
  if (raw.length === 0) return { headers: [], rows: [] };

  const headers = raw[0].map((h) => h.trim());
  const keys = headers.map(normaliseHeader);

  const rows = raw.slice(1).map((cells) => {
    const record: Record<string, string> = {};
    keys.forEach((key, index) => {
      record[key] = (cells[index] ?? "").trim();
    });
    return record;
  });

  return { headers, rows };
}
