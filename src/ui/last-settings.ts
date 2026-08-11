// Last-used settings (FEAT-008, FR-MODE-005). Remembers the mode + difficulty a
// game was last started with, so Setup can default to them on next launch. UI-
// shell preference over the Storage Repository (ui → infra, ADR-003), mirroring
// ui/theme.ts. Side (humanMark) is intentionally not remembered (D2).

import { createStorageRepo, type StorageRepo } from "../infra/storage.ts";
import { DIFFICULTIES, type Difficulty } from "../core/index.ts";
import type { GameMode } from "./config.ts";

export interface LastSettings {
  mode: GameMode;
  difficulty: Difficulty;
}
export const SETTINGS_KEY = "ttt:settings:v1";

const MODES: readonly GameMode[] = ["two-player", "vs-computer"];

// Pure: validate an arbitrary loaded blob into LastSettings, or null if it is
// missing / corrupt / an unknown enum (→ caller uses the built-in defaults).
export function parseLastSettings(raw: unknown): LastSettings | null {
  if (!raw || typeof raw !== "object") return null;
  const { mode, difficulty } = raw as Record<string, unknown>;
  if (!MODES.includes(mode as GameMode)) return null;
  if (!DIFFICULTIES.includes(difficulty as Difficulty)) return null;
  return { mode: mode as GameMode, difficulty: difficulty as Difficulty };
}

const repo: StorageRepo = createStorageRepo();

/** The last-used settings, or null when there is no usable saved choice. */
export function loadLastSettings(): LastSettings | null {
  return parseLastSettings(repo.load<unknown>(SETTINGS_KEY, null));
}

/** Persist the settings a game was just started with (FR-MODE-005). */
export function saveLastSettings(settings: LastSettings): void {
  repo.save(SETTINGS_KEY, settings);
}
