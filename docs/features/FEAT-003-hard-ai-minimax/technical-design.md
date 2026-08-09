# Technical Design: FEAT-003 — Hard AI (minimax)

> Feature from: docs/implementation-plan.md · Epic: EPIC-AI (Computer Opponent)
> Implements: FR-AI-003; completes FR-MODE-002 (enables the Hard option)
> Realizes: UC-03 (Hard, alt flow 2c)
> Screens: SCR-WEB-001 (difficulty control — Hard enabled); SCR-WEB-002 (no new UI)
> Status: Draft · Date: 2026-08-08

## 1. Intent

Make the Hard difficulty real: an **optimal minimax** opponent that **never
loses** — only wins or draws — within the 500 ms budget. This is the plan's one
genuine technical-risk slice (FR-AI-003 / NFR-PERF-002). It drops into the AI
dispatch and UI harness FEAT-002 already built: replace the `hard` stub in the
core, flip the Setup Hard option from disabled to enabled, and cover the
never-lose guarantee with exhaustive unit tests.

## 2. Codebase context

Design conforms to what FEAT-001/002 established (verified, committed):

- **Client-only SPA** (ADR-001) — no API, no DB. "Contract" = the core AI
  module's `chooseMove` (already public). No §4 migrations.
- **Existing `src/core/ai.ts`** — `Difficulty = "easy"|"medium"|"hard"`,
  `legalMoves`, `findWinningMove`, and `chooseMove(board, mark, difficulty, rng?)`
  with Easy/Medium implemented and **`hard` currently `throw`s**
  (`"Hard AI is not implemented until FEAT-003"`, marked `TODO(FEAT-003)`). This
  feature replaces that branch — the signature is unchanged.
- **Existing `src/core/board.ts`** — `evaluateStatus`, `applyMove`,
  `WINNING_LINES`, `Board`, `Mark`. Minimax composes these; no changes to them.
