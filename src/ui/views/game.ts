// Game view (SCR-WEB-002 / SCR-WEB-003) — a thin renderer of core GameState.
// All rules live in core/game.ts; win/draw in core/board.ts; AI move choice in
// core/ai.ts. This view renders state, forwards human clicks, and — in
// vs-Computer mode — orchestrates the AI's turn (delay + auto-move + input lock;
// architecture §5 keeps timers in the shell). FEAT-001 two-player + FEAT-002 AI.

import { el, topbar } from "../dom.ts";
import { newGame, playMove, chooseMove, type GameState, type Mark } from "../../core/index.ts";
import { log } from "../../infra/logger.ts";
import { PLAYER_LABELS, type GameConfig } from "../config.ts";

interface GameViewHandlers {
  onMenu: () => void; // return to Setup (FR-GAME-012)
}

const AI_DELAY_MS = 400; // brief perceptible delay (FR-AI-004)

export function createGameView(config: GameConfig, handlers: GameViewHandlers): HTMLElement {
  const vsComputer = config.mode === "vs-computer";
  const humanMark: Mark = config.humanMark ?? "X";
  const aiMark: Mark = humanMark === "X" ? "O" : "X";
  const difficulty = config.difficulty ?? "medium";

  let state: GameState = newGame("X"); // X first — FR-GAME-005
  let aiThinking = false;
  let aiTimer: ReturnType<typeof setTimeout> | null = null;

  const root = el("section", "view");

  const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
  const isHumanTurn = () => !vsComputer || state.current === humanMark;

  function labelFor(mark: Mark): { name: string; sub: string } {
    if (!vsComputer) return { name: PLAYER_LABELS[mark], sub: `Plays ${mark}` };
    return mark === humanMark
      ? { name: "You", sub: `Plays ${mark}` }
      : { name: "Computer", sub: `${cap(difficulty)} AI` };
  }

  function winningLine(): ReadonlySet<number> {
    return new Set(state.status.kind === "won" ? state.status.line : []);
  }

  function renderCard(mark: Mark): HTMLElement {
    const active = state.status.kind === "in-progress" && state.current === mark;
    const winner = state.status.kind === "won" && state.status.mark === mark;
    const card = el("div", `card ${mark.toLowerCase()}${active ? " active" : ""}${winner ? " winner" : ""}`);
    const badge = el("div", `badge ${mark.toLowerCase()}`, mark);
    const who = el("div", "who");
    const { name, sub } = labelFor(mark);
    who.append(el("div", "name", name), el("div", "sub", sub));
    card.append(badge, who);
    return card;
  }

  function renderScores(): HTMLElement {
    const scores = el("div", "scores");
    scores.append(renderCard("X"), renderCard("O"));
    return scores;
  }

  // Turn indicator (or "thinking") while playing; result banner once ended.
  function renderStatusBar(): HTMLElement {
    if (state.status.kind === "in-progress") {
      const turn = el("div", "turn");
      if (aiThinking) {
        turn.append(el("span", `pulse ${aiMark.toLowerCase()}`), el("span", undefined, "Computer is thinking…"));
      } else {
        const label = vsComputer && state.current === humanMark ? "Your turn" : `${state.current}'s turn`;
        turn.append(el("span", `pulse ${state.current.toLowerCase()}`), el("span", undefined, label)); // text, not color alone
      }
      return turn;
    }
    const banner = el("div", state.status.kind === "won" ? "result win" : "result draw");
    if (state.status.kind === "won") {
      banner.append(el("div", "big", `${state.status.mark} wins!`), el("div", "small", "Three in a row"));
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
      const playable = playing && value === null && !aiThinking && isHumanTurn();
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
    primary.addEventListener("click", startNewGame);
    const menu = el("button", "btn ghost", "Menu"); // FR-GAME-012
    menu.type = "button";
    menu.addEventListener("click", () => {
      cancelAI();
      handlers.onMenu();
    });
    actions.append(primary, menu);
    return actions;
  }

  function onCellClick(index: number): void {
    if (aiThinking || !isHumanTurn()) return; // locked during AI turn (NFR-REL-001)
    const { state: next, applied } = playMove(state, index);
    if (!applied) return; // occupied or game over — ignored (FR-GAME-003/004)
    state = next;
    log("cell.place", { index, status: state.status.kind });
    render();
    scheduleAIIfNeeded();
  }

  function startNewGame(): void {
    cancelAI();
    state = newGame("X");
    log("game.new", { mode: config.mode });
    render();
    scheduleAIIfNeeded(); // AI opens if the human chose O
  }

  function cancelAI(): void {
    if (aiTimer !== null) {
      clearTimeout(aiTimer);
      aiTimer = null;
    }
    aiThinking = false;
  }

  function scheduleAIIfNeeded(): void {
    if (!vsComputer || state.status.kind !== "in-progress" || state.current !== aiMark || aiThinking) return;
    aiThinking = true;
    render(); // show "thinking" + lock the board
    aiTimer = setTimeout(() => {
      aiTimer = null;
      aiThinking = false;
      const move = chooseMove(state.board, aiMark, difficulty);
      const { state: next, applied } = playMove(state, move);
      if (applied) state = next;
      log("ai.move", { move, difficulty, status: state.status.kind });
      render();
      scheduleAIIfNeeded(); // no-op unless somehow still AI's turn
    }, AI_DELAY_MS);
  }

  function render(): void {
    root.replaceChildren(topbar(), renderScores(), renderStatusBar(), renderBoard(), renderActions());
  }

  render();
  scheduleAIIfNeeded(); // AI opens if the human plays O
  return root;
}
