import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "**/node_modules/**",
    "**/.venv/**",
    "**/dist/**",
    // Scratch/test scripts at project root - not part of the Next.js app
    "test_*.ts",
    "test_*.js",
    "test-*.ts",
    "test-*.js",
  ]),
]);

export default eslintConfig;
