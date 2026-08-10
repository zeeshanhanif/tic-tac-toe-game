// Unit tests for last-used settings (FEAT-008). AC-2 (persist round-trip),
// AC-3 (graceful fallback on missing/corrupt data).

import { describe, it, expect } from "vitest";
import {
  parseLastSettings,
  loadLastSettings,
  saveLastSettings,
  type LastSettings,
} from "./last-settings.ts";

describe("parseLastSettings", () => {
  it("accepts a valid mode + difficulty (AC-1/AC-2)", () => {
    const s: LastSettings = { mode: "vs-computer", difficulty: "hard" };
    expect(parseLastSettings(s)).toEqual(s);
    expect(parseLastSettings({ mode: "two-player", difficulty: "medium" })).toEqual({
      mode: "two-player",
      difficulty: "medium",
    });
  });

  it("rejects missing / non-object / unknown-enum values → null (AC-3)", () => {
    expect(parseLastSettings(null)).toBeNull();
    expect(parseLastSettings("garbage")).toBeNull();
    expect(parseLastSettings({})).toBeNull();
    expect(parseLastSettings({ mode: "two-player" })).toBeNull(); // no difficulty
    expect(parseLastSettings({ mode: "solo", difficulty: "hard" })).toBeNull(); // bad mode
    expect(parseLastSettings({ mode: "vs-computer", difficulty: "insane" })).toBeNull(); // bad diff
  });
});

describe("save/load round-trip", () => {
  // In the Node unit env, localStorage is absent so the module repo falls back
  // to an in-memory store that persists for the module's lifetime — enough to
  // verify save→load composes parseLastSettings correctly (AC-2).
  it("persists a started game's settings and reads them back", () => {
    const s: LastSettings = { mode: "vs-computer", difficulty: "hard" };
    saveLastSettings(s);
    expect(loadLastSettings()).toEqual(s);

    // Overwriting with the next game's settings replaces them.
    const next: LastSettings = { mode: "two-player", difficulty: "easy" };
    saveLastSettings(next);
    expect(loadLastSettings()).toEqual(next);
  });
});
