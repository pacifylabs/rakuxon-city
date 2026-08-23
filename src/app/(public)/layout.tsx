import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ColumnRules } from "@/components/ui/container";
import { getPlacement } from "@/lib/media";

/**
 * The public shell. The column rules sit here so they run behind every public
 * page at full height, as they do in the reference layout.
 */
/** Falls back to the committed file if the slot is ever missing, so a bad
 *  placement cannot leave the site without a logo. */
const LOGO_FALLBACK = {
  url: "/logo.png",
  alt: "Rakuxon City",
  width: 2172,
  height: 724,
};

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const logo = (await getPlacement("site.logo")) ?? LOGO_FALLBACK;

  return (
    <>
      <ColumnRules />
      <Header logo={logo} />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
    </>
  );
}
