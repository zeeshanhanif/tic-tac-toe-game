// Infra unit tests: stats store — record→persist→restore (AC-3, AC-4, AC-6).

import { describe, it, expect } from "vitest";
import { createStorageRepo, type StorageLike } from "./storage.ts";
import { createStatsStore, STATS_KEY } from "./stats-store.ts";
import type { MatchRecord } from "../core/index.ts";

function fakeStore(seed: Record<string, string> = {}): StorageLike {
  const m = new Map(Object.entries(seed));
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => {
      m.set(k, v);
    },
  };
}

const rec = (over: Partial<MatchRecord> = {}): MatchRecord => ({
  mode: "two-player",
  result: "win",
  timestamp: 1,
  ...over,
});

describe("stats-store", () => {
  it("records a finished game once: tally + history (AC-3)", () => {
    const store = createStatsStore(createStorageRepo(fakeStore()));
    store.record(rec({ mode: "vs-computer", difficulty: "hard", result: "loss" }));
    const s = store.snapshot();
    expect(s.stats.vsComputer.hard).toEqual({ wins: 0, losses: 1, draws: 0 });
    expect(s.history).toHaveLength(1);
  });

  it("persists and restores across store instances (AC-4)", () => {
    const backend = fakeStore(); // shared localStorage
    createStatsStore(createStorageRepo(backend)).record(
      rec({ mode: "vs-computer", difficulty: "hard" }),
    );

    // A fresh store over the same backend restores the persisted state.
    const restored = createStatsStore(createStorageRepo(backend)).snapshot();
    expect(restored.stats.vsComputer.hard.wins).toBe(1);
    expect(restored.history).toHaveLength(1);
  });

  it("resets to empty when persisted data is corrupt (AC-6)", () => {
    const store = createStatsStore(createStorageRepo(fakeStore({ [STATS_KEY]: "garbage{{{" })));
    expect(store.snapshot().history).toHaveLength(0);
    expect(store.snapshot().stats.twoPlayer).toEqual({ wins: 0, losses: 0, draws: 0 });
  });

  it("resets to empty on a version mismatch (AC-6)", () => {
    const stale = JSON.stringify({ version: 999, stats: {}, history: [{}] });
    const store = createStatsStore(createStorageRepo(fakeStore({ [STATS_KEY]: stale })));
    expect(store.snapshot().history).toHaveLength(0);
  });
});
