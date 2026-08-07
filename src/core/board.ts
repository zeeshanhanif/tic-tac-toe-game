// Domain core — pure, DOM-free (ADR-003 / NFR-MAINT-001).
//
// Board primitives + outcome detection. Mark placement, illegal-move rejection
// (FR-GAME-003), and win/row/col/diagonal + draw detection (FR-GAME-007/009)
// live here. Turn management lives in game.ts.

export type Mark = "X" | "O";
export type CellValue = Mark | null;

/** The 3×3 board as 9 cells, row-major (index 0..8). Immutable by convention. */
export type Board = readonly CellValue[];

export const BOARD_SIZE = 9;

export const EMPTY_BOARD: Board = Object.freeze(Array<CellValue>(BOARD_SIZE).fill(null));

export type GameStatus =
  | { kind: "in-progress" }
  | { kind: "won"; mark: Mark; line: readonly number[] }
  | { kind: "draw" };

export interface MoveResult {
  /** The board after the move (unchanged if the move was rejected). */
  board: Board;
  /** Whether the move was applied (false = illegal, ignored — FR-GAME-003/004). */
  applied: boolean;
  status: GameStatus;
}

/** True if `index` is a valid, empty cell. */
export function isEmptyCell(board: Board, index: number): boolean {
  return index >= 0 && index < BOARD_SIZE && board[index] === null;
}

/**
 * Place `mark` at `index`, returning a new board. Rejects (ignores) moves on an
 * occupied/out-of-range cell — FR-GAME-003. Pure: never mutates its input.
 */
export function applyMove(board: Board, index: number, mark: Mark): MoveResult {
  if (!isEmptyCell(board, index)) {
    return { board, applied: false, status: evaluateStatus(board) };
  }
  const next = board.slice();
  next[index] = mark;
  return { board: Object.freeze(next), applied: true, status: evaluateStatus(next) };
}

/** The 8 winning triples (row-major indices): 3 rows, 3 columns, 2 diagonals. */
export const WINNING_LINES: readonly (readonly [number, number, number])[] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
];

/**
 * Outcome of the board: won (with the winning mark and line), draw (full board,
 * no line), or in-progress. Pure — the winner is derived from the board itself
 * (the mark occupying a completed line), so no turn context is needed
 * (FR-GAME-007/009).
 */
export function evaluateStatus(board: Board): GameStatus {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const mark = board[a];
    if (mark !== null && board[b] === mark && board[c] === mark) {
      return { kind: "won", mark, line };
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { kind: "draw" };
  }
  return { kind: "in-progress" };
}
