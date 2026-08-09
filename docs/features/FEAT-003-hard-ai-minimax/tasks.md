# Tasks: FEAT-003 — Hard AI (minimax)

> Executes: docs/features/FEAT-003-hard-ai-minimax/technical-design.md
> Status: ALL DONE (developer-done) · Last updated: 2026-08-08
> Client-only SPA — no schema/migration tasks. E2E owed: UC-03 ∈ CF-1, so a
> flow-aware CF-1 E2E extension is minted (T3, ADR-006).
> Minimax ACs (incl. exhaustive never-lose + <500ms) by 6 Vitest tests; Hard
> selectable + full Hard game verified in-browser and by the CF-1 E2E smoke;
> 27 unit + 6 E2E green. (DEF-001 found & fixed separately during this work.)

- [x] T1 — Domain: implement the `hard` branch of `chooseMove` + a private
      `minimax(board, aiMark, toMove, depth)` in `src/core/ai.ts` (replace the
      `TODO(FEAT-003)` throw). Full-tree, depth-weighted, deterministic (design
      §3, §5; FR-AI-003).
      Done when: unit tests pass for AC-1 (optimal move), **AC-2 exhaustive
      never-lose** (Hard vs. every opponent line, as X and as O → only win/draw),
      AC-3 (takes a win), AC-4 (blocks), AC-5 (move computed < 500 ms,
      indicative), AC-7 (legal moves only).

- [x] T2 — UI Setup: enable the Hard difficulty button in `src/ui/views/setup.ts`
      (remove `disabled`/`title`; restore the Hard note "Hard plays perfectly —
      the best you can do is draw.") (design §5; FR-MODE-002 completes; AC-6;
      SCR-WEB-001). `game.ts` unchanged (already dispatches Hard). Depends T1.
      Done when: running the app, Hard is selectable and starts a Hard
      vs-Computer game; Easy/Medium/two-player paths unaffected.

- [x] T3 — E2E: extend `tests/e2e/play-a-game.spec.ts` (CF-1) with a Hard smoke
      (ADR-006, flow-aware): choose Vs. Computer + Hard → play → the AI
      auto-moves and the game concludes as a **win-or-draw, never a human win**.
      Depends T1, T2.
      Done when: the new CF-1 Hard case passes headless against the local build
      (`npm run test:e2e`), and the existing CF-1 cases stay green.

- [x] T4 — Verify: all acceptance criteria AC-1..AC-7 (design §6) demonstrably
      pass; core unit tests green (`npm test`); CF-1 E2E green (`npm run test:e2e`);
      lint + module-boundary rules green (`npm run lint`); build green.
      Done when: the commands pass and each AC is checked against observed
      behavior (minimax ACs by unit tests incl. the exhaustive never-lose proof;
      AC-6 by running the app; AC-5 by the timed test).
