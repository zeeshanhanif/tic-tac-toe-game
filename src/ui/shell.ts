// UI shell — app controller. Holds the active GameConfig and routes the
// lateral navigation: Setup → Game (Start), Game → New Game (in-view), Game →
// Menu → Setup. Lands on Setup (technical-design §5). DOM-only.

import { el } from "./dom.ts";
import { createSetupView } from "./views/setup.ts";
import { createGameView, type GameView } from "./views/game.ts";
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
  let currentGameView: GameView | null = null;

  function showSetup(): void {
    // Every exit from the game pauses it. The Menu handler already cancels, so
    // this is belt-and-braces today — but it keeps the invariant "the shell owns
    // the timer lifecycle" true at *all* exits, rather than leaving one of them
    // depending on the view to cancel itself (DEF-006).
    currentGameView?.pause();
    currentGameView = null;
    app.replaceChildren(createSetupView({ onStart: showGame, onViewStats: () => showStats(showSetup) }));
  }

  function showGame(config: GameConfig): void {
    currentGameView = createGameView(
      config,
      { onMenu: showSetup, onViewStats: leaveGameForStats },
      statsStore,
    );
    app.replaceChildren(currentGameView.element);
  }

  // The game keeps its state while the user is in Stats, but not its timers:
  // an AI move fired from a detached view would record a result the Stats view
  // has already read past (DEF-006).
  function leaveGameForStats(): void {
    currentGameView?.pause();
    showStats(backToGame);
  }

  function backToGame(): void {
    if (currentGameView) {
      app.replaceChildren(currentGameView.element); // same element → game preserved
      currentGameView.resume(); // re-arm the AI turn we paused on the way out
    } else {
      showSetup();
    }
  }

  function showStats(back: () => void): void {
    app.replaceChildren(createStatsView(statsStore, { onBack: back }));
  }

  showSetup(); // land on Setup
}
