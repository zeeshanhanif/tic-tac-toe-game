// Flat ESLint config. Beyond baseline TS linting, it makes the architecture's
// module boundaries (ADR-003: dependencies point inward — UI → core, never the
// reverse) enforceable by tooling, not discipline.

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  { ignores: ["dist", "src/ui/generated", "scripts", "*.config.*"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      // Honor the `_`-prefix convention for intentionally-unused args/vars
      // (matches tsc's noUnusedParameters behavior).
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Domain core is pure — it must not reach into the UI shell or infra.
    files: ["src/core/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/ui/**", "**/infra/**"],
              message:
                "Domain core must not import UI or infra (ADR-003: dependencies point inward).",
            },
          ],
        },
      ],
    },
  },
  {
    // Infra may depend on core, never on the UI.
    files: ["src/infra/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/ui/**"],
              message: "Infrastructure must not import the UI shell (ADR-003).",
            },
          ],
        },
      ],
    },
  },
  {
    // Test files may use vitest globals-free imports; relax nothing else.
    files: ["src/**/*.test.ts"],
    rules: {},
  },
);
