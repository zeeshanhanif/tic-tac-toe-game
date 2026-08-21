# Acceptance Report: FEAT-007 — Light/dark theming

> Verdict: **Accepted** · Date: 2026-08-10
> Re-verification (DEF-004): **Accepted (holds)** · Date: 2026-08-16
> Re-verification (DEF-005): **Accepted (holds)** · Date: 2026-08-20
> Auditor: acceptance-verification (independent, standard re-derived from SRS /
> use-cases.md / technical-design §6 — not from tasks.md or the delivery summary)
> Implements: FR-THEME-001 (M), FR-THEME-002 (S), FR-THEME-003 (S) · Realizes: UC-08

## DEF-005 re-verification — 2026-08-20 (Accepted, holds)

> Repo state audited: `49bc57c` · Fix under audit: `576bbf6`

Scoped to this feature's share of **DEF-005**: the theme-toggle segments — present
on every screen (AC-2) — measured **32 px** tall against the 44 px floor
NFR-USE-002 requires and design.md §9 rule 4 applies to every control.

- **Fix audited:** `min-height` / `min-width: var(--layout-touchTargetMin)` plus
  flex centering on `.toggle .seg-opt`. No JS, token or markup changes.
- **Design-system check:** design.md's `toggle` spec fixes the container's
  padding (3 px), radius (999) and label type (13/700) but states **no segment
  height**, so raising it to 44 px conforms to rule 4 rather than forking the
  spec — no design-system escalation needed. The visible consequence is a taller
  pill in the top bar, confirmed by browser screenshot to read as a deliberate
  control.
- **Failing test first:** red at 32 px before the fix; green at 44 px after.
- **Feature criteria re-checked:** AC-1 (instant switch), AC-2 (toggle on Setup /
  Game / Stats), AC-3 (OS default), AC-4 (persists across reload) and the DEF-004
  `color-scheme` narrowing all re-run green — the segments' box changed, their
  roles, names and handlers did not.
- **`min-width` caveat:** it does not bind today (labels + padding already exceed
  44 px), so the width half of the guard proves nothing about the current UI. It
  is forward-insurance for a shorter or localized label; recorded so the test is
  not over-read as evidence.
- **Verdict:** **Accepted (holds)** — theming behaviour unchanged, the NFR breach
  closed and guarded at desktop, 390 px and 320 px viewports. RTM unchanged.

## DEF-004 re-verification — 2026-08-16 (Accepted, holds)

> Repo state audited: `01db68d` · Fix under audit: `d66a80d`

Triggered by the milestone code review. **DEF-004:** `color-scheme` was pinned to
`light dark` on `:root` and never narrowed per theme, so while the token palette
followed `data-theme`, the UA kept resolving scrollbars and the pre-paint canvas
from `prefers-color-scheme` alone — a dark page framed in light chrome on a
light-mode OS. This was a **latent gap in AC-1**: the criterion says the theme
"applies immediately (`data-theme` flips; colors change without reload)", which
the token layer satisfies on its own. FR-THEME-001 ("let the user switch between
light and dark themes") governs the application's appearance, not just its custom
properties — so AC-1 under-encoded its FR, the same pattern DEF-003 exposed in
AC-6.

- **Fix audited** (`fix(DEF-004)`, `d66a80d`): adds
  `:root[data-theme="light"] { color-scheme: light }` and the `dark` counterpart
  to `src/style.css`, leaving the bare `:root { color-scheme: light dark }`
  default in place. No JS or token changes; `theme.ts` is untouched.
- **Failing test first:** the regression case was written before the fix and
  observed red against the pre-fix bundle —
  `Expected: "dark" / Received: "light dark"` at `theme.spec.ts:51`.
- **Test corrected during this audit** (`01db68d`): the fix's third assertion
  block claimed to cover the bare-`:root` default but was **tautological** — the
  anti-FOUC script always writes a concrete `data-theme`, so the narrowing rule
  satisfied it and the bare rule had **zero** coverage (deleting it left every
  theme test green). Split into a case that removes `data-theme` explicitly and
  asserts `light dark`. **Mutation-checked:** deleting the bare rule now fails it
  with `normal`, confirming the rule is load-bearing and that
  `<meta name="color-scheme">` does *not* feed the computed CSS property.
- **AC re-check:** AC-1 now holds in both directions (light OS + Dark choice →
  `dark`; dark OS + Light choice → `light`). AC-3 (OS default, no saved choice)
  and AC-5 (explicit choice wins) unaffected and re-observed green. **AC-6**
  (NFR-REL-002) re-verified directly under a `localStorage` that throws on
  access: the app boots, applies the OS-default theme, toggling still works for
  the session, `color-scheme` narrows correctly, and **zero page errors** were
  captured.
- **Independent execution (this run, current repo state):** ESLint clean ·
  **71 unit tests** green · **14 E2E** green (13 committed + the throwaway AC-6
  storage-dead probe, run from the harness and removed afterward) · `tsc` +
  Vite build clean.
- **Scope note (review-driven, 2026-08-16):** `index.html:7`'s
  `<meta name="color-scheme" content="light dark">` is **deliberately not**
  narrowed, though DEF-004's observation names it. In the production bundle the
  render-blocking `<link rel="stylesheet">` follows the anti-FOUC script, so the
  narrowed CSS wins before first paint and the symptom is unobservable. It
  remains reproducible under `npm run dev`, where `style.css` is JS-injected —
  a **dev-server-only** artifact. Left open rather than patched because the
  meta's effect is not observable through computed style (see the mutation
  result above), so any fix would ship unverifiable and unguarded. Recorded in
  the ledger and surfaced to the user rather than self-resolved.
- **Verdict:** **Accepted (holds)** — the user-facing defect is closed and now
  genuinely guarded. DEF-004 → **Fixed**. RTM unchanged (Test ref for
  FR-THEME-001/002/003 already points at this report).

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
