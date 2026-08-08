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

/** Map an ended game status to a result from `perspective`'s point of view. */
export function resultOf(status: GameStatus, perspective: Mark): GameResult {
  if (status.kind === "draw") return "draw";
  if (status.kind === "won") return status.mark === perspective ? "win" : "loss";
  throw new Error("resultOf: game is not over");
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
