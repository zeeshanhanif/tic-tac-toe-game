// Stats view — placeholder shell (landing place for FEAT-005 ui-design:
// W/L/D tiles · mode filter · match history — SCR-WEB-004).

export function createStatsView(): HTMLElement {
  const root = document.createElement("section");
  root.className = "view";

  const title = document.createElement("h1");
  title.className = "view__title";
  title.textContent = "Statistics";

  const note = document.createElement("p");
  note.className = "muted";
  note.textContent = "Placeholder — stats tiles and match history are built in FEAT-005 (SCR-WEB-004).";

  root.append(title, note);
  return root;
}
