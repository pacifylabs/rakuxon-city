import type { ReactNode } from "react";
import { ColumnRules } from "@/components/ui/container";

/**
 * The public shell. Header and footer arrive with the landing page in Phase 3;
 * the column rules sit here so they run behind every public page at full height,
 * as they do in the reference layout.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ColumnRules />
      {children}
    </>
  );
}
