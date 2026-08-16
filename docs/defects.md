# Defect Ledger — Tic-Tac-Toe Game

Append-only record of defects (observed behavior violating an already-verified
requirement). Owned by the sdlc-orchestrator. Newest rows at the bottom.

| ID | Date | Owning FR / feature | Severity | Summary | Status |
| :- | :--- | :------------------ | :------- | :------ | :----- |
| DEF-001 | 2026-08-08 | FR-MODE-002/003 · FEAT-002 (setup) | Cosmetic | Two-player mode shows the vs-Computer-only Difficulty + "You play as" controls | Fixed |
| DEF-002 | 2026-08-09 | FR-AI-003 / NFR-PERF-002 · FEAT-003 (Hard AI) | CI-blocking | Un-memoized minimax exceeds the 500 ms perf test on slow CI hardware (931 ms observed) | Fixed |
| DEF-003 | 2026-08-11 | FR-STATS-005 / NFR-REL-001/002 · FEAT-004 (stats store) | Latent-crash | `loadState` guards only top-level truthiness, so a partially-corrupt persisted stats object (missing `vsComputer` sub-tree) passes and later crashes `recordResult`/`summarize` — violating the "reset on corrupt shape" contract | Fixed |
| DEF-004 | 2026-08-15 | FR-THEME-001 · FEAT-007 (theming) | Visible | `color-scheme` is pinned to `light dark` and never narrowed per theme, so an explicit theme choice does not reach UA-rendered chrome (scrollbars, pre-paint canvas) | Fixed |
| DEF-005 | 2026-08-15 | NFR-USE-002 · FEAT-007 (theme toggle) / FEAT-005 (footer link) | Visible | Theme-toggle segments (~30px) and the `.footer .link` stats entry point omit `min-height: var(--layout-touchTargetMin)`, breaching the 44×44 touch minimum | Open |
| DEF-006 | 2026-08-15 | FR-STATS-003 · FEAT-005 (stats view) | Stale-data | Navigating Game → Stats does not cancel the pending AI timer, so a game can finish behind the user and the already-snapshotted Stats view shows counts one game behind | Open |

---

## DEF-003 — Partially-corrupt persisted stats passes the load guard

- **Observed (code review, 2026-08-11):** `infra/stats-store.ts` `loadState`
  guards only top-level truthiness
  (`!loaded || loaded.version !== STATS_VERSION || !loaded.stats || !loaded.history`).
  A same-version object with a **partial `stats` tree** — e.g.
  `{version:1, stats:{twoPlayer:{…}}, history:[]}` missing the `vsComputer`
  sub-tree — passes the guard unchanged.
- **Owning feature:** FEAT-004 (Stats Service + Storage Repository). The guard's
  own comment claims *"reset to empty on version mismatch or corrupt shape
  (architecture §8 / NFR-REL-001)"* — so the code violates its stated contract.
- **Impact:** **Latent crash.** On the next vs-Computer game,
  `recordResult` reads `state.stats.vsComputer[diff]` → `undefined`, then
  `{...bucket, [key]: bucket[key] + 1}` throws
  *"Cannot read properties of undefined"*; `summarize()` crashes the same way when
  the Stats view opens. Reachable via hand-edited storage or a future migration
  bug at the same schema version — the version guard does **not** catch it.
- **Root cause:** shallow shape validation — truthiness of `stats`/`history`
  instead of validating the full `StatsState` shape.
- **Fix:** a **pure `isValidStatsState(x)` type-guard** in `core/stats.ts`
  (validates `version`, both `stats.twoPlayer` and `stats.vsComputer.{easy,
  medium,hard}` as WLD triples, **and every `history` entry as a well-formed
  `MatchRecord`** via `isMatchRecord`); `loadState` resets to `emptyStatsState()`
  whenever it fails. Subsumes the old version + truthiness checks; the narrowing
  is now sound (every field consumers read is checked).
- **Scope note (review-driven, 2026-08-11):** history *element* validation was
  initially scoped out, but the per-feature review gate flagged that a malformed
  `history` entry still passes → `historyRow`'s `cap(r.result)` crashes the stats
  view — the same "corrupt shape crashes a consumer" class this defect targets.
  So the fix was **completed** to validate history elements, honoring the full
  NFR-REL-001 contract. Still deliberately out of scope: numeric-range checks
  (negatives / overflow-Infinity via tampering) — see review findings #3/#4,
  non-crashing data-integrity notes.
