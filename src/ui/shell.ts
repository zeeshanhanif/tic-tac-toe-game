// UI shell — top bar, lateral navigation frame, and the view container.
// The landing place every per-slice screen attaches to (plan §2). DOM-only.

import { createSetupView } from "./views/setup.ts";
import { createGameView } from "./views/game.ts";
import { createStatsView } from "./views/stats.ts";

export type ViewName = "setup" | "game" | "stats";

const VIEWS: Record<ViewName, () => HTMLElement> = {
  setup: createSetupView,
  game: createGameView,
  stats: createStatsView,
};

const NAV_ORDER: ViewName[] = ["setup", "game", "stats"];

export function mountShell(root: HTMLElement): void {
  const app = document.createElement("div");
  app.className = "app";

  const topbar = document.createElement("header");
  topbar.className = "topbar";

  const wordmark = document.createElement("span");
  wordmark.className = "wordmark";
  wordmark.textContent = "Tic-Tac-Toe";

  const nav = document.createElement("nav");
  nav.className = "nav";
  nav.setAttribute("aria-label", "Primary");

  const viewRoot = document.createElement("main");
  viewRoot.className = "view-root";

  function show(name: ViewName): void {
    viewRoot.replaceChildren(VIEWS[name]());
    nav.querySelectorAll<HTMLButtonElement>("button[data-view]").forEach((b) => {
      b.setAttribute("aria-current", b.dataset.view === name ? "page" : "false");
    });
  }

  for (const name of NAV_ORDER) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nav__link";
    btn.dataset.view = name;
    btn.textContent = name[0].toUpperCase() + name.slice(1);
    btn.addEventListener("click", () => show(name));
    nav.appendChild(btn);
  }

  const themeToggle = document.createElement("button");
  themeToggle.type = "button";
  themeToggle.className = "toggle";
  themeToggle.textContent = "Theme";
  themeToggle.setAttribute("aria-label", "Toggle light or dark theme");
  themeToggle.addEventListener("click", toggleTheme);
  nav.appendChild(themeToggle);

  topbar.append(wordmark, nav);
  app.append(topbar, viewRoot);
  root.replaceChildren(app);

  show("game"); // skeleton lands on the board
}

// Skeleton theme toggle — flips the token theme. OS default + persistence are FEAT-007.
function toggleTheme(): void {
  const el = document.documentElement;
  const next = el.getAttribute("data-theme") === "dark" ? "light" : "dark";
  el.setAttribute("data-theme", next);
}
