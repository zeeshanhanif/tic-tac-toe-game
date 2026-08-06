// Game view — the walking skeleton's one end-to-end operation:
// UI click → core.applyMove → new immutable board → re-render.
// Turn management, win/draw, result banner, and AI are FEAT-001..003.

import { EMPTY_BOARD, applyMove, type Board, type Mark } from "../../core/index.ts";
import { log } from "../../infra/logger.ts";

export function createGameView(): HTMLElement {
  let board: Board = EMPTY_BOARD;
  let current: Mark = "X"; // X first (FR-GAME-005); full turn logic is FEAT-001.

  const root = document.createElement("section");
  root.className = "view";

  const title = document.createElement("h1");
  title.className = "view__title";
  title.textContent = "Game";

  const note = document.createElement("p");
  note.className = "muted";
  note.textContent =
    "Walking skeleton: click a cell to place a mark. Turn logic, win/draw detection, and AI arrive in FEAT-001+.";

  const grid = document.createElement("div");
  grid.className = "board";
  grid.setAttribute("role", "grid");
  grid.setAttribute("aria-label", "Tic-tac-toe board");

  function render(): void {
    grid.replaceChildren();
    board.forEach((value, index) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell" + (value ? ` cell--${value.toLowerCase()}` : "");
      cell.setAttribute("role", "gridcell");
      cell.setAttribute(
        "aria-label",
        value ? `Cell ${index + 1}, ${value}` : `Cell ${index + 1}, empty`,
      );
      cell.textContent = value ?? "";
      cell.addEventListener("click", () => onCellClick(index));
      grid.appendChild(cell);
    });
  }

  function onCellClick(index: number): void {
    const result = applyMove(board, index, current);
    if (!result.applied) return; // occupied cell — ignored (FR-GAME-003)
    board = result.board;
    current = current === "X" ? "O" : "X";
    log("cell.place", { index, status: result.status.kind });
    render();
  }

  render();
  root.append(title, note, grid);
  return root;
}
