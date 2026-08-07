// Game view (SCR-WEB-002 / SCR-WEB-003) — a thin renderer of core GameState.
// All rules live in core/game.ts; this view renders state and forwards clicks
// (technical-design §5). 2-player variant: Player 1 (X) / Player 2 (O).

import { el, topbar } from "../dom.ts";
import { newGame, playMove, type GameState, type Mark } from "../../core/index.ts";
import { log } from "../../infra/logger.ts";
import { PLAYER_LABELS, type GameConfig } from "../config.ts";

interface GameViewHandlers {
  onMenu: () => void; // return to Setup (FR-GAME-012)
}

export function createGameView(_config: GameConfig, handlers: GameViewHandlers): HTMLElement {
  let state: GameState = newGame("X"); // X first — FR-GAME-005

  const root = el("section", "view");

  function winningLine(): ReadonlySet<number> {
    return new Set(state.status.kind === "won" ? state.status.line : []);
  }

  function renderCard(mark: Mark): HTMLElement {
    const active = state.status.kind === "in-progress" && state.current === mark;
    const winner = state.status.kind === "won" && state.status.mark === mark;
    const card = el("div", `card ${mark.toLowerCase()}${active ? " active" : ""}${winner ? " winner" : ""}`);
    const badge = el("div", `badge ${mark.toLowerCase()}`, mark);
    const who = el("div", "who");
    who.append(el("div", "name", PLAYER_LABELS[mark]), el("div", "sub", `Plays ${mark}`));
    card.append(badge, who);
    return card;
  }

  function renderScores(): HTMLElement {
    const scores = el("div", "scores");
    scores.append(renderCard("X"), renderCard("O"));
    return scores;
  }

  // Turn indicator while playing; result banner once the game ends.
  function renderStatusBar(): HTMLElement {
    if (state.status.kind === "in-progress") {
      const turn = el("div", "turn");
      const pulse = el("span", `pulse ${state.current.toLowerCase()}`);
      turn.append(pulse, el("span", undefined, `${state.current}'s turn`)); // text, not color alone (NFR-USE-003)
      return turn;
    }
    const banner = el("div", state.status.kind === "won" ? "result win" : "result draw");
    if (state.status.kind === "won") {
      banner.append(
        el("div", "big", `${state.status.mark} wins!`),
        el("div", "small", "Three in a row"),
      );
    } else {
      banner.append(el("div", "big", "Draw"), el("div", "small", "Nobody wins — play again?"));
    }
    return banner;
  }

  function renderBoard(): HTMLElement {
    const board = el("div", "board");
    board.setAttribute("role", "grid");
    board.setAttribute("aria-label", "Tic-tac-toe board");
    const line = winningLine();
    const playing = state.status.kind === "in-progress";
    state.board.forEach((value, index) => {
      const isWin = line.has(index);
      const playable = playing && value === null;
      const cell = el(
        "button",
        `cell${value ? ` ${value.toLowerCase()}` : ""}${isWin ? " win" : ""}${playable ? " playable" : ""}`,
      );
      cell.type = "button";
      cell.textContent = value ?? "";
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", value ? `Cell ${index + 1}, ${value}` : `Cell ${index + 1}, empty`);
      if (isWin) cell.setAttribute("aria-label", `Cell ${index + 1}, ${value}, winning line`);
      cell.addEventListener("click", () => onCellClick(index));
      board.appendChild(cell);
    });
    return board;
  }

  function renderActions(): HTMLElement {
    const actions = el("div", "actions");
    const ended = state.status.kind !== "in-progress";
    const primary = el("button", "btn primary", ended ? "Play Again" : "New Game"); // FR-GAME-011
    primary.type = "button";
    primary.addEventListener("click", () => {
      state = newGame("X");
      log("game.new", {});
      render();
    });
    const menu = el("button", "btn ghost", "Menu"); // FR-GAME-012
    menu.type = "button";
    menu.addEventListener("click", handlers.onMenu);
    actions.append(primary, menu);
    return actions;
  }

  function onCellClick(index: number): void {
    const { state: next, applied } = playMove(state, index);
    if (!applied) return; // occupied or game over — ignored (FR-GAME-003/004)
    state = next;
    log("cell.place", { index, status: state.status.kind });
    render();
  }

  function render(): void {
    root.replaceChildren(topbar(), renderScores(), renderStatusBar(), renderBoard(), renderActions());
  }

  render();
  return root;
}
