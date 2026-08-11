// Setup view (SCR-WEB-001). Choose mode and start a game.
// FEAT-002: both "2 Players" and "Vs. Computer" are functional; vs-Computer
// reveals Difficulty (Easy/Medium; Hard disabled until FEAT-003) and a "You
// play as" side choice (FR-MODE-002 partial, FR-MODE-003).

import { el, topbar } from "../dom.ts";
import { loadLastSettings, saveLastSettings } from "../last-settings.ts";
import type { Difficulty, Mark } from "../../core/index.ts";
import type { GameConfig, GameMode } from "../config.ts";

interface SetupViewHandlers {
  onStart: (config: GameConfig) => void; // FR-MODE-004
  onViewStats: () => void; // open the stats view (FR-UI-002)
}

export function createSetupView(handlers: SetupViewHandlers): HTMLElement {
  // Default to the last-used mode/difficulty (FR-MODE-005), else the built-ins.
  const remembered = loadLastSettings();
  let mode: GameMode = remembered?.mode ?? "two-player";
  let difficulty: Difficulty = remembered?.difficulty ?? "medium";
  let humanMark: Mark = "X"; // default — X goes first (side is not remembered, D2)

  const root = el("section", "view");

  const hero = el("div", "hero");
  hero.append(el("h1", undefined, "New Game"), el("p", undefined, "Choose how you want to play."));

  // --- Mode ---
  const modeField = el("div", "field");
  modeField.append(el("div", "label", "Mode"));
  const modes = el("div", "modes");
  const modeCards: Record<GameMode, HTMLElement> = {
    "vs-computer": modeCard("vs-computer", "Vs. Computer", "Play solo against the AI."),
    "two-player": modeCard("two-player", "2 Players", "Share this device."),
  };
  modes.append(modeCards["vs-computer"], modeCards["two-player"]);
  modeField.append(modes);

  function modeCard(value: GameMode, title: string, desc: string): HTMLElement {
    const card = el("div", "mode");
    const glyphs = el("div", "glyphs");
    glyphs.append(el("div", "g x", "X"), el("div", "g o", "O"));
    card.append(glyphs, el("div", "mtitle", title), el("div", "mdesc", desc));
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    const select = () => {
      mode = value;
      sync();
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

  // --- Difficulty (vs-computer only) ---
  const diffField = el("div", "field");
  diffField.append(el("div", "label", "Difficulty"));
  const seg = el("div", "seg");
  const diffButtons: [Difficulty, string][] = [
    ["easy", "Easy"],
    ["medium", "Medium"],
    ["hard", "Hard"], // enabled in FEAT-003 (minimax)
  ];
  const diffEls = new Map<Difficulty, HTMLButtonElement>();
  for (const [value, text] of diffButtons) {
    const btn = el("button", undefined, text);
    btn.type = "button";
    btn.addEventListener("click", () => {
      difficulty = value;
      sync();
    });
    diffEls.set(value, btn);
    seg.append(btn);
  }
  const DIFF_NOTES: Record<Difficulty, string> = {
    easy: "Easy plays a random move.",
    medium: "Medium blocks your winning moves.",
    hard: "Hard plays perfectly — the best you can do is draw.",
  };
  const diffNote = el("div", "note", DIFF_NOTES.medium);
  diffField.append(seg, diffNote);

  // --- You play as (vs-computer only) ---
  const sideField = el("div", "field");
  sideField.append(el("div", "label", "You play as"));
  const pillrow = el("div", "pillrow");
  const sideEls = new Map<Mark, HTMLElement>();
  for (const [markValue, caption] of [["X", "X · goes first"], ["O", "O · goes second"]] as [Mark, string][]) {
    const pill = el("div", `pill ${markValue.toLowerCase()}`);
    pill.append(el("div", `g ${markValue.toLowerCase()}`, markValue), document.createTextNode(caption));
    pill.setAttribute("role", "button");
    pill.tabIndex = 0;
    const select = () => {
      humanMark = markValue;
      sync();
    };
    pill.addEventListener("click", select);
    pill.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select();
      }
    });
    sideEls.set(markValue, pill);
    pillrow.append(pill);
  }
  sideField.append(pillrow);

  const startBtn = el("button", "btn primary", "Start Game");
  startBtn.type = "button";
  startBtn.addEventListener("click", () => {
    saveLastSettings({ mode, difficulty }); // remember the most-recently-used (FR-MODE-005, D1)
    handlers.onStart(mode === "vs-computer" ? { mode, difficulty, humanMark } : { mode });
  });

  function sync(): void {
    for (const [value, card] of Object.entries(modeCards)) {
      const s = value === mode;
      card.classList.toggle("sel", s);
      card.setAttribute("aria-pressed", String(s));
    }
    const vsComputer = mode === "vs-computer";
    diffField.hidden = !vsComputer;
    sideField.hidden = !vsComputer;
    for (const [value, btn] of diffEls) btn.classList.toggle("on", value === difficulty);
    diffNote.textContent = DIFF_NOTES[difficulty];
    for (const [value, pill] of sideEls) {
      const s = value === humanMark;
      pill.classList.toggle("sel", s);
      pill.setAttribute("aria-pressed", String(s));
    }
  }

  const footer = el("div", "footer");
  const statsLink = el("button", "link", "View stats & history"); // FR-UI-002
  statsLink.type = "button";
  statsLink.addEventListener("click", () => handlers.onViewStats());
  footer.append(statsLink);

  sync();
  root.append(topbar(), hero, modeField, diffField, sideField, startBtn, footer);
  return root;
}
