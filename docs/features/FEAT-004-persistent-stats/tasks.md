# Tasks: FEAT-004 — Persistent stats recording

> Executes: docs/features/FEAT-004-persistent-stats/technical-design.md
> Status: ALL DONE (developer-done) · Last updated: 2026-08-08
> Data-model + storage + store ACs by 18 Vitest tests (core/stats, infra/storage,
> infra/stats-store); recording + once-only + persist/restore (2→3 across reload)
> verified in-browser via the ttt:stats:v1 key; 44 unit + 6 E2E green; boundaries
> clean. Client-only SPA — §4 "schema" is the localStorage persistence format, realized
> in code (no migrations). No E2E task: FEAT-004 has no user-visible surface (the
> stats view is FEAT-005 / CF-2); recording is covered by unit + integration
> tests with an injected backend. No screens → ui-design skipped.

- [x] T1 — Domain: `src/core/stats.ts` — types (`GameResult`, `WLD`, `Stats`,
      `MatchRecord`, `StatsState`), `STATS_VERSION`, `emptyStatsState`,
      `recordResult(state, record)` (pure tally + append), `resultOf(status,
      perspective)`. Move `GameMode` into core; re-export from `ui/config.ts`
      (D3). Re-export from `core/index.ts` (design §3.1; FR-STATS-001/002).
      Done when: unit tests pass for AC-1 (increments twoPlayer / vsComputer[dif]
      buckets), AC-2 (appends a MatchRecord with result/mode/difficulty/timestamp),
      and `resultOf` (win/loss/draw from a perspective mark).

- [x] T2 — Infra: `src/infra/storage.ts` — `createStorageRepo(backend?)`
      Storage Repository (ADR-004): JSON load/save under versioned keys,
      injectable backend, graceful in-memory fallback (design §3.2, §4;
      NFR-REL-002). Depends T1 (none, but paired).
      Done when: unit tests pass for save→load round-trip, missing/corrupt →
      fallback (AC-6), and an unavailable/throwing backend → in-memory, no throw
      (AC-5).

- [x] T3 — Infra: `src/infra/stats-store.ts` — `createStatsStore(repo?)`:
      load persisted `StatsState` on creation (version mismatch/corrupt →
      `emptyStatsState`), `record()` = `core.recordResult` then persist,
      `snapshot()` (design §3.3; FR-STATS-005/007). Depends T1, T2.
      Done when: unit tests pass for AC-3 (record increments + appends once),
      AC-4 (a second store over the *same* backend restores the persisted state),
      AC-6 (corrupt persisted blob → resets to empty on load).

- [x] T4 — UI wire: `src/ui/shell.ts` instantiates `createStatsStore()` once and
      threads it to `createGameView`; `src/ui/views/game.ts` records **exactly
      once** on the transition to a terminal status (perspective per D2), reset on
      New Game (design §5; FR-STATS-007). No visual change. Depends T1-T3.
      Done when: running the app, playing a game to a win and to a draw writes one
      match each to `localStorage` (inspect the `ttt:stats:v1` key in the browser);
      New Game does not double-record; reload preserves the data.

- [x] T5 — Verify: all acceptance criteria AC-1..AC-6 (design §6) demonstrably
      pass; core + infra unit tests green (`npm test`); CF-1 E2E still green
      (`npm run test:e2e`); lint + module-boundary rules green (core/infra/ui
      layering) (`npm run lint`); build green.
      Done when: the commands pass and each AC is checked (data-model + storage +
      store ACs by tests; AC-4 persistence + AC-3 once-only also confirmed
      in-browser via the localStorage key).
