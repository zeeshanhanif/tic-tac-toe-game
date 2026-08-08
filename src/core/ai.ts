// Domain core — computer opponent move selection. Pure, DOM-free (ADR-003 /
// NFR-MAINT-001). Randomness is injected (`rng`) so the random paths are
// deterministically unit-testable. The move delay / auto-move orchestration is
// UI (architecture §5), not here. Hard (minimax, FR-AI-003) is FEAT-003.

import { applyMove, evaluateStatus, BOARD_SIZE, type Board, type Mark } from "./board.ts";

export type Difficulty = "easy" | "medium" | "hard";

/** Indices of empty cells — the legal moves. */
export function legalMoves(board: Board): number[] {
  const moves: number[] = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (board[i] === null) moves.push(i);
  }
  return moves;
}

/** A cell where placing `mark` immediately completes a line, else null. */
export function findWinningMove(board: Board, mark: Mark): number | null {
  for (const i of legalMoves(board)) {
    const { status } = applyMove(board, i, mark);
    if (status.kind === "won" && status.mark === mark) return i;
  }
  return null;
}

function other(mark: Mark): Mark {
  return mark === "X" ? "O" : "X";
}

function randomOf(moves: number[], rng: () => number): number {
  return moves[Math.floor(rng() * moves.length)];
}

/**
 * Choose a legal move for `mark` at `difficulty`. Pure; `rng` (default
 * Math.random) makes random paths testable. Returns an empty cell (FR-AI-005);
 * throws only if the board is full (never called then).
 *   easy   → uniformly random legal move (FR-AI-001)
 *   medium → win-if-possible, else block opponent's win, else random (FR-AI-002)
 *   hard   → throws until FEAT-003 supplies minimax (FR-AI-003)
 */
export function chooseMove(
  board: Board,
  mark: Mark,
  difficulty: Difficulty,
  rng: () => number = Math.random,
): number {
  const moves = legalMoves(board);
  if (moves.length === 0) throw new Error("chooseMove: board is full");

  switch (difficulty) {
    case "easy":
      return randomOf(moves, rng); // FR-AI-001
    case "medium": {
      const win = findWinningMove(board, mark); // FR-AI-002: win first
      if (win !== null) return win;
      const block = findWinningMove(board, other(mark)); // then block
      if (block !== null) return block;
      return randomOf(moves, rng); // else random
    }
    case "hard":
      return bestMinimaxMove(board, mark); // FR-AI-003 — optimal, never loses
  }
}

/**
 * The move maximizing `mark`'s minimax value. Deterministic — first optimal move
 * on ties (rng is intentionally ignored for Hard). FR-AI-003.
 */
function bestMinimaxMove(board: Board, mark: Mark): number {
  const moves = legalMoves(board);
  let best = -Infinity;
  let bestMove = moves[0];
  for (const i of moves) {
    const score = minimax(applyMove(board, i, mark).board, mark, other(mark), 1);
    if (score > best) {
      best = score;
      bestMove = i;
    }
  }
  return bestMove;
}

/**
 * Minimax value of `board` from `aiMark`'s perspective, with `toMove` to play.
 * +(10 - depth) if aiMark wins, (depth - 10) if it loses, 0 for a draw —
 * depth-weighted so the AI prefers faster wins and slower losses. Full-tree; the
 * 3×3 state space is tiny, so no pruning/memoization is needed (architecture §8).
 */
function minimax(board: Board, aiMark: Mark, toMove: Mark, depth: number): number {
  const status = evaluateStatus(board);
  if (status.kind === "won") return status.mark === aiMark ? 10 - depth : depth - 10;
  if (status.kind === "draw") return 0;

  const moves = legalMoves(board);
  if (toMove === aiMark) {
    let best = -Infinity;
    for (const i of moves) {
      best = Math.max(best, minimax(applyMove(board, i, toMove).board, aiMark, other(toMove), depth + 1));
    }
    return best;
  }
  let best = Infinity;
  for (const i of moves) {
    best = Math.min(best, minimax(applyMove(board, i, toMove).board, aiMark, other(toMove), depth + 1));
  }
  return best;
}