- **Regression guard:** `core/stats.test.ts` (isValidStatsState accepts good
  states, rejects partial/missing/non-numeric shapes **and malformed history
  elements**) + `infra/stats-store.test.ts` (partial-corrupt persisted data →
  resets to empty; a subsequent vs-Computer `record()` no longer throws;
  **malformed history entry → resets to empty**).
- **Verification:** failing tests written first (partial-corrupt load, then the
  malformed-history case), fixed after each; FEAT-004 re-verified — see its
  acceptance report's DEF-003 re-verification.

## DEF-001 — Two-player shows vs-Computer controls

- **Observed:** On the Setup screen with **2 Players** selected, the Difficulty
  segmented control and the "You play as" side pills are visible. They are
  vs-Computer-only and should be hidden in two-player mode (FEAT-002 design /
  AC-1 "selecting Vs. Computer *reveals* the difficulty and side controls";
  ux-foundations SCR-WEB-001 "2-player hides them").
- **Discovered:** during FEAT-003 implementation (visual check of the Setup
  screen), 2026-08-08.
- **Owning feature:** FEAT-002 (setup view). The hide logic
  (`diffField.hidden = !vsComputer`) shipped in FEAT-002 but was only ever
  screenshotted in the vs-Computer state, so it slipped past acceptance.
- **Impact:** **Cosmetic only.** Functionally harmless — `onStart` includes
  `difficulty`/`humanMark` only for `mode === "vs-computer"`, so a two-player
  game already ignores them. No wrong game is started.
- **Root cause:** CSS specificity. `src/style.css` has `.field { display: flex }`,
  which overrides the user-agent rule `[hidden] { display: none }` (a class
  selector beats an attribute selector on the UA sheet). So setting the `hidden`
  attribute on a `.field` element has no visual effect.
- **Fix:** add `.field[hidden] { display: none }` to `src/style.css` so the
  `hidden` attribute wins for `.field` elements. (One line; no logic change —
  `setup.ts` already sets `hidden` correctly.)
- **Regression guard:** `tests/e2e/setup.spec.ts` — asserts two-player hides the
  Difficulty control and vs-Computer reveals it.
- **Verification:** fix applied, E2E green (setup.spec + CF-1), and confirmed by
  browser observation that two-player no longer shows the controls.

## DEF-002 — Minimax perf test flakes on slow CI hardware

