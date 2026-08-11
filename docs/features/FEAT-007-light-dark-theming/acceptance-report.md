# Acceptance Report: FEAT-007 — Light/dark theming

> Verdict: **Accepted** · Date: 2026-08-10
> Auditor: acceptance-verification (independent, standard re-derived from SRS /
> use-cases.md / technical-design §6 — not from tasks.md or the delivery summary)
> Implements: FR-THEME-001 (M), FR-THEME-002 (S), FR-THEME-003 (S) · Realizes: UC-08

## Verdict summary

FEAT-007 is **accepted** — verified. The standard (switch light/dark; default to
the OS preference on first load; persist the choice) was re-derived from the FR
statements and UC-08, then checked against the code, the tests, and direct
in-browser observation. **58 unit tests** and **11 E2E tests** pass fresh from
repo state; `tsc` build and ESLint (module boundaries) are clean. **No rework or
design-defect findings.** Two non-blocking minors.

**Rework:** none. **Design defect:** none.

## Standard cross-check (sources → criteria)

Every implemented FR is covered by a criterion; UC-08's alternate flow (0a first
load → OS default) is represented; criteria are faithful to their FRs.

| FR / UC | Statement (abbrev.) | Criterion |
| :------ | :------------------ | :-------- |
| FR-THEME-001 | switch between light and dark | AC-1, AC-2 |
| FR-THEME-002 | default to OS color-scheme on first load | AC-3, AC-5 |
| FR-THEME-003 | persist the selection in localStorage | AC-4 |
| UC-08 main | toggle → apply immediately → persist | AC-1, AC-4 |
| UC-08 0a | first load → OS default | AC-3 |
| NFR-REL-002 | graceful storage fallback | AC-6 |

No gap, no misencoding — nothing to route as a design defect.

## Criterion-by-criterion audit

| AC | Requirement | Test / observation | Faithful? | Result |
| :- | :---------- | :----------------- | :-------- | :----- |
| AC-1 | FR-THEME-001 / UC-08 — instant switch | `theme.spec` clicks Dark/Light → `html[data-theme]` flips without reload | yes | green |
| AC-2 | FR-THEME-001 / plan — toggle on every screen | `theme.spec` asserts Light+Dark buttons visible on Setup, Game, Stats | yes | green |
| AC-3 | FR-THEME-002 / UC-08 0a — OS default | `theme.test` (`resolveInitialTheme(null,·)` → OS branch, both ways) **+ direct audit observation** (Playwright `colorScheme:dark`, no saved → `data-theme=dark`) **+** `theme.spec` (headless light) | yes | green |
| AC-4 | FR-THEME-003 / UC-08.3 — persists across reload | `theme.spec`: `localStorage["ttt:theme:v1"] === '"dark"'`, then `reload()` keeps `data-theme=dark` | yes | green |
| AC-5 | FR-THEME-002/003 — explicit choice wins | `theme.test`: `resolveInitialTheme("light", prefersDark=true)==="light"`; corrupt → OS | yes | green |
| AC-6 | NFR-REL-002 — graceful without localStorage | Theme Controller uses `createStorageRepo()`; its in-memory fallback is unit-tested (`storage.test.ts`); `initTheme`/`setTheme` cannot throw (repo swallows) | yes (by construction) | green |

- **Assertions bite:** AC-4 asserts the exact persisted value (`'"dark"'`) and a
  post-`reload()` attribute — a non-persisting toggle or a broken anti-FOUC init
  would fail it. AC-1 asserts the attribute flips on click (not a proxy). AC-3's
  OS-dark path was **observed directly**, not merely inferred from the resolver.
- **Anti-fake-green (test diff `b1fc3a2..HEAD`):** **purely additive** — two new
  files (`theme.test.ts` +23, `theme.spec.ts` +53); **no existing test touched,
  weakened, skipped, or deleted** (verified: zero deletions in prior test files).

## Independent execution (this run)

- **Unit (vitest):** 7 files, **58 passed** (incl. 3 new resolver tests).
- **Build (`tsc && vite build`):** clean.
- **Lint (eslint, incl. ADR-003 boundaries):** clean — `ui/theme.ts` imports only
  `infra/storage.ts` (ui→infra legal); `dom.ts`→`theme.ts` is ui→ui.
- **E2E (playwright):** **11 passed**, incl. the 2 new theme tests; CF-1/CF-2 and
  the DEF-001 setup guard unaffected by the `themeToggle()` refactor.
- **Direct observation (Phase 5, throwaway spec, removed):** OS-dark emulation +
  no saved choice → first paint `data-theme="dark"` — AC-3's OS branch confirmed
  end-to-end; tree left clean.

## Direct requirement & conformance verification

- **Anti-FOUC init (D1):** the inline `<head>` script and `ui/theme.ts` share the
  key `ttt:theme:v1` (verified identical). The reload-persistence E2E exercises
  the full round-trip (module writes JSON `"dark"` → inline script reads/parses it
  on next load), so D1 is behaviourally proven, not just present.
- **Design conformance:** `ui/theme.ts` and `dom.ts` contain **no raw color
  values**; the toggle reuses the existing `.toggle` component unchanged; the
  Stats-header supplement uses a token-driven `.topbar-actions` layout helper. The
  only raw strings in the new `index.html` snippet are the storage key and the
  resolution logic (D1 — logic, not a styling value; a documented contract).
  Manifest SCR-WEB-004 `theme-toggle` supplement is accurate.

## Minor, non-blocking observations

1. **AC-6 has no dedicated new test** — it rests on the existing StorageRepo
   fallback suite plus the no-throw construction of the Theme Controller. Adequate
   for a best-effort reliability NFR; a targeted "theme works with localStorage
   disabled" E2E could be added later but is not required.
2. **D1 duplicates the key + resolution in raw `<head>` JS** (it cannot import the
   module synchronously pre-paint). This is the standard anti-FOUC tradeoff and is
   documented as a contract; a future key/logic change must touch both sites.
   Recorded, not blocking.

## Traceability

Accepted → **Test ref appended** to the RTM for FR-THEME-001, FR-THEME-002, and
FR-THEME-003 with `features/FEAT-007-light-dark-theming/acceptance-report.md`,
closing each requirement's Plan → Design → Test lifecycle.
</content>
