// Core unit tests (NFR-MAINT-002): turn/end reducer — game.ts.

import { describe, it, expect } from "vitest";
import { newGame, playMove } from "./game.ts";

describe("newGame (AC-11)", () => {
  it("starts empty with X to move and in-progress", () => {
    const g = newGame();
    expect(g.current).toBe("X"); // X first — FR-GAME-005
    expect(g.status.kind).toBe("in-progress");
    expect(g.board.every((c) => c === null)).toBe(true);
  });

  it("honors an explicit starting mark", () => {
    expect(newGame("O").current).toBe("O");
  });
});

describe("playMove (AC-2, AC-4, AC-5, AC-6)", () => {
  it("places the current mark and passes the turn (AC-2/AC-4)", () => {
    const g0 = newGame();
    const { state: g1, applied } = playMove(g0, 0);
    expect(applied).toBe(true);
    expect(g1.board[0]).toBe("X");
    expect(g1.current).toBe("O"); // turn alternated
    const { state: g2 } = playMove(g1, 1);
    expect(g2.board[1]).toBe("O");
    expect(g2.current).toBe("X");
  });

  it("rejects a move on an occupied cell — state unchanged (AC-5)", () => {
    const g1 = playMove(newGame(), 4).state; // X at 4, now O's turn
    const { state: g2, applied } = playMove(g1, 4);
    expect(applied).toBe(false);
    expect(g2).toBe(g1); // same state object, current still O
    expect(g2.current).toBe("O");
  });

  it("rejects any move after the game has ended (AC-6)", () => {
    // Drive X to a top-row win: X0 O3 X1 O4 X2 (X wins 0,1,2)
    let g = newGame();
    for (const i of [0, 3, 1, 4, 2]) g = playMove(g, i).state;
    expect(g.status.kind).toBe("won");
    const { state: after, applied } = playMove(g, 8);
    expect(applied).toBe(false);
    expect(after).toBe(g); // board unchanged after end
  });

  it("does not flip the turn on the winning move", () => {
    let g = newGame();
    for (const i of [0, 3, 1, 4, 2]) g = playMove(g, i).state;
    if (g.status.kind === "won") expect(g.status.mark).toBe("X");
    expect(g.current).toBe("X"); // winner stays as current
  });
});
