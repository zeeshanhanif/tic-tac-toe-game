# Tasks: FEAT-007 — Light/dark theming

> Design: technical-design.md · UI: ui-design.md (global toggle, no new SCR)
> Implements FR-THEME-001 (M), FR-THEME-002 (S), FR-THEME-003 (S) · UC-08.
> Ordered controller → wiring → global presence → E2E → verify. Each task:
> implement + run its done-when, then commit. Never weaken/skip tests to pass.

- [x] **T1 — Theme Controller + pure resolver (`ui/theme.ts`).** Add `Theme`,
  `THEME_KEY`, pure `resolveInitialTheme(saved, prefersDark)`, and the singleton
  `initTheme()` / `getTheme()` / `setTheme()` over `createStorageRepo()`
  (Design §3.1, §7 D2/D3).
  - **Done when:** new Vitest suite `src/ui/theme.test.ts` covers
    `resolveInitialTheme`: saved "light"/"dark" wins over `prefersDark`; `null`
    and corrupt values → OS branch (both `prefersDark` true/false). `npm test`
    green, `npm run lint` clean (ui→infra only). **Serves AC-3, AC-5.**

- [x] **T2 — Wire persistence + apply (dom.ts, main.ts, index.html).** Route
  `themeToggle()` (dom.ts) through `getTheme()`/`setTheme()` (persist + apply,
  no markup change); call `initTheme()` in `main.ts` before `mountShell()`; add
  the anti-FOUC inline `<head>` script to `index.html` (Design §3.2/§3.3, §7 D1).
  - **Done when:** `npm run build` (tsc) + `npm run lint` pass; in-browser: the
    toggle switches theme instantly and the choice survives a reload.
    **Serves AC-1, AC-4.**

- [ ] **T3 — Global toggle presence (`ui/views/stats.ts`).** Add the theme
  toggle to the Stats header (Setup/Game already have it via `topbar()`), per
  ui-design. Keep the Back control; toggle placed per SCR-WEB-004 header spec.
  - **Done when:** `npm run build` + `npm run lint` pass; in-browser the toggle
    appears and works on the Stats screen. **Serves AC-2.**

- [ ] **T4 — Feature E2E (`tests/e2e/theme.spec.ts`, new).** Not a CF smoke
  (architecture §8) — a focused feature test (Design §8): (a) toggling flips
  `html[data-theme]` and persists to `localStorage`; (b) the choice survives
  `page.reload()`; (c) the toggle is present on Setup, Game, and Stats.
  - **Done when:** `npx playwright test theme` passes headless; full E2E suite
    still green. **Serves AC-1, AC-2, AC-4.**

- [ ] **T5 — Verification task (feature done-check).** Run fresh: `npm test`,
  `npm run build`, `npm run lint`, `npx playwright test`. Confirm AC-1..AC-6 each
  demonstrated by a passing test or recorded in-browser observation (AC-6:
  localStorage-unavailable path — StorageRepo fallback, spot-checked). Fix any
  red; no skips/weakenings.
  - **Done when:** all suites green; AC coverage table checked; FEAT-007
    developer-done, ready for acceptance-verification.

## AC → task coverage

| AC | Requirement | Task(s) |
| :- | :---------- | :------ |
| AC-1 | FR-THEME-001 / UC-08 — instant switch | T2, T4 |
| AC-2 | FR-THEME-001 / plan — toggle on every screen | T3, T4 |
| AC-3 | FR-THEME-002 / UC-08 0a — OS default first load | T1 |
| AC-4 | FR-THEME-003 / UC-08.3 — persists across reload | T2, T4 |
| AC-5 | FR-THEME-002/003 — explicit choice wins | T1 |
| AC-6 | NFR-REL-002 — graceful without localStorage | T1 (fallback) / T5 |
</content>
