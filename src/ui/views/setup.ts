// Setup view (SCR-WEB-001, 2-player path). Choose mode and start a game.
// FEAT-001: "2 Players" is functional; "Vs. Computer" is present but deferred
// to FEAT-002 (its difficulty + side controls are hidden until then).

import { el, topbar } from "../dom.ts";
import type { GameConfig, GameMode } from "../config.ts";

interface SetupViewHandlers {
  onStart: (config: GameConfig) => void; // FR-MODE-004
}

export function createSetupView(handlers: SetupViewHandlers): HTMLElement {
  let mode: GameMode = "two-player"; // FEAT-001 default (functional path)

  const root = el("section", "view");

  const hero = el("div", "hero");
  hero.append(el("h1", undefined, "New Game"), el("p", undefined, "Choose how you want to play."));

  const field = el("div", "field");
  field.append(el("div", "label", "Mode"));
  const modes = el("div", "modes");

  const cards: Record<GameMode, HTMLElement> = {
    "vs-computer": modeCard("vs-computer", "Vs. Computer", "Coming soon (FEAT-002)."),
    "two-player": modeCard("two-player", "2 Players", "Share this device."),
  };

  function modeCard(value: GameMode, title: string, desc: string): HTMLElement {
    const card = el("div", "mode");
    const glyphs = el("div", "glyphs");
    glyphs.append(el("div", "g x", "X"), el("div", "g o", "O"));
    card.append(glyphs, el("div", "mtitle", title), el("div", "mdesc", desc));
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    const select = () => {
      mode = value;
      syncSelection();
    };
    card.addEventListener("click", select);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select();
      }
    });
    return card;
  }

  function syncSelection(): void {
    for (const [value, card] of Object.entries(cards)) {
      const sel = value === mode;
      card.classList.toggle("sel", sel);
      card.setAttribute("aria-pressed", String(sel));
    }
    // vs-computer is not startable in FEAT-001.
    startBtn.disabled = mode === "vs-computer";
  }

  modes.append(cards["vs-computer"], cards["two-player"]);
  field.append(modes);

  const startBtn = el("button", "btn primary", "Start Game");
  startBtn.type = "button";
  startBtn.addEventListener("click", () => handlers.onStart({ mode }));

  syncSelection();
  root.append(topbar(), hero, field, startBtn);
  return root;
}
