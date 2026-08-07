// UI-shell app config passed from Setup to Game. Not a core concern.
// FEAT-001 implements only "two-player"; vs-computer fields (difficulty, side)
// are added by FEAT-002.

import type { Mark } from "../core/index.ts";

export type GameMode = "two-player" | "vs-computer";

export interface GameConfig {
  mode: GameMode;
}

// 2-player scoreboard labels (ux-foundations Part D — not "You/Computer").
export const PLAYER_LABELS: Record<Mark, string> = { X: "Player 1", O: "Player 2" };
