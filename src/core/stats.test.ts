// Core unit tests (NFR-MAINT-002): Stats Service — stats.ts.

import { describe, it, expect } from "vitest";
import {
  emptyStatsState,
  recordResult,
  resultOf,
  type MatchRecord,
} from "./stats.ts";

const at = (result: MatchRecord["result"], over: Partial<MatchRecord> = {}): MatchRecord => ({
  mode: "two-player",
  result,
  timestamp: 1000,
  ...over,
});

describe("recordResult — tallies (AC-1, FR-STATS-001)", () => {
  it("increments the two-player bucket", () => {
    let s = emptyStatsState();
    s = recordResult(s, at("win"));
    s = recordResult(s, at("draw"));
    expect(s.stats.twoPlayer).toEqual({ wins: 1, losses: 0, draws: 1 });
    expect(s.stats.vsComputer.medium).toEqual({ wins: 0, losses: 0, draws: 0 });
  });

  it("segments vs-Computer by difficulty", () => {
    let s = emptyStatsState();
    s = recordResult(s, at("win", { mode: "vs-computer", difficulty: "hard" }));
    s = recordResult(s, at("loss", { mode: "vs-computer", difficulty: "hard" }));
    s = recordResult(s, at("win", { mode: "vs-computer", difficulty: "easy" }));
    expect(s.stats.vsComputer.hard).toEqual({ wins: 1, losses: 1, draws: 0 });
    expect(s.stats.vsComputer.easy).toEqual({ wins: 1, losses: 0, draws: 0 });
    expect(s.stats.vsComputer.medium).toEqual({ wins: 0, losses: 0, draws: 0 });
    expect(s.stats.twoPlayer.wins).toBe(0);
  });

  it("does not mutate the input state (pure)", () => {
    const s0 = emptyStatsState();
    const s1 = recordResult(s0, at("win"));
    expect(s0.stats.twoPlayer.wins).toBe(0);
    expect(s1).not.toBe(s0);
  });
});

describe("recordResult — history (AC-2, FR-STATS-002)", () => {
  it("appends a MatchRecord (result, mode, difficulty, timestamp) at game end", () => {
    let s = emptyStatsState();
    const rec = at("loss", { mode: "vs-computer", difficulty: "medium", timestamp: 42 });
    s = recordResult(s, rec);
    expect(s.history).toHaveLength(1);
    expect(s.history[0]).toEqual(rec);
  });

  it("keeps history append-only, newest last", () => {
    let s = emptyStatsState();
    s = recordResult(s, at("win", { timestamp: 1 }));
    s = recordResult(s, at("draw", { timestamp: 2 }));
    expect(s.history.map((r) => r.timestamp)).toEqual([1, 2]);
  });
});

describe("resultOf — perspective mapping", () => {
  it("draw is draw for either perspective", () => {
    expect(resultOf({ kind: "draw" }, "X")).toBe("draw");
  });
  it("win/loss are relative to the perspective mark", () => {
    const xWon = { kind: "won", mark: "X", line: [0, 1, 2] } as const;
    expect(resultOf(xWon, "X")).toBe("win");
    expect(resultOf(xWon, "O")).toBe("loss");
  });
  it("throws if the game is not over", () => {
    expect(() => resultOf({ kind: "in-progress" }, "X")).toThrow();
  });
});