- **Existing `src/ui/views/setup.ts`** — the Difficulty segmented control renders
  Easy/Medium/**Hard (disabled)** with `title="Hard arrives in FEAT-003"` and a
  note ending "Hard — coming soon." FEAT-003 **enables** the Hard button and
  restores the Hard note.
- **Existing `src/ui/views/game.ts`** — already dispatches
  `chooseMove(board, aiMark, difficulty)` for any difficulty; **no change needed**
  (once the core `hard` case works and Setup allows selecting it, the existing
  vs-Computer orchestration drives it unchanged).
- **Tests:** Vitest for the core (ADR-005) + **Playwright E2E smoke over CF-1/CF-2**
  (ADR-006, added in the 2026-08-07 amendment). UC-03 ∈ **CF-1 "Play a game"**, so
  this feature **owes a flow-aware CF-1 E2E extension** (a Hard game smoke).
- **Plan-screen note (minor):** the plan lists FEAT-003's screen as SCR-WEB-002
  ("no new UI"); the only actual visible change is enabling Hard on the Setup
  difficulty control (**SCR-WEB-001**, already designed in FEAT-002). ui-design
  will update that entry (Hard no longer disabled). Recorded, not a gap.

## 3. Contract — core AI (`chooseMove` "hard" branch)

`chooseMove` signature is unchanged; only the `hard` case is implemented.

```ts
// hard → optimal minimax. Deterministic (ignores rng); never loses (FR-AI-003).
// Picks the move maximizing the minimax value for `mark`, ties → first (stable).
export function chooseMove(board, mark, "hard"): number;

// Internal (module-private):
// Score from `mark`'s perspective: +(10 - depth) if `mark` wins, (depth - 10) if
// the opponent wins, 0 for a draw. Depth (filled-cell count) makes the AI prefer
// faster wins and slower losses. Maximize on `mark`'s turn, minimize on the
// opponent's — full-tree (3×3 is tiny; no memoization needed, architecture §8).
function minimax(board: Board, aiMark: Mark, toMove: Mark, depth: number): number;
```

Legality is inherited: candidate moves come from `legalMoves`, so Hard only ever
plays empty cells (FR-AI-005). The `hard` branch no longer throws.

## 4. State shape

No new state. `GameConfig.difficulty` already carries `"hard"` (FEAT-002 typed
it); FEAT-002 merely disabled its *selection* in the UI. No persistence.

## 5. Component design

- **`core/ai.ts`** — implement the `hard` branch of `chooseMove` + a private
  `minimax` (and a small `other(mark)` already present). Replaces the
  `TODO(FEAT-003)` throw. Pure, synchronous, DOM-free, deterministic.
- **`ui/views/setup.ts`** — enable the Hard difficulty button (remove
  `disabled`/`title`); restore the Hard note (design source: "Hard plays
  perfectly — the best you can do is draw."). Difficulty control now offers all
  three fully (SCR-WEB-001).
- **`ui/views/game.ts`** — unchanged (dispatches `chooseMove(…, "hard")` already).
- **`tests/e2e/play-a-game.spec.ts`** — extend CF-1 with a Hard-game smoke
  (ADR-006): select Hard → play → the AI auto-moves and the game concludes as a
  **win-or-draw, never a human win**.

## 6. Acceptance criteria

- **AC-1** (FR-AI-003): On Hard, `chooseMove` returns a **minimax-optimal** move
  for the AI (maximizes the AI's guaranteed outcome).
- **AC-2** (FR-AI-003 — the headline): **Never loses.** In exhaustive self-play —
  the Hard AI vs. an opponent that tries **every** legal line — the AI's result
  is always a win or a draw, as both first (X) and second (O) player. No opponent
  line beats it.
- **AC-3** (FR-AI-003): Hard takes an **immediately winning** move when one exists.
- **AC-4** (FR-AI-003): Hard **blocks** an opponent's immediate winning threat
  when it has no win of its own.
- **AC-5** (NFR-PERF-002): Hard computes a move within **500 ms** on a mid-range
  device (worst case is the near-empty board), measured indicatively.
- **AC-6** (FR-MODE-002, completes): **Hard is selectable** in Setup and starts a
  Hard vs-Computer game.
- **AC-7** (FR-AI-005): Hard returns only **legal** (empty-cell) moves.

## 7. Decisions

- **D1 — Full-tree minimax, un-memoized.** Driver: architecture §8 / §11 (3×3
  state space is tiny; full search is instant, well within NFR-PERF-002).
  Alternative (alpha-beta / memoization) rejected as unnecessary complexity for
  3×3. Consequence: simplest correct implementation; revisit only for board
  variants (out of scope).
- **D2 — Depth-weighted scoring.** `10 - depth` / `depth - 10` so the AI prefers
  the quickest win and the most-delayed loss. Driver: makes "optimal" play feel
  decisive and, more importantly, guarantees it grabs an immediate win (AC-3) and
  delays forced losses maximally (it never *has* a forced loss from a fair start,
  but the weighting also yields sensible play from contrived positions).
- **D3 — Deterministic (first optimal move on ties).** Driver: testability and
  the never-lose guarantee need no randomness; `rng` is ignored for Hard.
  Consequence: Hard plays reproducibly. Tie-break variety (randomizing among
  equally-optimal moves) is a possible future nicety, not required by FR-AI-003.

## 8. Escalations & open items

- **None requiring escalation.** No new entity, no boundary change; minimax is
  the AI Module's named responsibility (architecture §5, ADR-005 test coverage).
- **E2E owed & minted:** UC-03 ∈ CF-1 → a flow-aware CF-1 E2E extension (Hard
  smoke) is a task (T3), per ADR-006.
- **Plan imprecision (minor):** FEAT-003's visible UI change is on SCR-WEB-001
  (enable Hard), not SCR-WEB-002 as the plan lists; ui-design updates the
  SCR-WEB-001 entry. Not a gap.
