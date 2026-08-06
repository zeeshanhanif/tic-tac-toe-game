// Skeleton test — the walking skeleton's done-when (local half), encoded.
// Exercises the exact core operation the UI invokes on a cell click:
// applyMove places a mark and rejects an occupied cell (UI → core → new state).
// FEAT-001 expands this suite with full win/draw coverage (NFR-MAINT-002).

import { describe, it, expect } from "vitest";
import { EMPTY_BOARD, applyMove } from "./board.ts";

describe("core skeleton: applyMove", () => {
  it("places a mark on an empty cell and does not mutate the input", () => {
    const result = applyMove(EMPTY_BOARD, 4, "X");
    expect(result.applied).toBe(true);
    expect(result.board[4]).toBe("X");
    expect(EMPTY_BOARD[4]).toBeNull(); // input untouched (pure)
  });

  it("rejects a move on an occupied cell (FR-GAME-003)", () => {
    const first = applyMove(EMPTY_BOARD, 0, "X").board;
    const second = applyMove(first, 0, "O");
    expect(second.applied).toBe(false);
    expect(second.board[0]).toBe("X");
  });
});
