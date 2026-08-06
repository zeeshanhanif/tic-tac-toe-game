/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";

// Static SPA (ADR-001). Served at the domain root on Vercel — no `base` override.
// Vitest reads this config; the domain core is tested in the default node env.
export default defineConfig({
  build: { outDir: "dist" },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