- **Observed:** the FEAT-003 perf test ("Hard computes the first move within
  500 ms", AC-5 / NFR-PERF-002) **failed in GitHub CI**: the empty-board minimax
  took **931 ms** > 500 ms. Passes locally (faster machine).
- **Discovered:** GitHub Actions `Run npm test`, 2026-08-09.
- **Owning feature:** FEAT-003 (Hard AI). FEAT-003's acceptance report already
  flagged AC-5 perf as "machine-indicative" — this is that risk materializing.
- **Impact:** CI-blocking (red pipeline). No product defect — Hard plays
  correctly and, in a real browser (warm V8), well under budget; but the
  un-memoized full-tree search is slow on a shared CI runner.
- **Root cause:** `minimax` re-explores the whole game tree un-memoized
  (~549k node visits from the empty board). Slow single-thread CI hardware
  pushes the worst-case first move over the 500 ms assertion.
- **Fix:** **memoize** minimax by board+turn within each `chooseMove` call
  (architecture §11: "no memoization needed but trivial to add"). There are only
  ~5,478 reachable (board, to-move) positions, each computed once — near-instant
  on any hardware. Pure optimization: board uniquely determines depth (= filled
  cells), so depth-weighted values are cache-correct, and returned values are
  identical → the optimal move (and the never-lose guarantee) is unchanged.
- **Regression guard:** the existing perf test (now passes with ~25× margin) +
  the exhaustive never-lose tests (unchanged, re-run in FEAT-003 re-verification).
- **Verification:** all 53 unit tests green locally incl. perf; FEAT-003
  re-verified (never-lose mutation check still bites; perf now robust).

## DEF-004 — Explicit theme choice does not reach UA-rendered chrome

- **Observed (milestone code review, 2026-08-15):** `src/style.css:15` sets
  `:root { color-scheme: light dark; }` and `index.html:7` carries the matching
  `<meta name="color-scheme" content="light dark">`. Neither is ever narrowed
  per theme, while the palette follows `data-theme` (`src/ui/theme.ts:18-20`).
- **Owning feature:** FEAT-007 (Theme Controller).
- **Impact:** **Visible mismatch.** On a light-mode OS, choosing "Dark" flips
  every token but leaves the UA resolving light-vs-dark from
  `prefers-color-scheme` alone — scrollbars, the pre-paint canvas colour and any
  UA-styled widget stay light, framing a dark page in light chrome (and the
  inverse for a dark-mode OS choosing "Light"). FR-THEME-001 asks the choice to
  apply to the application, not to the token layer only.
- **Root cause:** `color-scheme` was set once as a static capability
  declaration; the FEAT-007 theming work added `data-theme` switching without
  bringing `color-scheme` under it.
- **Fix** (`fix(DEF-004)`, `d66a80d`): added `:root[data-theme="dark"] {
  color-scheme: dark; }` and `:root[data-theme="light"] { color-scheme: light; }`.
  The `light dark` default on bare `:root` stays, so the pre-choice OS default is
  unaffected. CSS only — no JS or token changes.
- **Scope note (review-driven, 2026-08-16):** `index.html:7`'s
  `<meta name="color-scheme" content="light dark">` is **deliberately not**
  narrowed. In the production bundle the render-blocking stylesheet follows the
  anti-FOUC script, so the narrowed CSS wins before first paint — the symptom is
  unobservable to users. It stays reproducible under `npm run dev` (JS-injected
  CSS), a **dev-server-only** artifact. Not patched because the meta's effect is
  not observable through computed style, so a fix would ship unverifiable and
  unguarded. **Open question surfaced to the user**, not self-resolved.
- **Regression guard:** `tests/e2e/theme.spec.ts` — the computed `color-scheme`
  follows an explicit choice in both directions (light OS + Dark, dark OS +
  Light), plus a separate case asserting the `light dark` fallback with
  `data-theme` absent. The second case was added during acceptance
  (`01db68d`) after the review gate found the original block tautological; it is
  mutation-checked (deleting the bare rule fails it with `normal`).
- **Verification:** failing test first (red against the pre-fix bundle:
  `Expected "dark" / Received "light dark"`); after the fix, ESLint clean,
  71 unit + 14 E2E green, incl. a direct AC-6 probe under a throwing
  `localStorage` (no page errors). FEAT-007 re-verified — see its acceptance
  report's DEF-004 re-verification.

## DEF-005 — Two interactive controls breach the 44×44 touch minimum

- **Observed (milestone code review, 2026-08-15):** `.toggle .seg-opt`
  (`src/style.css:93`) sets only `padding: 6px 12px` at `--font-size-sm` (~30px
  tall), and `.footer .link` (`src/style.css:616`) likewise omits a minimum.
- **Owning feature:** FEAT-007 (theme toggle) and FEAT-005 (footer stats link).
- **Impact:** **NFR-USE-002 breach** — the SRS states interactive targets *shall*
  be at least 44×44 CSS pixels on touch devices. The footer link is the primary
  entry point to the Stats view on both Setup and Game, and the theme toggle is
  present on every screen, so both are high-traffic touch targets.
- **Root cause:** omission, not a deliberate exception — every other interactive
  control in the sheet sets `min-height: var(--layout-touchTargetMin)`
  explicitly (`.mode`, `.seg button`, `.pill`, `.btn`, `.back`, `.cell`).
- **Proposed fix:** add `min-height: var(--layout-touchTargetMin)` to both rules,
  matching the established pattern. No token changes.
- **Regression guard:** an E2E assertion on the bounding-box height of the theme
  toggle segments and the footer link.

## DEF-006 — Stats view can show counts one game behind

- **Observed (milestone code review, 2026-08-15):** `src/ui/views/game.ts:194`
  wires the stats link straight to `handlers.onViewStats` with no `cancelAI()`,
  unlike the Menu path (line 123) which cancels. `createStatsView` snapshots
  `statsStore.snapshot()` once at construction (`src/ui/views/stats.ts:35`).
- **Owning feature:** FEAT-005 (stats view / game↔stats navigation).
- **Impact:** **Stale data.** In vs-Computer, a human move that puts the AI on
  match point followed by an immediate click on "View stats & history" leaves the
  400 ms AI timer armed on the detached game view; it fires, the AI wins, and
  `recordIfEnded()` writes to the shared store — after the Stats view has already
  snapshotted. The tiles and history render one game behind, so the summary stops
  reconciling with reality until the view is re-entered (FR-STATS-003).
- **Root cause:** the Game view's timer lifetime is tied to the Menu path only,
  not to navigation generally; the Stats view reads the store once.
- **Proposed fix:** two candidates — cancel the AI timer on the stats-link path,
  or have the Stats view re-read the snapshot on render. Cancelling changes game
  behaviour (the pending AI move is deferred until Back); re-reading does not.
  **Preferred: re-read on render**, which also covers any future writer.
- **Regression guard:** an E2E case that navigates to Stats inside the AI delay
  window and asserts the totals include the just-finished game.
