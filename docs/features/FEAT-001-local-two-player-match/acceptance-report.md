# Acceptance Report: FEAT-001 — Local two-player match

> Verdict: **Accepted** · Date: 2026-08-07
> Standard: technical-design.md §6 (17 criteria) · Sources: srs.md, use-cases.md
> Repo state audited: working tree (FEAT-001 changes uncommitted — see Findings)

## Verdict summary

FEAT-001 is **accepted** — verified. The standard was re-derived from the SRS
FR statements and UC flows and found sound (every implemented FR has ≥1
faithful criterion; the two partials, FR-MODE-001/004, are correctly scoped to
the 2-player path). All 12 core unit tests pass and were shown to genuinely
catch regressions via a mutation check (breaking `evaluateStatus` turned 5 red;
restore returned 12 green). UI criteria were verified by direct in-browser
observation. No rework or design-defect findings; two non-blocking minors
recorded.

## Audit table

| AC | Encodes | Test(s) / evidence | Audit | Observed |
| :- | :------ | :----------------- | :---- | :------- |
| AC-1 | FR-GAME-001, UC-01 | browser: 9-cell grid renders | observed | green |
| AC-2 | FR-GAME-005, UC-01 | game.test `newGame` (X first) | faithful | green |
| AC-3 | FR-GAME-002, UC-02 | board/game.test place mark | faithful | green |
| AC-4 | FR-GAME-005, UC-02 | game.test alternation (g1=O,g2=X) | faithful | green |
| AC-5 | FR-GAME-003, UC-02 1a | game.test occupied → `applied:false`, state identity | faithful | green |
| AC-6 | FR-GAME-004, UC-02 1b | game.test after-end → rejected, board unchanged | faithful | green |
| AC-7 | FR-GAME-007, UC-04 | board.test all 8 lines + O-win | faithful (mutation-checked) | green |
| AC-8 | FR-GAME-008, UC-04 | board.test `status.line` + browser highlight | faithful | green |
| AC-9 | FR-GAME-009, UC-04 | board.test draw (`toEqual {draw}`) | faithful | green |
| AC-10 | FR-GAME-010, UC-04 | browser: "X wins!" / "Draw" text banner | observed | green |
| AC-11 | FR-GAME-011, UC-05 | game.test `newGame` + browser reset | faithful | green |
| AC-12 | FR-GAME-012, UC-05 1a | browser: Menu → Setup | observed | green |
| AC-13 | FR-MODE-001/004, UC-01 | browser: 2 Players → Start → empty board | observed | green |
| AC-14 | NFR-PERF-001 | browser: move reflected instantly | observed (indicative) | pass* |
| AC-15 | NFR-REL-001 | browser: rapid/occupied/after-end clicks, no crash, 0 console errors | observed | green |
| AC-16 | NFR-USE-002 | CSS `min-*: var(--layout-touchTargetMin)` (44px) + visual | observed | pass |
| AC-17 | NFR-MAINT-001/002 | 12 Vitest unit tests + ESLint boundary rule (core has no ui/infra imports) | faithful | green |

\* AC-14 measured indicatively in a local dev browser (sub-frame, visually
instant); not instrumented — environment-caveated, non-blocking.

## Corrected tests

None — every test audited faithful to its criterion on first read.

## Independent execution

Run fresh from the working-tree state with the project's own commands:
- `npm test` → **12 passed (2 files)**.
- **Mutation check**: neutralized `evaluateStatus` → **5 failed / 7 passed**
  (win-all-lines, O-win, draw, after-end, winning-move-no-flip); restored →
  **12 passed**. Confirms the win/draw + reducer tests fail when they should.
- `npm run lint` → clean (includes the ADR-003 module-boundary rules).
- `npm run build` (`tsc && vite build`) → green (dist JS 5.69 kB, CSS 9.08 kB).
- No migrations (client-only SPA). No E2E suite owed (architecture names no
  critical E2E flow — ADR-005 unit-tests-for-core strategy).

## Direct verification

- **UI FRs (AC-1/10/12/13, AC-8 highlight):** observed live via the browser —
  Setup (2-player selected, Vs. Computer deferred) → Start → alternating X/O →
  **X wins** with the top row highlighted green + winner ring → after-win clicks
  ignored → New Game reset → **Draw** in the neutral banner variant → Menu →
  Setup. Dark theme rendered correctly. Zero console errors.
- **NFR-PERF-001 (AC-14):** visually instant; indicative only (see caveat).
- **NFR-REL-001 (AC-15):** rapid and illegal (occupied, after-end) clicks
  produced no crash, no state corruption, no console errors.
- **Screens vs. manifest:** rendered output matches SCR-WEB-001 (2-player
  variant — difficulty/side hidden), SCR-WEB-002 (2-player scoreboard, no score
  numeral), SCR-WEB-003 (win + code-native **draw** supplement). Conformance
  holds: `src/style.css` contains **no raw hex — all `var(--…)`** (tokens, not a
  fork). Claude Design source locators resolve.
- **Contract:** the implemented core API (`evaluateStatus`, `GameState`,
  `newGame`, `playMove`) matches technical-design §3; no divergence.

## Findings

**Rework:** none.

**Design defect:** none.

**Minor (non-blocking):**
1. **Commits deferred** — the FEAT-001 changes are uncommitted (per the user's
   instruction earlier in the session), so the anti-fake-green *diff-over-commit-
   range* review could not run against history. Mitigated: the test files were
   audited directly and a mutation check confirmed they catch regressions.
   Recommend committing the per-task sequence to restore the audit trail.
2. **UI criteria (AC-1/10/12/13) have no automated regression test** — verified
   by direct browser observation, consistent with the design's chosen strategy
   (unit tests for the core only; ADR-005). Durable UI regression coverage
   (jsdom or Playwright) remains a parked decision; adding it would be an
   architecture test-strategy amendment, not a FEAT-001 fix.

## RTM

Accepted → **Test ref appended** with `features/FEAT-001-local-two-player-match/acceptance-report.md`
for FR-GAME-001..012, and `…(partial)` for FR-MODE-001 and FR-MODE-004
(completing Plan ref → Design ref → Test ref for the 2-player scope).
