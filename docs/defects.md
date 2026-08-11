# Defect Ledger — Tic-Tac-Toe Game

Append-only record of defects (observed behavior violating an already-verified
requirement). Owned by the sdlc-orchestrator. Newest rows at the bottom.

| ID | Date | Owning FR / feature | Severity | Summary | Status |
| :- | :--- | :------------------ | :------- | :------ | :----- |
| DEF-001 | 2026-08-08 | FR-MODE-002/003 · FEAT-002 (setup) | Cosmetic | Two-player mode shows the vs-Computer-only Difficulty + "You play as" controls | Fixed |
| DEF-002 | 2026-08-09 | FR-AI-003 / NFR-PERF-002 · FEAT-003 (Hard AI) | CI-blocking | Un-memoized minimax exceeds the 500 ms perf test on slow CI hardware (931 ms observed) | Fixed |
| DEF-003 | 2026-08-11 | FR-STATS-005 / NFR-REL-001/002 · FEAT-004 (stats store) | Latent-crash | `loadState` guards only top-level truthiness, so a partially-corrupt persisted stats object (missing `vsComputer` sub-tree) passes and later crashes `recordResult`/`summarize` — violating the "reset on corrupt shape" contract | Fixed |

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
