// DEF-010 regression (NFR-MAINT-002). `DIFFICULTIES` is the single source the
// stats buckets derive from (core/ai.ts). Adding a level must flow through to
// the Vs. Computer and All totals, not only to the bucket that gets created,
// validated and incremented. Simulated by extending the list — its own file,
// because vi.mock applies to the whole module graph of this file.

import { describe, it, expect, vi } from "vitest";

vi.mock("./ai.ts", async (importOriginal) => {
  const orig = await importOriginal<typeof import("./ai.ts")>();
  return { ...orig, DIFFICULTIES: [...orig.DIFFICULTIES, "expert"] };
});

const { emptyStatsState, recordResult, summarize } = await import("./stats.ts");

describe("summarize — follows DIFFICULTIES (DEF-010)", () => {
  it("counts a level added to DIFFICULTIES in the Vs. Computer and All totals", () => {
    const record = {
      mode: "vs-computer" as const,
      // A level the real list does not have — the cast is the point of the test.
      difficulty: "expert" as unknown as "hard",
      result: "win" as const,
      timestamp: 1,
    };
    const s = recordResult(emptyStatsState(), record);

    // Premise: the mock took — the bucket exists and was incremented.
    expect((s.stats.vsComputer as Record<string, { wins: number }>).expert.wins).toBe(1);

    expect(summarize(s, "vs-computer")).toEqual({ wins: 1, losses: 0, draws: 0 });
    expect(summarize(s, "all")).toEqual({ wins: 1, losses: 0, draws: 0 });
  });
});
