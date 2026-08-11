// Infrastructure — stats store. Holds the current StatsState, records finished
// games through the pure core (recordResult), and persists via the Storage
// Repository. The UI talks to this (ADR-003: ui → infra → core). FR-STATS-005/007.

import {
  emptyStatsState,
  isValidStatsState,
  recordResult,
  type MatchRecord,
  type StatsState,
} from "../core/index.ts";
import { createStorageRepo, type StorageRepo } from "./storage.ts";

export const STATS_KEY = "ttt:stats:v1";

// Load persisted state; reset to empty on version mismatch or any corrupt/partial
// shape (architecture §8 / NFR-REL-001) — full-shape validation via the pure
// core guard, not shallow truthiness (DEF-003).
function loadState(repo: StorageRepo): StatsState {
  const loaded = repo.load<unknown>(STATS_KEY, null);
  return isValidStatsState(loaded) ? loaded : emptyStatsState();
}

export interface StatsStore {
  record(record: MatchRecord): StatsState;
  snapshot(): StatsState;
  reset(): StatsState;
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
    reset(): StatsState {
      state = emptyStatsState(); // pure core — zeroed, versioned
      repo.save(STATS_KEY, state); // persist the cleared state (FR-STATS-006)
      return state;
    },
  };
}
