// UI-shell app config passed from Setup to Game. Not a core concern.
// two-player uses `mode` only; vs-computer adds difficulty + which side the
// human plays (FEAT-002). Hard difficulty is gated until FEAT-003.

import type { Mark, Difficulty, GameMode } from "../core/index.ts";

// GameMode now lives in core (persisted MatchRecord field); re-export for
// existing ui call-sites (FEAT-004 D3).
export type { GameMode };

export interface GameConfig {
  mode: GameMode;
  difficulty?: Difficulty; // vs-computer only (easy | medium; hard = FEAT-003)
  humanMark?: Mark; // vs-computer only — which side the human plays (FR-MODE-003)
}

// 2-player scoreboard labels (ux-foundations Part D — not "You/Computer").
export const PLAYER_LABELS: Record<Mark, string> = { X: "Player 1", O: "Player 2" };
