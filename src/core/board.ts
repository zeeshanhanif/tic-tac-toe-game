// Domain core — pure, DOM-free (ADR-003 / NFR-MAINT-001).
//
// SKELETON SCOPE: mark placement and illegal-move rejection are real (they are
// the trivial end-to-end operation the walking skeleton proves). Win/draw
// detection is a STUB here — it is built and unit-tested in FEAT-001 (see
// docs/implementation-plan.md §5 and the per-slice detailed-design step).

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

/**
 * STUB — always reports the game in progress. Real win/draw detection (rows,
 * columns, diagonals, full-board draw) is FEAT-001. Kept here so the UI wires
 * against the final shape now; FEAT-001 replaces the body only.
 */
export function evaluateStatus(_board: Board): GameStatus {
  // TODO(FEAT-001): detect win (row/col/diag) and draw — FR-GAME-007/009.
  return { kind: "in-progress" };
}
