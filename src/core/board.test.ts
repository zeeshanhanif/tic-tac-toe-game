// Core unit tests (NFR-MAINT-002): move placement/rejection + win/draw detection.

import { describe, it, expect } from "vitest";
import {
  EMPTY_BOARD,
  applyMove,
  evaluateStatus,
  WINNING_LINES,
  type Board,
  type CellValue,
  type Mark,
} from "./board.ts";

// Build a board from a 9-char string: "X"/"O"/"." (dot = empty).
function board(s: string): Board {
  return s
    .replace(/\s/g, "")
    .split("")
    .map((c) => (c === "." ? null : (c as Mark)) as CellValue);
}

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

describe("evaluateStatus — win/draw detection (AC-7, AC-8, AC-9)", () => {
  it("detects a win on every one of the 8 lines and returns that line (AC-7/AC-8)", () => {
    for (const line of WINNING_LINES) {
      const cells = ".".repeat(9).split("");
      for (const i of line) cells[i] = "X";
      const status = evaluateStatus(board(cells.join("")));
      expect(status).toEqual({ kind: "won", mark: "X", line });
    }
  });

  it("detects wins for O as well as X (AC-7)", () => {
    // O down the middle column: indices 1,4,7
    const status = evaluateStatus(board(".O.\n.O.\n.O."));
    expect(status.kind).toBe("won");
    if (status.kind === "won") {
      expect(status.mark).toBe("O");
      expect(status.line).toEqual([1, 4, 7]);
    }
  });

  it("detects a draw: full board, no winning line (AC-9)", () => {
    // X O X / X O O / O X X — full, no three-in-a-row
    expect(evaluateStatus(board("XOX\nXOO\nOXX"))).toEqual({ kind: "draw" });
  });

  it("reports in-progress for a non-full, non-won board", () => {
    expect(evaluateStatus(board("XOX\n.X.\nO..")).kind).toBe("in-progress");
    expect(evaluateStatus(EMPTY_BOARD).kind).toBe("in-progress");
  });
});
