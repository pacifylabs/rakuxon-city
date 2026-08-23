import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Prettier owns formatting; this switches off the rules that would fight it.
  prettier,
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Prisma Client is generated output, not source.
    "src/generated/**",
    // A CommonJS require hook by necessity — it patches module loading before
    // any ESM can run. See the file for why it exists.
    "scripts/server-only-stub.cjs",
  ]),
]);

export default eslintConfig;
