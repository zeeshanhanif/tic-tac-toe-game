// Design-token wiring (ADR-002 / plan §6 · ux-foundations).
//
// Transforms docs/tokens.json (W3C DTCG) into CSS custom properties that the UI
// shell consumes. This IS the design-system wiring: the shell never hand-copies
// token values — it reads the generated `:root` variables. Delete tokens.json's
// values and re-run, and the shell visibly breaks (verification §5).
//
// Run via `npm run gen:tokens` (also wired into predev/prebuild).

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const SRC = resolve(root, "docs/tokens.json");
const OUT_DIR = resolve(root, "src/ui/generated");
const OUT = resolve(OUT_DIR, "tokens.css");

const tokens = JSON.parse(readFileSync(SRC, "utf8"));

// Render a single DTCG token's $value to a CSS value string, by $type.
function renderValue(token) {
  const { $type, $value } = token;
  switch ($type) {
    case "fontFamily":
      return Array.isArray($value) ? $value.join(", ") : String($value);
    case "shadow": {
      const layers = Array.isArray($value) ? $value : [$value];
      return layers
        .map((s) => `${s.offsetX} ${s.offsetY} ${s.blur} ${s.spread} ${s.color}`)
        .join(", ");
    }
    default:
      // color, dimension, fontWeight, etc. — emit as-is.
      return String($value);
  }
}

// Walk a DTCG group, emitting `  --<prefix>-<path...>: <value>;` lines.
function emit(node, prefix, path = []) {
  const lines = [];
  for (const [key, val] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    if (val && typeof val === "object" && "$value" in val) {
      lines.push(`  --${[prefix, ...path, key].join("-")}: ${renderValue(val)};`);
    } else if (val && typeof val === "object") {
      lines.push(...emit(val, prefix, [...path, key]));
    }
  }
  return lines;
}

// Top-level group -> CSS variable prefix.
const GROUPS = {
  color: "color",
  space: "space",
  radius: "radius",
  typography: "font",
  elevation: "elevation",
  layout: "layout",
};

const lightVars = [];
for (const [group, prefix] of Object.entries(GROUPS)) {
  if (tokens[group]) lightVars.push(...emit(tokens[group], prefix));
}
// Dark theme: same roles as `color`, under colorDark.
const darkVars = tokens.colorDark ? emit(tokens.colorDark, "color") : [];

const banner =
  "/* AUTO-GENERATED from docs/tokens.json by scripts/gen-tokens.mjs — do not edit. */\n" +
  "/* Run `npm run gen:tokens` to regenerate. */\n";

const css =
  banner +
  "\n:root {\n" +
  lightVars.join("\n") +
  "\n}\n" +
  // Dark values apply when the user picks dark (data-theme) OR by OS default
  // (FR-THEME-001/002). data-theme wins so an explicit choice overrides the OS.
  "\n:root[data-theme=\"dark\"] {\n" +
  darkVars.join("\n") +
  "\n}\n" +
  "\n@media (prefers-color-scheme: dark) {\n" +
  "  :root:not([data-theme=\"light\"]) {\n" +
  darkVars.map((l) => "  " + l).join("\n") +
  "\n  }\n}\n";

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, css, "utf8");
console.log(
  `[gen:tokens] wrote ${OUT} — ${lightVars.length} light vars, ${darkVars.length} dark vars`,
);
