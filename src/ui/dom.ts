// Tiny DOM helper for the manual-rendering UI shell (ADR-002: no framework).
// Keeps view code declarative without hand-copying createElement boilerplate.

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

/** Light/Dark segmented theme toggle. FEAT-001 flips data-theme only;
 *  OS default + persistence are FEAT-007. */
export function themeToggle(): HTMLElement {
  const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  const toggle = el("div", "toggle");
  const light = el("button", `seg-opt${current === "light" ? " on" : ""}`, "Light");
  const dark = el("button", `seg-opt${current === "dark" ? " on" : ""}`, "Dark");
  light.type = "button";
  dark.type = "button";
  const apply = (theme: "light" | "dark") => {
    document.documentElement.setAttribute("data-theme", theme);
    light.classList.toggle("on", theme === "light");
    dark.classList.toggle("on", theme === "dark");
  };
  light.addEventListener("click", () => apply("light"));
  dark.addEventListener("click", () => apply("dark"));
  toggle.append(light, dark);
  return toggle;
}

/** Standard top bar: wordmark + theme toggle (plan IA — present on every screen). */
export function topbar(): HTMLElement {
  const bar = el("header", "topbar");
  bar.append(wordmark(), themeToggle());
  return bar;
}
