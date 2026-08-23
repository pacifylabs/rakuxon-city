import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ColumnRules } from "@/components/ui/container";

/**
 * The public shell. The column rules sit here so they run behind every public
 * page at full height, as they do in the reference layout.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ColumnRules />
      <Header />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
    </>
  );
}
