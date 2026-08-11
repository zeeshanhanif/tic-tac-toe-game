# UI Design: FEAT-007 — Light/dark theming

> Feature: FEAT-007 · Epic: EPIC-SHELL
> Technical design: technical-design.md (contracts §3) · Realizes UC-08
> Screens: **no new SCR** — the global theme toggle across existing screen
> headers; the only presentation change is a **SCR-WEB-004 (Stats) header
> supplement** (add the toggle)
> Design authority: docs/design.md §4 `.toggle` component; ux-foundations §IA
> ("the theme toggle is global … present on every screen")
> Status: Draft · Date: 2026-08-10

## Strategy resolution

- **No new screen.** FEAT-007 realizes UC-08 through the **`.toggle`** component,
  which already exists in design.md §4 and is already present on **SCR-WEB-001
  (Setup)** and **SCR-WEB-002/003 (Game / Game-Result)** via the shared
  `topbar()` (wordmark + toggle). Those manifest entries are unchanged.
- **The one gap:** **SCR-WEB-004 (Stats)** renders its own header (wordmark +
  "Back to game") and **omits the toggle** — yet ux-foundations says the toggle
  is "global … present on every screen" (§IA lines 96, 168–169) and the plan
  scopes FEAT-007 as a "global toggle (present on every screen)". So the Stats
  header gains the toggle.
- **Resolution:** **code-native supplement** to SCR-WEB-004 (policy fallback;
  matches how the reset trigger was added in FEAT-006). The component itself is
  already conformant — no new design, no escalation.

## Component conformance — `.toggle` (unchanged)

Per design.md §4: pill (radius 999), `--surface`, `--line`, 3px padding,
`--shadow`; two spans **Light / Dark** at 13/700; active `.on` → `--ink` fill,
white text; **implemented as two real buttons** for a11y (already so in
`ui/dom.ts` `themeToggle()`). FEAT-007 changes the toggle's **behavior**
(persist + OS-default via the Theme Controller, technical-design §3) — **not its
presentation**. No token or component change; the FEAT-006 `--scrim` amendment is
unrelated.

## SCR-WEB-004 supplement — toggle in the Stats header

- **Before:** `topBar()` = `wordmark()` + `.back` ("‹ Back to game").
- **After:** `wordmark()` (left) + a right-aligned cluster of **`.back`** and the
  **`.toggle`**. Both controls keep their design.md specs; the header stays one
  flex row within the 460px column.
- **Placement (U1):** toggle right-most, Back to its left — Back is the primary
  nav affordance for this screen, the toggle is the global utility. On the
  narrowest widths (≤360px) the cluster wraps below the wordmark (flex-wrap),
  never overflowing the column (FR-UI-001).
- **States:** the toggle reflects the **active theme** (`.on` on Light or Dark)
  read from the Theme Controller (`getTheme()`, technical-design §3.2); switching
  re-themes the Stats view instantly like every other screen (AC-1).

## Global presence (confirmation, no change)

| Screen | Header | Toggle source |
| :----- | :----- | :------------ |
| SCR-WEB-001 Setup | wordmark + toggle | `topbar()` — unchanged |
| SCR-WEB-002 Game (In Play) | wordmark + toggle | `topbar()` — unchanged |
| SCR-WEB-003 Game (Result) | wordmark + toggle | `topbar()` (same game view) — unchanged |
| **SCR-WEB-004 Stats** | wordmark + back **+ toggle** | **this supplement** |
| SCR-WEB-005 Reset dialog | modal (no header) | n/a — transient dialog, not a screen |

## Contract bindings (from technical-design.md §3)

| UI element | Binds to |
| :--------- | :------- |
| Toggle `.on` state (any screen) | `getTheme()` (§3.2) |
| Toggle click | `setTheme("light"\|"dark")` → apply + persist (§3.1/§3.2) |
| First paint | inline `<head>` init + `initTheme()` set `data-theme` (§3.3) |

## Decisions

- **U1 — Stats header keeps Back and gains the toggle (Back left, toggle right).**
  Reconciles ux-foundations' per-screen sketch (which listed only Back for Stats)
  with its own governing rule that the toggle is global. Driver: FR-THEME-001 +
  the plan's "present on every screen." Not a fork — the normative "global"
  statement is the authority; the sketch was illustrative.

## Escalations

- **None.** The `.toggle` component is unchanged and conformant; the Stats
  supplement composes existing components; no off-system value introduced.

## Handoff

- Realized during **feature-implementation** (tasks.md T3 adds the toggle to
  `ui/views/stats.ts`; T2 makes the toggle behavior persistent). No new CSS
  component — reuse `.toggle` / `.topbar` styles.
- Manifest updated: SCR-WEB-004 gains a `theme-toggle` header supplement; other
  screen entries unchanged (already carry the toggle).
</content>
