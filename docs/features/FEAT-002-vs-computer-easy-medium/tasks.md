# Tasks: FEAT-002 — vs-Computer setup + Easy/Medium AI

> Executes: docs/features/FEAT-002-vs-computer-easy-medium/technical-design.md
> Status: ALL DONE (developer-done) · Last updated: 2026-08-07
> Client-only SPA — no schema/migration tasks; no E2E task (architecture names
> no critical E2E flow; core AI unit-tested per ADR-005/NFR-MAINT-002).
> AI logic ACs by 9 Vitest tests; vs-Computer UI (setup controls, auto-move,
> Medium block, play-as-O AI-first, thinking/input-lock) demonstrated in-browser;
> two-player regression clean; build + lint green.

- [x] T1 — Domain: create `src/core/ai.ts` — `Difficulty`, `legalMoves`,
      `findWinningMove(board, mark)`, `chooseMove(board, mark, difficulty, rng?)`
      (Easy = random legal; Medium = win → block → random; Hard = throws
      `TODO(FEAT-003)`). Re-export from `src/core/index.ts` (design §3, §5;
      FR-AI-001/002/005).
      Done when: unit tests for AC-6 (Easy legality via injected RNG), AC-7
      (Medium win-priority, block-priority, random fallback), AC-8 (all
      difficulties return an empty cell) pass.

- [x] T2 — UI Setup: extend `GameConfig` in `src/ui/config.ts` (`difficulty?`,
      `humanMark?`); rebuild `src/ui/views/setup.ts` vs-Computer path — enable
      the Vs. Computer card, reveal a Difficulty segmented control (Easy/Medium
      selectable, **Hard disabled** "FEAT-003") and a "You play as" X/O pill pair
      (default X), and build the extended config on Start (design §4, §5;
      FR-MODE-002 partial, FR-MODE-003; SCR-WEB-001 vs-Computer path). Depends T1.
      Done when: running the app, selecting Vs. Computer shows difficulty + side
      controls; Easy/Medium + a chosen side start a vs-Computer game; Hard is
      not selectable; two-player path still works.

- [x] T3 — UI Game: extend `src/ui/views/game.ts` for vs-Computer (design §5;
      FR-AI-004, FR-MODE-003/004, SCR-WEB-002). Mode-aware scoreboard labels
      (You / Computer <Diff> AI); on the AI's turn set `aiThinking`, show
      "Computer is thinking…", lock board input, and after ~400 ms delay play
      `chooseMove(board, aiMark, difficulty)` via `playMove`; AI moves first when
      `humanMark==="O"` (on start and New Game). Depends T1, T2.
      Done when: running the app, an Easy game and a Medium game each play to
      completion with the AI auto-moving after a visible delay; choosing O makes
      the AI open; clicks during "thinking" are ignored; Medium visibly blocks a
      human's immediate win.

- [x] T4 — Verify: all acceptance criteria AC-1..AC-11 (design §6) demonstrably
      pass; core unit tests green (`npm test`); lint + module-boundary rules
      green (`npm run lint`); build green (`npm run build`).
      Done when: the three commands pass and each AC is checked against observed
      behavior (AI logic ACs by tests; UI/orchestration ACs by running the app;
      AC-4 delay + AC-10 input-lock by inspection).
