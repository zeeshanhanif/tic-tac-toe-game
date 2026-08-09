# UI Design: FEAT-005 — Statistics & History view

> Feature from: docs/implementation-plan.md · Pairs with: technical-design.md
> Screens: SCR-WEB-004 (new) · Mode: per-feature · Status: Draft · Date: 2026-08-08

SCR-WEB-004 exists in the Claude Design source ("Stats Screen") → **registered**
(Strategy A). It composes from existing system components (stat-tile,
history-list, result-badge, back-button, segmented control) — no new component,
no escalation. The **empty state** is not in the mockup → code-native supplement.
The **reset control** on this screen is **deferred to FEAT-006** (SCR-WEB-005).

## SCR-WEB-004 — Statistics & History

- **Strategy & source:** registered — Claude Design `Stats Screen.dc.html`.
- **Composition** (design.md §4): top bar (`wordmark` + **`back` pill**
  "‹ Back to game"); `hero` (h1 "Statistics" + sub "N games played · X% win
  rate"); **`seg` filter** (All / Vs. Computer / 2 Players); **`tiles`** — three
  `stat-tile`s (Wins green, Losses orange, Draws muted); "Recent matches"
  `label`; **`history`** list of `hrow`s, each with a `rbadge` (Win/Loss/Draw),
  `hmeta` (mode title + sub e.g. "Hard AI" / "Local match"), and `htime`
  (relative time). Centered 460px column, 22px rhythm.
- **Content & data mapping:** all reads from `statsStore.snapshot()` (FEAT-004):
  tiles ← `core.summarize(state, filter)`; history rows ←
  `core.filterHistory(state, filter)` (newest first); hero counts ← the same
  summary. Filter is UI-local (default "All"). No writes.
- **Conformance:** pass. Corrections:
  - small text (`.tile .lbl`, `.hmeta .ms`, `.htime`, history meta) →
    `--color-mutedStrong` (AA; design.md §5/§9). The large `.tile.draw .num`
    keeps `--muted` (large-text exemption).
  - draw `rbadge` background raw `#EEEAE1` → **`--color-surface2`** (nearest
    system neutral) with `--color-mutedStrong` text — token, not raw value.
  - **Reset button + note omitted** — the reset control (and its confirm dialog
    SCR-WEB-005) is FEAT-006. Recorded as a state gap, not built here.
  - focus rings on the back pill, filter buttons, and (FEAT-006) reset, per §9.

### populated
The default state (source): tiles show the filter's W/L/D; the history list shows
recent matches newest-first. Time is relative ("2m ago", "Yesterday").

### filtered by mode
The `seg` filter re-renders both the tiles and the history for All / Vs. Computer
/ 2 Players (FR-STATS-003/004 segmentation).

### empty (code-native supplement — not in source)
When there are no recorded games (fresh store, UC-06 2a): tiles show **0 / 0 / 0**,
the hero reads "No games yet", and the history area shows a neutral empty message
("Play a game to see it here.") instead of rows. No crash.

## Cross-screen

- **"View stats & history" entry point** — a footer link on **SCR-WEB-001
  (Setup)** and **SCR-WEB-002 (Game)** opens this screen (FR-UI-002). It was in
  the source footers (FEAT-001/002 omitted it; wired now). The **back pill**
  returns; from Game it preserves the game (technical-design D1). This is
  navigation wiring, not a new screen — noted on the existing entries via the
  contract bindings, not a manifest state change.

## Escalations & open items

- **None.** All components are system components first realized here. Reset
  (button + SCR-WEB-005 dialog) is FEAT-006 — a recorded gap on SCR-WEB-004, not
  a defect.
