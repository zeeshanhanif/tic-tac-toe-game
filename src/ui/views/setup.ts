// Setup view — placeholder shell (landing place for FEAT-001/002 ui-design:
// mode · difficulty · side · Start Game — SCR-WEB-001).

export function createSetupView(): HTMLElement {
  const root = document.createElement("section");
  root.className = "view";

  const title = document.createElement("h1");
  title.className = "view__title";
  title.textContent = "Setup";

  const note = document.createElement("p");
  note.className = "muted";
  note.textContent = "Placeholder — mode, difficulty, and side selection are built in FEAT-001/002 (SCR-WEB-001).";

  root.append(title, note);
  return root;
}
