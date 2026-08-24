import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Unit tests only — no DOM, no database.
 *
 * 03_IMPLEMENTATION_PLAN.md Phase 6 singles out track routing as "the piece
 * most likely to break silently", which is why it is pure and tested here.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
