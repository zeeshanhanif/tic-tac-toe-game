// Infrastructure — stats store. Holds the current StatsState, records finished
// games through the pure core (recordResult), and persists via the Storage
// Repository. The UI talks to this (ADR-003: ui → infra → core). FR-STATS-005/007.

import {
  emptyStatsState,
  recordResult,
  STATS_VERSION,
  type MatchRecord,
  type StatsState,
} from "../core/index.ts";
import { createStorageRepo, type StorageRepo } from "./storage.ts";

export const STATS_KEY = "ttt:stats:v1";

// Load persisted state; reset to empty on version mismatch or corrupt shape
// (architecture §8 / NFR-REL-001).
function loadState(repo: StorageRepo): StatsState {
  const loaded = repo.load<StatsState | null>(STATS_KEY, null);
  if (!loaded || loaded.version !== STATS_VERSION || !loaded.stats || !loaded.history) {
    return emptyStatsState();
  }
  return loaded;
}

export interface StatsStore {
  record(record: MatchRecord): StatsState;
  snapshot(): StatsState;
}

export function createStatsStore(repo: StorageRepo = createStorageRepo()): StatsStore {
  let state = loadState(repo);
  return {
    record(record: MatchRecord): StatsState {
      state = recordResult(state, record); // pure core
      repo.save(STATS_KEY, state); // persist (graceful)
      return state;
    },
    snapshot(): StatsState {
      return state;
    },
  };
}
