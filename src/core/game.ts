// Domain core — turn/end reducer over the board primitives. Pure, DOM-free
// (ADR-003 / NFR-MAINT-001). Single home for turn order (X first, alternate —
// FR-GAME-005) and end-of-game move rejection (FR-GAME-003/004). The view never
// decides legality or turn order.

import { EMPTY_BOARD, applyMove, type Board, type GameStatus, type Mark } from "./board.ts";

export interface GameState {
  readonly board: Board;
  readonly current: Mark; // whose turn it is (X first — FR-GAME-005)
  readonly status: GameStatus; // in-progress | won | draw
}

/** A fresh game: empty board, `first` to move (default "X"). */
export function newGame(first: Mark = "X"): GameState {
  return { board: EMPTY_BOARD, current: first, status: { kind: "in-progress" } };
}

/**
 * Apply the current player's move at `index`. Pure — returns a new state.
 * Rejects (state unchanged, `applied:false`) when the game has ended
 * (FR-GAME-004) or the cell is occupied/out of range (FR-GAME-003). On a valid
 * move: places `current`'s mark, re-evaluates status; if still in-progress,
 * flips `current`; otherwise leaves `current` as the mark that just moved.
 */
export function playMove(state: GameState, index: number): { state: GameState; applied: boolean } {
  if (state.status.kind !== "in-progress") {
    return { state, applied: false }; // FR-GAME-004
  }
  const result = applyMove(state.board, index, state.current);
  if (!result.applied) {
    return { state, applied: false }; // FR-GAME-003
  }
  const next: GameState = {
    board: result.board,
    status: result.status,
    current: result.status.kind === "in-progress" ? other(state.current) : state.current,
  };
  return { state: next, applied: true };
}

function other(mark: Mark): Mark {
  return mark === "X" ? "O" : "X";
}
