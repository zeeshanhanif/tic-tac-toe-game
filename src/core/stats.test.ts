// Core unit tests (NFR-MAINT-002): Stats Service — stats.ts.

import { describe, it, expect } from "vitest";
import {
  emptyStatsState,
  isValidStatsState,
  recordResult,
  resultOf,
  summarize,
  filterHistory,
  type MatchRecord,
  type StatsState,
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

function build(): StatsState {
  let s = emptyStatsState();
  s = recordResult(s, { mode: "two-player", result: "win", timestamp: 1 });
  s = recordResult(s, { mode: "vs-computer", difficulty: "hard", result: "loss", timestamp: 2 });
  s = recordResult(s, { mode: "vs-computer", difficulty: "easy", result: "win", timestamp: 3 });
  s = recordResult(s, { mode: "two-player", result: "draw", timestamp: 4 });
  return s;
}

describe("summarize — W/L/D by filter (AC-1, AC-5, FR-STATS-003)", () => {
  it("aggregates all modes", () => {
    expect(summarize(build(), "all")).toEqual({ wins: 2, losses: 1, draws: 1 });
  });
  it("filters to two-player", () => {
    expect(summarize(build(), "two-player")).toEqual({ wins: 1, losses: 0, draws: 1 });
  });
  it("filters to vs-computer (sum of difficulties)", () => {
    expect(summarize(build(), "vs-computer")).toEqual({ wins: 1, losses: 1, draws: 0 });
  });
  it("empty store → zeroed counts (AC-3)", () => {
    expect(summarize(emptyStatsState(), "all")).toEqual({ wins: 0, losses: 0, draws: 0 });
  });
});

describe("filterHistory — chronological, newest first (AC-2, AC-5, FR-STATS-004, D3)", () => {
  it("returns all matches newest-first", () => {
    expect(filterHistory(build(), "all").map((r) => r.timestamp)).toEqual([4, 3, 2, 1]);
  });
  it("filters two-player, newest-first", () => {
    expect(filterHistory(build(), "two-player").map((r) => r.timestamp)).toEqual([4, 1]);
  });
  it("filters vs-computer, newest-first", () => {
    expect(filterHistory(build(), "vs-computer").map((r) => r.timestamp)).toEqual([3, 2]);
  });
  it("empty store → [] (AC-3)", () => {
    expect(filterHistory(emptyStatsState(), "all")).toEqual([]);
  });
  it("does not mutate the stored history", () => {
    const s = build();
    filterHistory(s, "all");
    expect(s.history.map((r) => r.timestamp)).toEqual([1, 2, 3, 4]); // still oldest-first
  });
});

describe("isValidStatsState — full-shape guard (DEF-003, NFR-REL-001)", () => {
  it("accepts a well-formed state", () => {
    expect(isValidStatsState(emptyStatsState())).toBe(true);
    expect(isValidStatsState(build())).toBe(true);
  });

  it("rejects non-objects and wrong version", () => {
    expect(isValidStatsState(null)).toBe(false);
    expect(isValidStatsState("garbage")).toBe(false);
    expect(isValidStatsState({ ...emptyStatsState(), version: 999 })).toBe(false);
  });

  it("rejects a partial stats tree — missing vsComputer sub-tree", () => {
    expect(
      isValidStatsState({ version: 1, stats: { twoPlayer: { wins: 0, losses: 0, draws: 0 } }, history: [] }),
    ).toBe(false);
  });

  it("rejects a missing difficulty bucket and non-numeric WLD fields", () => {
    const base = emptyStatsState();
    // drop one difficulty bucket
    const missingHard = { ...base, stats: { ...base.stats, vsComputer: { easy: base.stats.vsComputer.easy, medium: base.stats.vsComputer.medium } } };
    expect(isValidStatsState(missingHard)).toBe(false);
    // non-numeric WLD field
    const badWLD = { ...base, stats: { ...base.stats, twoPlayer: { wins: "1", losses: 0, draws: 0 } } };
    expect(isValidStatsState(badWLD)).toBe(false);
  });

  it("rejects nonsensical numeric counts — negative, non-integer, Infinity (review #3)", () => {
    const base = emptyStatsState();
    const withCount = (wins: unknown) => ({
      ...base,
      stats: { ...base.stats, twoPlayer: { wins, losses: 0, draws: 0 } },
    });
    expect(isValidStatsState(withCount(-1))).toBe(false); // negative
    expect(isValidStatsState(withCount(1.5))).toBe(false); // non-integer
    expect(isValidStatsState(withCount(Infinity))).toBe(false); // overflow
    expect(isValidStatsState(withCount(0))).toBe(true); // a valid count still passes
  });

  it("rejects history that is not an array", () => {
    expect(isValidStatsState({ ...emptyStatsState(), history: {} })).toBe(false);
  });

  it("rejects malformed history elements; accepts well-formed ones (DEF-003 completion)", () => {
    const base = emptyStatsState();
    expect(isValidStatsState({ ...base, history: [{}] })).toBe(false); // no fields
    expect(isValidStatsState({ ...base, history: [{ mode: "two-player", result: "win" }] })).toBe(false); // no timestamp
    expect(isValidStatsState({ ...base, history: [{ mode: "solo", result: "win", timestamp: 1 }] })).toBe(false); // bad mode
    expect(
      isValidStatsState({ ...base, history: [{ mode: "vs-computer", difficulty: "insane", result: "win", timestamp: 1 }] }),
    ).toBe(false); // bad difficulty
    // Well-formed entries (two-player without difficulty; vs-computer with) pass.
    expect(
      isValidStatsState({
        ...base,
        history: [
          { mode: "two-player", result: "draw", timestamp: 1 },
          { mode: "vs-computer", difficulty: "hard", result: "loss", timestamp: 2 },
        ],
      }),
    ).toBe(true);
  });
});
