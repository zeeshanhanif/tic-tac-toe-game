// Theme Controller (architecture §5 — UI Shell). Resolves the initial theme
// (an explicit saved choice wins over the OS preference), applies it as
// `data-theme` on <html>, and persists changes via the Storage Repository.
// FR-THEME-001/002/003, UC-08. ui → infra is allowed (ADR-003).

import { createStorageRepo, type StorageRepo } from "../infra/storage.ts";

export type Theme = "light" | "dark";
export const THEME_KEY = "ttt:theme:v1";

// Pure: an explicit saved "light"/"dark" wins over the OS default; any other
// value (null / corrupt) falls back to the OS preference (FR-THEME-002/003).
export function resolveInitialTheme(saved: Theme | null, prefersDark: boolean): Theme {
  if (saved === "light" || saved === "dark") return saved;
  return prefersDark ? "dark" : "light";
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
}

function prefersDark(): boolean {
  return typeof matchMedia !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches;
}

const repo: StorageRepo = createStorageRepo();
let current: Theme = "light";

/** Resolve + apply the initial theme and seed `current` (call once on boot). */
export function initTheme(): void {
  current = resolveInitialTheme(repo.load<Theme | null>(THEME_KEY, null), prefersDark());
  applyTheme(current);
}

/** The currently applied theme. */
export function getTheme(): Theme {
  return current;
}

/** Apply + persist a theme choice (FR-THEME-001/003). */
export function setTheme(theme: Theme): void {
  current = theme;
  applyTheme(theme);
  repo.save(THEME_KEY, theme);
}
