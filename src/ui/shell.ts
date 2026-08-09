// UI shell — app controller. Holds the active GameConfig and routes the
// lateral navigation: Setup → Game (Start), Game → New Game (in-view), Game →
// Menu → Setup. Lands on Setup (technical-design §5). DOM-only.

import { el } from "./dom.ts";
import { createSetupView } from "./views/setup.ts";
import { createGameView } from "./views/game.ts";
import { createStatsView } from "./views/stats.ts";
import { createStatsStore } from "../infra/stats-store.ts";
import type { GameConfig } from "./config.ts";

export function mountShell(root: HTMLElement): void {
  const app = el("div", "app");
  root.replaceChildren(app);

  // One stats store for the session — loads persisted stats, records game ends
  // (FEAT-004), read by the stats view (FEAT-005). Shared across games/views.
  const statsStore = createStatsStore();

  // Held so Game → Stats → Back re-mounts the SAME game (state preserved, D1).
  let currentGameView: HTMLElement | null = null;

  function showSetup(): void {
    currentGameView = null;
    app.replaceChildren(createSetupView({ onStart: showGame, onViewStats: () => showStats(showSetup) }));
  }

  function showGame(config: GameConfig): void {
    currentGameView = createGameView(
      config,
      { onMenu: showSetup, onViewStats: () => showStats(backToGame) },
      statsStore,
    );
    app.replaceChildren(currentGameView);
  }

  function backToGame(): void {
    if (currentGameView) app.replaceChildren(currentGameView); // same element → game preserved
    else showSetup();
  }

  function showStats(back: () => void): void {
    app.replaceChildren(createStatsView(statsStore, { onBack: back }));
  }

  showSetup(); // land on Setup
}
