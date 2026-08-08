# Tasks: FEAT-001 — Local two-player match

> Executes: docs/features/FEAT-001-local-two-player-match/technical-design.md
> Status: ALL DONE (developer-done) · Last updated: 2026-08-07
> UI ACs demonstrated in-browser via claude-in-chrome (Setup→play→X win+highlight
> →after-end ignored→New Game→draw→Menu, + dark theme, no console errors);
> engine ACs by 12 Vitest unit tests; build + lint green.
> No schema/migration tasks (client-only SPA); no E2E task (architecture names
> no critical E2E flow — unit tests for the core per ADR-005/NFR-MAINT-002).

- [x] T1 — Domain: complete `evaluateStatus(board)` + `WINNING_LINES` in
      `src/core/board.ts` (design §3.1, §5; FR-GAME-007/009). Detect win (3
      equal marks over any of the 8 lines, returning the winning `line`), draw
      (full board, no line), else in-progress. Replaces the `TODO(FEAT-001)`
      stub.
      Done when: unit tests for AC-7, AC-8 (line indices), AC-9 pass — every
      row/col/diagonal win, a draw, and an in-progress board.

- [x] T2 — Domain: add `GameState`, `newGame(first="X")`, `playMove(state, i)`
      in `src/core/game.ts`; re-export from `src/core/index.ts` (design §3.2,
      §5; FR-GAME-003/004/005). Turn/end reducer: X first, alternate on valid
      moves, reject on occupied cell or ended game.
      Done when: unit tests for AC-2, AC-4, AC-5, AC-6, AC-11 pass (X-first,
      alternation, occupied rejected, after-end rejected, newGame resets).

- [x] T3 — UI: rebuild `src/ui/views/game.ts` as a thin `GameState` renderer
      (design §5; FR-GAME-001/006/008/010/011/012; NFR-USE-002/003). Board grid,
      text turn indicator, result banner (X wins / O wins / Draw), winning-line
      highlight on `status.line`, New Game + Menu controls; every click →
      `playMove`, rejected moves ignored. Consumes design tokens (SCR-WEB-002/003
      per ui-design's manifest). Replaces the skeleton alternate-mark code.
      Done when: running the app (`npm run dev`), a full 2-player game plays to
      an X win, an O win, and a draw — result text + highlight appear; New Game
      clears the board (X to move); Menu returns to Setup.

- [x] T4 — UI: rebuild `src/ui/views/setup.ts` — mode segmented control with
      Local Two-Player functional and vs-Computer present-but-deferred, plus a
      Start Game action (design §5; FR-MODE-001/004, UC-01; SCR-WEB-001 2-player
      path). Replaces the placeholder.
      Done when: choosing Local Two-Player and Start opens an empty game board;
      vs-Computer does not start a game (deferred to FEAT-002).

- [x] T5 — Wire: app controller in `src/ui/shell.ts` — hold active `GameConfig`,
      route Setup→Game (newGame), Game→New Game (same config), Game→Menu→Setup;
      land on Setup at boot (design §4, §5). Replaces the `show("game")` default.
      Depends on T3, T4.
      Done when: Setup→Start→Game→(New Game and Menu) round-trips demonstrably
      in the running app.

- [x] T6 — Verify: all acceptance criteria AC-1..AC-17 (design §6) demonstrably
      pass; core unit tests green (`npm test`); lint + module-boundary rules
      green (`npm run lint`); build green (`npm run build`).
      Done when: the three commands pass and each AC is checked off against
      observed behavior (engine ACs by tests, UI ACs by running the app,
      NFR-PERF-001/USE-002 by inspection).
