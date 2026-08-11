// Tiny DOM helper for the manual-rendering UI shell (ADR-002: no framework).
// Keeps view code declarative without hand-copying createElement boilerplate.

import { getTheme, setTheme } from "./theme.ts";

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** The wordmark (TIC·TAC·TOE), shared by the top bar on every screen. */
export function wordmark(): HTMLElement {
  const w = el("div", "wordmark");
  const x = el("span", "wx", "TIC");
  const o = el("span", "wo", "TOE");
  w.append(x, el("span", "dot", "·"), el("span", undefined, "TAC"), el("span", "dot", "·"), o);
  return w;
}

/** Light/Dark segmented theme toggle. Routes through the Theme Controller
 *  (apply + persist); reflects the active theme (FR-THEME-001/003, FEAT-007). */
export function themeToggle(): HTMLElement {
  const toggle = el("div", "toggle");
  const light = el("button", "seg-opt", "Light");
  const dark = el("button", "seg-opt", "Dark");
  light.type = "button";
  dark.type = "button";
  const paint = (theme: "light" | "dark") => {
    light.classList.toggle("on", theme === "light");
    dark.classList.toggle("on", theme === "dark");
  };
  light.addEventListener("click", () => {
    setTheme("light");
    paint("light");
  });
  dark.addEventListener("click", () => {
    setTheme("dark");
    paint("dark");
  });
  paint(getTheme());
  toggle.append(light, dark);
  return toggle;
}

/** Standard top bar: wordmark + theme toggle (plan IA — present on every screen). */
export function topbar(): HTMLElement {
  const bar = el("header", "topbar");
  bar.append(wordmark(), themeToggle());
  return bar;
}
