// Domain core — Stats Service (pure, DOM/IO-free). W/L/D tallies + match
// history. Persistence is done by infra/stats-store.ts (ADR-003: core imports
// nothing outward). FR-STATS-001/002/007.

import type { Difficulty } from "./ai.ts";
import type { GameStatus, Mark } from "./board.ts";

// GameMode is core data (a MatchRecord field persisted by infra); ui/config.ts
// re-exports it. (D3 — moved here from ui so core owns the record type.)
export type GameMode = "two-player" | "vs-computer";

// Result from a fixed perspective: human in vs-Computer, Player 1 (X) in
// 2-player (D2).
export type GameResult = "win" | "loss" | "draw";

export interface WLD {
  wins: number;
  losses: number;
  draws: number;
}

export interface Stats {
  twoPlayer: WLD;
  vsComputer: Record<Difficulty, WLD>;
}

export interface MatchRecord {
  mode: GameMode;
  difficulty?: Difficulty; // vs-computer only
  result: GameResult;
  timestamp: number; // ms epoch
}

export interface StatsState {
  version: number;
  stats: Stats;
  history: MatchRecord[]; // append-only, newest last
}

export const STATS_VERSION = 1;

function emptyWLD(): WLD {
  return { wins: 0, losses: 0, draws: 0 };
}

export function emptyStatsState(): StatsState {
  return {
    version: STATS_VERSION,
    stats: {
      twoPlayer: emptyWLD(),
      vsComputer: { easy: emptyWLD(), medium: emptyWLD(), hard: emptyWLD() },
    },
    history: [],
  };
}

function isWLD(x: unknown): x is WLD {
  if (!x || typeof x !== "object") return false;
  const w = x as Record<string, unknown>;
  return typeof w.wins === "number" && typeof w.losses === "number" && typeof w.draws === "number";
}

/**
 * Pure type-guard for a persisted StatsState (DEF-003). Validates the full
 * shape — current version, both stat buckets as WLD triples, history an array —
 * so a partially-corrupt object (e.g. a missing `vsComputer` sub-tree) is
 * rejected and the caller resets to defaults (architecture §8 / NFR-REL-001).
 * History *element* shape is not validated here (out of DEF-003's scope).
 */
export function isValidStatsState(x: unknown): x is StatsState {
  if (!x || typeof x !== "object") return false;
  const s = x as Record<string, unknown>;
  if (s.version !== STATS_VERSION) return false;
  if (!Array.isArray(s.history)) return false;
  if (!s.stats || typeof s.stats !== "object") return false;
  const stats = s.stats as Record<string, unknown>;
  if (!isWLD(stats.twoPlayer)) return false;
  if (!stats.vsComputer || typeof stats.vsComputer !== "object") return false;
  const vs = stats.vsComputer as Record<string, unknown>;
  return isWLD(vs.easy) && isWLD(vs.medium) && isWLD(vs.hard);
}

/** Map an ended game status to a result from `perspective`'s point of view. */
export function resultOf(status: GameStatus, perspective: Mark): GameResult {
  if (status.kind === "draw") return "draw";
  if (status.kind === "won") return status.mark === perspective ? "win" : "loss";
  throw new Error("resultOf: game is not over");
}

// --- Read helpers for the stats view (FEAT-005, pure) ---

export type StatsFilter = "all" | "two-player" | "vs-computer";

function addWLD(a: WLD, b: WLD): WLD {
  return { wins: a.wins + b.wins, losses: a.losses + b.losses, draws: a.draws + b.draws };
}

/** Aggregate W/L/D for the selected filter (FR-STATS-003). */
export function summarize(state: StatsState, filter: StatsFilter): WLD {
  const { twoPlayer, vsComputer } = state.stats;
  const vsAll = addWLD(addWLD(vsComputer.easy, vsComputer.medium), vsComputer.hard);
  switch (filter) {
    case "two-player":
      return { ...twoPlayer };
    case "vs-computer":
      return vsAll;
    case "all":
      return addWLD(twoPlayer, vsAll);
  }
}

/** History filtered by mode, newest first (stored oldest-first) (FR-STATS-004, D3). */
export function filterHistory(state: StatsState, filter: StatsFilter): MatchRecord[] {
  const mode: GameMode | null =
    filter === "two-player" ? "two-player" : filter === "vs-computer" ? "vs-computer" : null;
  const matches = mode === null ? state.history : state.history.filter((r) => r.mode === mode);
  return [...matches].reverse();
}

/** Pure: increment the right W/L/D bucket and append the record (FR-STATS-001/002). */
export function recordResult(state: StatsState, record: MatchRecord): StatsState {
  const key = record.result === "win" ? "wins" : record.result === "loss" ? "losses" : "draws";

  let stats: Stats;
  if (record.mode === "vs-computer") {
    const diff = record.difficulty ?? "medium";
    const bucket = state.stats.vsComputer[diff];
    stats = {
      ...state.stats,
      vsComputer: { ...state.stats.vsComputer, [diff]: { ...bucket, [key]: bucket[key] + 1 } },
    };
  } else {
    const bucket = state.stats.twoPlayer;
    stats = { ...state.stats, twoPlayer: { ...bucket, [key]: bucket[key] + 1 } };
  }

  return { ...state, stats, history: [...state.history, record] };
}
