// UI shell — app controller. Holds the active GameConfig and routes the
// lateral navigation: Setup → Game (Start), Game → New Game (in-view), Game →
// Menu → Setup. Lands on Setup (technical-design §5). DOM-only.

import { el } from "./dom.ts";
import { createSetupView } from "./views/setup.ts";
import { createGameView } from "./views/game.ts";
import type { GameConfig } from "./config.ts";

export function mountShell(root: HTMLElement): void {
  const app = el("div", "app");
  root.replaceChildren(app);

  function showSetup(): void {
    app.replaceChildren(createSetupView({ onStart: showGame }));
  }

  function showGame(config: GameConfig): void {
    app.replaceChildren(createGameView(config, { onMenu: showSetup }));
  }

  showSetup(); // land on Setup
}
