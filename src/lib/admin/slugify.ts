/**
 * Title → URL slug.
 *
 * Lives in its own module rather than beside the article action: every
 * export from a `"use server"` file must be an async function that becomes a
 * callable endpoint, and this is a pure string helper used on the client to
 * fill the slug field as someone types a title.
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    // Strip the combining marks NFKD just split off, so "Ògún" becomes "ogun".
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
