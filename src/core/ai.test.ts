// Core unit tests (NFR-MAINT-002): AI move selection — ai.ts.

import { describe, it, expect } from "vitest";
import { EMPTY_BOARD, type Board, type CellValue, type Mark } from "./board.ts";
import { chooseMove, legalMoves, findWinningMove } from "./ai.ts";

function board(s: string): Board {
  return s
    .replace(/\s/g, "")
    .split("")
    .map((c) => (c === "." ? null : (c as Mark)) as CellValue);
}

describe("Easy — random legal move (AC-6, FR-AI-001)", () => {
  it("returns the move the injected RNG points at", () => {
    expect(chooseMove(EMPTY_BOARD, "X", "easy", () => 0)).toBe(0);
    expect(chooseMove(EMPTY_BOARD, "X", "easy", () => 0.95)).toBe(8); // floor(0.95*9)=8
  });

  it("only ever returns a legal (empty) cell (AC-8, FR-AI-005)", () => {
    const b = board("XOXOXO..."); // legal: 6,7,8
    for (const r of [0, 0.34, 0.67, 0.999]) {
      expect(legalMoves(b)).toContain(chooseMove(b, "X", "easy", () => r));
    }
  });
});

describe("Medium — win / block / random (AC-7, FR-AI-002)", () => {
  it("takes an immediately winning move", () => {
    // X at 0,1 → wins at 2
    expect(chooseMove(board("XX......."), "X", "medium")).toBe(2);
  });

  it("blocks the opponent's immediate win when it cannot win itself", () => {
    // O threatens at 2 (O at 0,1); X has no immediate win → block at 2
    expect(chooseMove(board("OO..X...."), "X", "medium")).toBe(2);
  });

  it("prefers its own win over blocking", () => {
    // X can win at 2 (0,1); O could win at 5 (3,4) → take the win, not the block
    expect(chooseMove(board("XX.OO...."), "X", "medium")).toBe(2);
  });

  it("falls back to a random legal move when no win/block exists", () => {
    const b = board("X........"); // no win, no threat
    expect(chooseMove(b, "O", "medium", () => 0)).toBe(1); // legal moves start at 1
    expect(legalMoves(b)).toContain(chooseMove(b, "O", "medium", () => 0.5));
  });
});

describe("legality & guards (AC-8)", () => {
  it("medium only returns empty cells", () => {
    const b = board("XOX.O.X.."); // legal: 3,5,7,8
    for (const r of [0, 0.3, 0.6, 0.9]) {
      expect(legalMoves(b)).toContain(chooseMove(b, "O", "medium", () => r));
    }
  });

  it("findWinningMove returns null when no immediate win exists", () => {
    expect(findWinningMove(board("X........"), "X")).toBeNull();
  });

  it("Hard throws until FEAT-003", () => {
    expect(() => chooseMove(EMPTY_BOARD, "X", "hard")).toThrow(/FEAT-003/);
  });
});
