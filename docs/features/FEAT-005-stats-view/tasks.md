# Tasks: FEAT-005 — Statistics & History view

> Executes: docs/features/FEAT-005-stats-view/technical-design.md
> Status: ALL DONE (developer-done) · Last updated: 2026-08-09
> Aggregation ACs by Vitest (summarize/filterHistory); stats view (tiles, filter,
> history, empty state) + game↔stats nav (game preserved) verified in-browser and
> by the CF-2 E2E smoke; 53 unit + 8 E2E green; boundaries/tokens clean.
> Client-only SPA — read-only (no schema/migration). E2E owed: UC-06 ∈ CF-2 and
> this feature makes CF-2 demonstrable → a CF-2 "review statistics" smoke is
> minted (T4, ADR-006). Screens: SCR-WEB-004 → ui-design (its own stage).

- [x] T1 — Domain: add `StatsFilter`, `summarize(state, filter)`,
      `filterHistory(state, filter)` to `src/core/stats.ts` (pure; design §3.1,
      §5; FR-STATS-003/004). Re-exported via `core/index.ts` (already barrelled).
      Done when: unit tests pass for AC-1 (W/L/D aggregation per filter: all /
      two-player / vs-computer), AC-2/AC-5 (history filtered by mode, newest
      first — D3), and empty-state (AC-3: empty → zeroed WLD, [] history).

- [x] T2 — UI: rebuild `src/ui/views/stats.ts` (replace the placeholder) —
      renders SCR-WEB-004: Back control, title, W/L/D stat-tiles, mode-filter
      segmented control (All / Vs. Computer / 2 Players), match-history list
      (result, mode+difficulty, time), and empty state; reads
      `statsStore.snapshot()` + `summarize`/`filterHistory`, re-renders on filter
      change (design §5; FR-STATS-003/004; SCR-WEB-004 per ui-design's manifest).
      Depends T1. No reset control (FEAT-006).
      Done when: running the app, after playing games the stats view shows the
      correct W/L/D tiles + history; the mode filter updates both; an empty store
      shows zeroed tiles + empty state.

- [x] T3 — UI wire: navigation (FR-UI-002; design §5, D1). `src/ui/shell.ts`
      adds `showStats(back)` and preserves the current game view element so
      Game→Stats→Back keeps game state; `src/ui/views/game.ts` and
      `src/ui/views/setup.ts` add a "View stats & history" link calling
      `onViewStats`. Depends T2.
      Done when: running the app, a "View stats" link opens the stats view from
      both Setup and Game; Back returns; returning from Game preserves the game.

- [x] T4 — E2E: add a CF-2 "review statistics" smoke to `tests/e2e/`
      (ADR-006, flow-aware): play a game → open stats → assert the W/L/D tiles and
      a history entry reflect it → change the mode filter. Depends T1-T3.
      Done when: the CF-2 spec passes headless against the local build; existing
      CF-1 + setup specs stay green.

- [x] T5 — Verify: all acceptance criteria AC-1..AC-6 (design §6) demonstrably
      pass; unit tests green (`npm test`); CF-1 + CF-2 E2E green
      (`npm run test:e2e`); lint + boundaries green (`npm run lint`); build green.
      Done when: the commands pass and each AC is checked (aggregation ACs by
      unit tests; view/nav/filter ACs by running the app + the CF-2 E2E).
